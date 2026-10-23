package com.dework.inventoryservice.kafka;

import com.dework.inventoryservice.event.InventoryFailedEvent;
import com.dework.inventoryservice.event.InventoryReservedEvent;
import com.dework.inventoryservice.event.OrderCancelledEvent;
import com.dework.inventoryservice.event.OrderCreatedEvent;
import com.dework.inventoryservice.event.PaymentFailedEvent;
import com.dework.inventoryservice.event.PaymentSuccessEvent;
import com.dework.inventoryservice.service.InventoryReservationService;
import com.dework.inventoryservice.service.InventoryReservationService.ReservationResult;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class InventoryEventListener {

    private final InventoryReservationService inventoryReservationService;
    private final InventoryEventProducer inventoryEventProducer;
    private final ObjectMapper objectMapper;

    /**
     * Lắng nghe các event từ order-events
     */
    @KafkaListener(topics = "order-events", groupId = "inventory-group")
    public void handleOrderEvents(String message) {
        log.info("Inventory Service nhận message từ topic order-events: {}", message);
        try {
            JsonNode root = objectMapper.readTree(message);
            // Phân biệt event dựa trên cấu trúc fields
            if (root.has("items")) {
                OrderCreatedEvent event = objectMapper.treeToValue(root, OrderCreatedEvent.class);
                processOrderCreated(event);
            } else if (root.has("reason") && root.has("orderCode")) {
                OrderCancelledEvent event = objectMapper.treeToValue(root, OrderCancelledEvent.class);
                inventoryReservationService.releaseInventory(event.getOrderCode(), event.getReason());
            }
        } catch (Exception e) {
            log.error("Lỗi khi xử lý message từ order-events: {}", e.getMessage(), e);
        }
    }

    private void processOrderCreated(OrderCreatedEvent event) {
        ReservationResult result = inventoryReservationService.reserveInventory(event);

        if (result.success()) {
            // Giữ hàng thành công -> Phát InventoryReservedEvent
            InventoryReservedEvent reservedEvent = InventoryReservedEvent.builder()
                    .orderCode(event.getOrderCode())
                    .paymentMethod(event.getPaymentMethod())
                    .totalAmount(event.getTotalAmount())
                    .build();
            inventoryEventProducer.publishInventoryReserved(reservedEvent);
        } else {
            // Hết hàng hoặc không khả dụng -> Phát InventoryFailedEvent
            InventoryFailedEvent failedEvent = InventoryFailedEvent.builder()
                    .orderCode(event.getOrderCode())
                    .reason(result.message())
                    .build();
            inventoryEventProducer.publishInventoryFailed(failedEvent);
        }
    }

    /**
     * Lắng nghe các event từ payment-events
     */
    @KafkaListener(topics = "payment-events", groupId = "inventory-group")
    public void handlePaymentEvents(String message) {
        log.info("Inventory Service nhận message từ topic payment-events: {}", message);
        try {
            JsonNode root = objectMapper.readTree(message);
            String orderCode = root.has("orderCode") ? root.get("orderCode").asText() : null;
            if (orderCode == null || orderCode.isBlank()) return;

            // Nếu có trường reason hoặc không có transactionCode hợp lệ -> Coi là PaymentFailed
            if (root.has("reason") && !root.get("reason").isNull()) {
                PaymentFailedEvent failedEvent = objectMapper.treeToValue(root, PaymentFailedEvent.class);
                log.info("Nhận PaymentFailedEvent cho đơn hàng: {}. Kích hoạt bù trừ kho!", orderCode);
                inventoryReservationService.releaseInventory(orderCode, failedEvent.getReason());
            } else {
                PaymentSuccessEvent successEvent = objectMapper.treeToValue(root, PaymentSuccessEvent.class);
                log.info("Nhận PaymentSuccessEvent cho đơn hàng: {}. Xác nhận xuất kho thành công!", orderCode);
                inventoryReservationService.confirmInventory(orderCode);
            }
        } catch (Exception e) {
            log.error("Lỗi khi xử lý message từ payment-events: {}", e.getMessage(), e);
        }
    }
}
