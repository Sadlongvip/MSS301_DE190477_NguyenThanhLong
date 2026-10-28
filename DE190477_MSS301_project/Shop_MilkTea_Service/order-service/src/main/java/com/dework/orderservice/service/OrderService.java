package com.dework.orderservice.service;

import com.dework.orderservice.dto.inventory.TeaSizeClientDto;
import com.dework.orderservice.dto.inventory.ToppingClientDto;
import com.dework.orderservice.dto.order.CreateOrderRequest;
import com.dework.orderservice.dto.order.OrderItemRequest;
import com.dework.orderservice.dto.order.OrderResponse;
import com.dework.orderservice.dto.order.UpdateOrderStatusRequest;
import com.dework.orderservice.exception.ApiException;
import com.dework.orderservice.event.OrderCancelledEvent;
import com.dework.orderservice.event.OrderCreatedEvent;
import com.dework.orderservice.event.OrderItemPayload;
import com.dework.orderservice.kafka.OrderEventProducer;
import com.dework.orderservice.model.Order;
import com.dework.orderservice.model.OrderItem;
import com.dework.orderservice.model.OrderStatus;
import com.dework.orderservice.model.PaymentMethod;
import com.dework.orderservice.model.PaymentStatus;
import com.dework.orderservice.model.SagaLog;
import com.dework.orderservice.repository.CartRepository;
import com.dework.orderservice.repository.OrderRepository;
import com.dework.orderservice.repository.SagaLogRepository;
import com.dework.orderservice.service.PriceVerificationService.VerifiedProductInfo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.dework.orderservice.model.SagaStatus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.retry.RetryException;
import org.springframework.core.retry.RetryPolicy;
import org.springframework.core.retry.RetryTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final PriceVerificationService priceVerificationService;
    private final OrderEventProducer orderEventProducer;
    private final SagaLogRepository sagaLogRepository;

    @Value("${saga.demo.simulate-compensation-failure:false}")
    private boolean simulateCompensationFailure;

    // Spring Framework 7: RetryTemplate có sẵn trong spring-core (không cần thư viện spring-retry).
    // maxRetries(2) = 1 lần chạy đầu + 2 lần thử lại = tối đa 3 lần, cách nhau 1 giây (chuẩn Slot 13 KB8).
    private final RetryTemplate compensationRetry = new RetryTemplate(
            RetryPolicy.builder()
                    .includes(Exception.class)
                    .maxRetries(2)
                    .delay(Duration.ofSeconds(1))
                    .build());

    private static final DateTimeFormatter ORDER_CODE_DATE_FORMAT = DateTimeFormatter.ofPattern("yyMMddHHmmss");

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request, Long currentUserId) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw ApiException.badRequest("Đơn hàng phải chứa ít nhất một sản phẩm");
        }

        String randomSuffix = UUID.randomUUID().toString().replace("-", "").substring(0, 4).toUpperCase();
        String orderCode = "ORD-" + LocalDateTime.now().format(ORDER_CODE_DATE_FORMAT) + "-" + randomSuffix;

        List<TeaSizeClientDto> allSizes = priceVerificationService.getAllSizes();
        List<ToppingClientDto> allToppings = priceVerificationService.getAllToppings();

        List<OrderItem> items = request.getItems().stream().map(reqItem -> {
            VerifiedProductInfo verified = priceVerificationService.verifyItemPrice(
                    reqItem.getMilkTeaId(),
                    reqItem.getSize(),
                    reqItem.getToppings(),
                    reqItem.getUnitPrice(),
                    allSizes,
                    allToppings
            );

            double totalPrice = verified.getVerifiedUnitPrice() * reqItem.getQuantity();
            return OrderItem.builder()
                    .milkTeaId(verified.getMilkTeaId())
                    .milkTeaName(verified.getMilkTeaName())
                    .size(reqItem.getSize())
                    .sugar(reqItem.getSugar())
                    .ice(reqItem.getIce())
                    .toppings(reqItem.getToppings())
                    .quantity(reqItem.getQuantity())
                    .unitPrice(verified.getVerifiedUnitPrice())
                    .totalPrice(totalPrice)
                    .image(reqItem.getImage() != null && !reqItem.getImage().isBlank() ? reqItem.getImage() : verified.getImage())
                    .note(reqItem.getNote())
                    .build();
        }).collect(Collectors.toCollection(ArrayList::new));

        double subtotal = items.stream().mapToDouble(OrderItem::getTotalPrice).sum();
        double shippingFee = request.getShippingFee();
        double discountAmount = request.getDiscountAmount();
        double totalAmount = Math.max(0.0, subtotal + shippingFee - discountAmount);

        PaymentMethod paymentMethod = request.getPaymentMethod() != null ? request.getPaymentMethod() : PaymentMethod.COD;

        Order order = Order.builder()
                .orderCode(orderCode)
                .userId(currentUserId)
                .customerName(request.getCustomerName().trim())
                .phoneNumber(request.getPhoneNumber().trim())
                .shippingAddress(request.getShippingAddress().trim())
                .note(request.getNote())
                .voucherCode(request.getVoucherCode())
                .shippingFee(shippingFee)
                .discountAmount(discountAmount)
                .subtotal(subtotal)
                .totalAmount(totalAmount)
                .paymentMethod(paymentMethod)
                .paymentStatus(PaymentStatus.UNPAID)
                .status(OrderStatus.PENDING)
                .sagaStatus(SagaStatus.EXECUTING)
                .items(items)
                .build();

        Order saved = orderRepository.save(order);
        log.info("Order created successfully: orderCode={}, totalAmount={}", saved.getOrderCode(), saved.getTotalAmount());

        // Dọn giỏ hàng nếu người dùng vừa đặt hàng xong
        if (currentUserId != null) {
            cartRepository.findByUserId(currentUserId).ifPresent(cart -> {
                cart.getItems().clear();
                cart.recalculateTotals();
                cartRepository.save(cart);
                log.info("Cleared cart for userId={}", currentUserId);
            });
        } else if (request.getSessionId() != null && !request.getSessionId().isBlank()) {
            cartRepository.findBySessionId(request.getSessionId().trim()).ifPresent(cart -> {
                cart.getItems().clear();
                cart.recalculateTotals();
                cartRepository.save(cart);
                log.info("Cleared guest cart for sessionId={}", request.getSessionId());
            });
        }

        // Phát event OrderCreatedEvent sang Kafka (Saga Choreography)
        List<OrderItemPayload> eventItems = saved.getItems().stream().map(i -> OrderItemPayload.builder()
                .milkTeaId(i.getMilkTeaId())
                .milkTeaName(i.getMilkTeaName())
                .quantity(i.getQuantity())
                .unitPrice(i.getUnitPrice())
                .size(i.getSize())
                .toppings(i.getToppings())
                .build()).toList();

        orderEventProducer.publishOrderCreated(OrderCreatedEvent.builder()
                .orderCode(saved.getOrderCode())
                .userId(saved.getUserId())
                .customerName(saved.getCustomerName())
                .phoneNumber(saved.getPhoneNumber())
                .shippingAddress(saved.getShippingAddress())
                .paymentMethod(saved.getPaymentMethod() != null ? saved.getPaymentMethod().name() : "COD")
                .totalAmount(saved.getTotalAmount())
                .items(eventItems)
                .build());

        logSaga(saved.getOrderCode(), "ORDER_CREATED", "SUCCESS", "Đã tạo đơn hàng thành công và phát OrderCreatedEvent sang Kafka");

        return OrderResponse.from(saved);
    }

    public OrderResponse getOrderByCode(String orderCode) {
        return OrderResponse.from(findOrderByCode(orderCode));
    }

    public List<SagaLog> getSagaLogs(String orderCode) {
        return sagaLogRepository.findByOrderCodeOrderByIdAsc(orderCode);
    }

    @Transactional
    public void logSaga(String orderCode, String step, String result, String message) {
        sagaLogRepository.save(new SagaLog(orderCode, step, result, message));
    }

    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy đơn hàng với ID: " + id));
        return OrderResponse.from(order);
    }

    public List<OrderResponse> getMyOrders(Long userId) {
        if (userId == null) {
            throw ApiException.unauthorized("Vui lòng đăng nhập để xem lịch sử đơn hàng của bạn");
        }
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(OrderResponse::from)
                .toList();
    }

    public Page<OrderResponse> searchOrders(OrderStatus status, PaymentStatus paymentStatus, String keyword, Pageable pageable) {
        String trimmedKeyword = (keyword != null && !keyword.isBlank()) ? keyword.trim() : null;
        return orderRepository.searchOrders(status, paymentStatus, trimmedKeyword, pageable)
                .map(OrderResponse::from);
    }

    @Transactional
    public OrderResponse updateOrderStatus(String orderCode, UpdateOrderStatusRequest request) {
        Order order = findOrderByCode(orderCode);

        if (order.getStatus() == OrderStatus.COMPLETED) {
            throw ApiException.badRequest("Đơn hàng đã hoàn thành, không thể thay đổi trạng thái");
        }
        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw ApiException.badRequest("Đơn hàng đã bị hủy, không thể thay đổi trạng thái");
        }

        OrderStatus newStatus = request.getStatus();
        if (newStatus == OrderStatus.CANCELLED) {
            if (request.getCancelReason() == null || request.getCancelReason().isBlank()) {
                throw ApiException.badRequest("Vui lòng nhập lý do hủy đơn hàng");
            }
            order.setCancelReason(request.getCancelReason().trim());
        }

        order.setStatus(newStatus);
        Order updated = orderRepository.save(order);
        log.info("Order status updated: orderCode={}, newStatus={}", orderCode, newStatus);
        return OrderResponse.from(updated);
    }

    @Transactional
    public OrderResponse updatePaymentStatus(String orderCode, String paymentStatusStr) {
        Order order = findOrderByCode(orderCode);

        PaymentStatus targetStatus;
        try {
            targetStatus = PaymentStatus.valueOf(paymentStatusStr.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw ApiException.badRequest("Trạng thái thanh toán không hợp lệ: " + paymentStatusStr);
        }

        order.setPaymentStatus(targetStatus);

        // Tự động xác nhận đơn nếu thanh toán thành công và đơn đang chờ xác nhận
        if (targetStatus == PaymentStatus.PAID && order.getStatus() == OrderStatus.PENDING) {
            order.setStatus(OrderStatus.CONFIRMED);
            log.info("Order {} automatically CONFIRMED after payment success", orderCode);
        }

        Order updated = orderRepository.save(order);
        log.info("Order paymentStatus updated: orderCode={}, newPaymentStatus={}", orderCode, targetStatus);
        return OrderResponse.from(updated);
    }

    @Transactional
    public OrderResponse cancelOrder(String orderCode, String reason, Long currentUserId, boolean isAdmin) {
        Order order = findOrderByCode(orderCode);

        if (!isAdmin) {
            if (order.getUserId() == null || !order.getUserId().equals(currentUserId)) {
                throw ApiException.forbidden("Bạn không có quyền hủy đơn hàng này");
            }
            if (order.getStatus() != OrderStatus.PENDING) {
                throw ApiException.badRequest("Chỉ có thể hủy đơn hàng khi đơn đang ở trạng thái Chờ xác nhận (PENDING)");
            }
        } else {
            if (order.getStatus() == OrderStatus.COMPLETED || order.getStatus() == OrderStatus.CANCELLED) {
                throw ApiException.badRequest("Đơn hàng đã kết thúc (" + order.getStatus() + "), không thể hủy");
            }
        }

        String cancelReason = (reason != null && !reason.isBlank()) ? reason.trim() : "Khách hàng yêu cầu hủy đơn";
        order.setStatus(OrderStatus.CANCELLED);
        order.setSagaStatus(SagaStatus.COMPENSATED);
        order.setCancelReason(cancelReason);

        Order updated = orderRepository.save(order);
        log.info("Order cancelled: orderCode={}, reason={}, byUser={}", orderCode, cancelReason, currentUserId);

        // Phát OrderCancelledEvent để kho hoàn trả tồn kho (Compensating Transaction)
        orderEventProducer.publishOrderCancelled(OrderCancelledEvent.builder()
                .orderCode(orderCode)
                .reason(cancelReason)
                .build());

        logSaga(orderCode, "CANCEL_ORDER", "SUCCESS", "Đơn hàng đã hủy bởi người dùng/admin, gửi event bồi hoàn kho");
        return OrderResponse.from(updated);
    }

    /**
     * Xử lý khi kho phản hồi thất bại (InventoryFailedEvent)
     * Áp dụng cơ chế Compensation với Retry tối đa 3 lần (chuẩn Slot 13 KB8)
     */
    @Transactional
    public void processInventoryFailed(String orderCode, String reason) {
        Order order = findOrderByCode(orderCode);
        order.setSagaStatus(SagaStatus.COMPENSATING);
        orderRepository.save(order);
        logSaga(orderCode, "RESERVE_INVENTORY", "FAILED", "Kho không thể đáp ứng: " + reason);

        // Chạy bù trừ với Retry tối đa 3 lần (Slide 25 & Slot 13 KB8)
        boolean allOk = runCompensationWithRetry(orderCode, () -> {
            if (simulateCompensationFailure) {
                throw new IllegalStateException("Giả lập lỗi mạng/dịch vụ trong quá trình bù trừ Saga (KB8)");
            }
        });

        if (!allOk) {
            // Giữ nguyên COMPENSATING để admin/job quét xử lý tiếp, KHÔNG báo CANCELLED/COMPENSATED giả
            log.error("Compensation cho orderCode={} chưa xong sau 3 lần retry, dừng ở COMPENSATING để xử lý thủ công (EXT-4)", orderCode);
            return;
        }

        order.setStatus(OrderStatus.CANCELLED);
        order.setSagaStatus(SagaStatus.COMPENSATED);
        order.setCancelReason("Kho không thể đáp ứng: " + reason);
        orderRepository.save(order);
        logSaga(orderCode, "COMPENSATION", "CANCELLED", "Saga Rollback: Đơn hàng tự động hủy do kho thất bại");
        log.info("Saga Rollback: Đơn hàng {} đã tự động hủy do kho không đủ hàng/ngưng bán. Lý do: {}", orderCode, reason);
    }

    /**
     * Xử lý khi thanh toán online thất bại (PaymentFailedEvent)
     * Bồi hoàn hoàn kho qua Kafka event với Retry tối đa 3 lần (chuẩn Slot 13 KB8)
     */
    @Transactional
    public void processPaymentFailed(String orderCode, String reason) {
        Order order = findOrderByCode(orderCode);
        order.setSagaStatus(SagaStatus.COMPENSATING);
        order.setPaymentStatus(PaymentStatus.FAILED);
        orderRepository.save(order);
        logSaga(orderCode, "PROCESS_PAYMENT", "FAILED", "Thanh toán thất bại: " + reason);

        // Bù trừ kho: phát OrderCancelledEvent sang Kafka topic để inventory release kho
        boolean allOk = runCompensationWithRetry(orderCode, () -> {
            if (simulateCompensationFailure) {
                throw new IllegalStateException("Giả lập lỗi mạng/dịch vụ trong quá trình bù trừ Saga (KB8)");
            }
            orderEventProducer.publishOrderCancelled(OrderCancelledEvent.builder()
                    .orderCode(orderCode)
                    .reason("Thanh toán thất bại: " + reason)
                    .build());
        });

        if (!allOk) {
            log.error("Compensation cho orderCode={} chưa xong sau 3 lần retry, dừng ở COMPENSATING để xử lý thủ công (EXT-4)", orderCode);
            return;
        }

        order.setStatus(OrderStatus.CANCELLED);
        order.setSagaStatus(SagaStatus.COMPENSATED);
        order.setCancelReason("Thanh toán thất bại: " + reason);
        orderRepository.save(order);
        logSaga(orderCode, "COMPENSATION", "CANCELLED", "Saga Rollback: Đơn hàng tự động hủy do thanh toán lỗi");
        log.info("Saga Rollback: Đơn hàng {} đã tự động hủy do thanh toán lỗi: {}", orderCode, reason);
    }

    /**
     * [EXT-4] Khôi phục Saga bị treo (dành cho KB8 và các sự cố mạng kéo dài)
     * Thử bồi hoàn lại cho các đơn hàng có sagaStatus = COMPENSATING
     */
    @Transactional
    public boolean recoverCompensation(String orderCode) {
        Order order = findOrderByCode(orderCode);
        if (order == null || order.getSagaStatus() == SagaStatus.COMPLETED || order.getSagaStatus() == SagaStatus.COMPENSATED) {
            return false;
        }

        log.info("Bắt đầu quy trình khôi phục Saga (Recovery EXT-4) cho đơn hàng: {}", orderCode);
        boolean allOk = runCompensationWithRetry(orderCode, () -> {
            orderEventProducer.publishOrderCancelled(OrderCancelledEvent.builder()
                    .orderCode(orderCode)
                    .reason("Khôi phục bù trừ đơn hàng bị treo (EXT-4)")
                    .build());
        });

        if (allOk) {
            order.setStatus(OrderStatus.CANCELLED);
            order.setSagaStatus(SagaStatus.COMPENSATED);
            if (order.getCancelReason() == null || order.getCancelReason().isBlank()) {
                order.setCancelReason("Đã khôi phục và hủy đơn thành công sau khi xử lý bù trừ");
            }
            orderRepository.save(order);
            logSaga(orderCode, "CANCEL_ORDER", "SUCCESS", "Saga RECOVERED -> COMPENSATED");
            log.info("Khôi phục Saga thành công cho đơn hàng: {}", orderCode);
            return true;
        } else {
            log.warn("Khôi phục Saga cho đơn hàng {} chưa hoàn tất do lỗi trong quá trình bồi hoàn", orderCode);
            return false;
        }
    }

    /**
     * Thực thi bồi hoàn với cơ chế tự động Retry tối đa 3 lần (Slot 13: 1 lần đầu + 2 lần thử lại)
     * Ghi nhận chi tiết từng lần thất bại/thành công vào bảng SagaLog
     */
    public boolean runCompensationWithRetry(String orderCode, Runnable action) {
        AtomicInteger attempt = new AtomicInteger();
        try {
            compensationRetry.execute(() -> {
                int n = attempt.incrementAndGet();
                try {
                    action.run();
                } catch (Exception ex) {
                    logSaga(orderCode, "COMPENSATION", "FAILED", "Lần thứ " + n + ": " + ex.getMessage());
                    throw ex; // Ném lại để RetryTemplate thực hiện thử lần tiếp theo
                }
                logSaga(orderCode, "COMPENSATION", "SUCCESS", "Lần thứ " + n);
                return null;
            });
            return true;
        } catch (RetryException ex) { // Đã hết số lần thử (3 lần)
            return false;
        }
    }

    @Transactional
    public void updateSagaStatus(String orderCode, SagaStatus sagaStatus) {
        Order order = findOrderByCode(orderCode);
        order.setSagaStatus(sagaStatus);
        orderRepository.save(order);
    }

    public Order findOrderByCode(String orderCode) {
        return orderRepository.findByOrderCode(orderCode.trim())
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy đơn hàng với mã: " + orderCode));
    }
}
