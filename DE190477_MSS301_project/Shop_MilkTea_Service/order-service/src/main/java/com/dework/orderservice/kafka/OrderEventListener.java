package com.dework.orderservice.kafka;

import com.dework.orderservice.event.InventoryFailedEvent;
import com.dework.orderservice.event.InventoryReservedEvent;
import com.dework.orderservice.event.PaymentFailedEvent;
import com.dework.orderservice.event.PaymentSuccessEvent;
import com.dework.orderservice.model.Order;
import com.dework.orderservice.model.OrderStatus;
import com.dework.orderservice.model.PaymentMethod;
import com.dework.orderservice.model.PaymentStatus;
import com.dework.orderservice.repository.OrderRepository;
import com.dework.orderservice.service.OrderService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderEventListener {

    private final OrderRepository orderRepository;
    private final OrderService orderService;
    private final ObjectMapper objectMapper;

    /**
     * Lắng nghe các event từ inventory-events
     */
    @KafkaListener(topics = "inventory-events", groupId = "order-group")
    @Transactional
    public void handleInventoryEvents(String message) {
        log.info("Order Service nhận message từ topic inventory-events: {}", message);
        try {
            JsonNode root = objectMapper.readTree(message);
            String orderCode = root.has("orderCode") ? root.get("orderCode").asText() : null;
            if (orderCode == null || orderCode.isBlank()) return;

            Order order = orderRepository.findByOrderCode(orderCode).orElse(null);
            if (order == null) {
                log.warn("Không tìm thấy đơn hàng với orderCode: {}", orderCode);
                return;
            }

            // Nếu có trường reason -> Kho kiểm tra thất bại (InventoryFailedEvent)
            if (root.has("reason") && !root.get("reason").isNull()) {
                InventoryFailedEvent failedEvent = objectMapper.treeToValue(root, InventoryFailedEvent.class);
                order.setStatus(OrderStatus.CANCELLED);
                order.setCancelReason("Kho không thể đáp ứng: " + failedEvent.getReason());
                orderRepository.save(order);
                orderService.logSaga(orderCode, "RESERVE_INVENTORY", "FAILED", "Kho không thể đáp ứng: " + failedEvent.getReason());
                orderService.logSaga(orderCode, "COMPENSATION", "CANCELLED", "Saga Rollback: Đơn hàng tự động hủy do kho thất bại");
                log.info("Saga Rollback: Đơn hàng {} đã tự động hủy do kho không đủ hàng/ngưng bán. Lý do: {}", orderCode, failedEvent.getReason());
            } else {
                // Kho giữ hàng thành công (InventoryReservedEvent)
                InventoryReservedEvent reservedEvent = objectMapper.treeToValue(root, InventoryReservedEvent.class);
                if (order.getPaymentMethod() == PaymentMethod.COD) {
                    order.setStatus(OrderStatus.CONFIRMED);
                    orderRepository.save(order);
                    orderService.logSaga(orderCode, "RESERVE_INVENTORY", "SUCCESS", "Kho đã giữ hàng thành công (COD)");
                    orderService.logSaga(orderCode, "SAGA_COMPLETED", "CONFIRMED", "Đơn hàng COD được xác nhận thành công");
                    log.info("Saga Happy Path (COD): Kho đã giữ hàng thành công, đơn hàng {} được xác nhận CONFIRMED", orderCode);
                } else {
                    orderService.logSaga(orderCode, "RESERVE_INVENTORY", "SUCCESS", "Kho đã giữ hàng thành công, tiếp tục chờ thanh toán online...");
                    log.info("Saga Progression: Kho đã giữ hàng thành công cho đơn {}, tiếp tục chờ thanh toán online...", orderCode);
                }
            }
        } catch (Exception e) {
            log.error("Lỗi khi xử lý message từ inventory-events: {}", e.getMessage(), e);
        }
    }

    /**
     * Lắng nghe các event từ payment-events
     */
    @KafkaListener(topics = "payment-events", groupId = "order-group")
    @Transactional
    public void handlePaymentEvents(String message) {
        log.info("Order Service nhận message từ topic payment-events: {}", message);
        try {
            JsonNode root = objectMapper.readTree(message);
            String orderCode = root.has("orderCode") ? root.get("orderCode").asText() : null;
            if (orderCode == null || orderCode.isBlank()) return;

            Order order = orderRepository.findByOrderCode(orderCode).orElse(null);
            if (order == null) {
                log.warn("Không tìm thấy đơn hàng với orderCode: {}", orderCode);
                return;
            }

            // Nếu có trường reason -> Thanh toán thất bại (PaymentFailedEvent)
            if (root.has("reason") && !root.get("reason").isNull()) {
                PaymentFailedEvent failedEvent = objectMapper.treeToValue(root, PaymentFailedEvent.class);
                order.setStatus(OrderStatus.CANCELLED);
                order.setPaymentStatus(PaymentStatus.FAILED);
                order.setCancelReason("Thanh toán thất bại: " + failedEvent.getReason());
                orderRepository.save(order);
                orderService.logSaga(orderCode, "PROCESS_PAYMENT", "FAILED", "Thanh toán thất bại: " + failedEvent.getReason());
                orderService.logSaga(orderCode, "COMPENSATION", "CANCELLED", "Saga Rollback: Đơn hàng tự động hủy do thanh toán lỗi");
                log.info("Saga Rollback: Đơn hàng {} đã tự động hủy do thanh toán lỗi: {}", orderCode, failedEvent.getReason());
            } else {
                // Thanh toán thành công (PaymentSuccessEvent)
                order.setStatus(OrderStatus.CONFIRMED);
                order.setPaymentStatus(PaymentStatus.PAID);
                orderRepository.save(order);
                orderService.logSaga(orderCode, "PROCESS_PAYMENT", "SUCCESS", "Thanh toán online thành công");
                orderService.logSaga(orderCode, "SAGA_COMPLETED", "CONFIRMED", "Đơn hàng hoàn tất chuỗi Saga thành công");
                log.info("Saga Happy Path: Thanh toán thành công cho đơn hàng {}, trạng thái chuyển sang CONFIRMED và PAID", orderCode);
            }
        } catch (Exception e) {
            log.error("Lỗi khi xử lý message từ payment-events: {}", e.getMessage(), e);
        }
    }
}
