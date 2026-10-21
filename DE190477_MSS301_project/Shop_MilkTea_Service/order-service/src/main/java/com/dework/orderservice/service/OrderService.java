package com.dework.orderservice.service;

import com.dework.orderservice.dto.inventory.TeaSizeClientDto;
import com.dework.orderservice.dto.inventory.ToppingClientDto;
import com.dework.orderservice.dto.order.CreateOrderRequest;
import com.dework.orderservice.dto.order.OrderItemRequest;
import com.dework.orderservice.dto.order.OrderResponse;
import com.dework.orderservice.dto.order.UpdateOrderStatusRequest;
import com.dework.orderservice.exception.ApiException;
import com.dework.orderservice.model.Order;
import com.dework.orderservice.model.OrderItem;
import com.dework.orderservice.model.OrderStatus;
import com.dework.orderservice.model.PaymentMethod;
import com.dework.orderservice.model.PaymentStatus;
import com.dework.orderservice.repository.CartRepository;
import com.dework.orderservice.repository.OrderRepository;
import com.dework.orderservice.service.PriceVerificationService.VerifiedProductInfo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final PriceVerificationService priceVerificationService;

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

        return OrderResponse.from(saved);
    }

    public OrderResponse getOrderByCode(String orderCode) {
        return OrderResponse.from(findOrderByCode(orderCode));
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
        order.setCancelReason(cancelReason);

        Order updated = orderRepository.save(order);
        log.info("Order cancelled: orderCode={}, reason={}, byUser={}", orderCode, cancelReason, currentUserId);
        return OrderResponse.from(updated);
    }

    public Order findOrderByCode(String orderCode) {
        return orderRepository.findByOrderCode(orderCode.trim())
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy đơn hàng với mã: " + orderCode));
    }
}
