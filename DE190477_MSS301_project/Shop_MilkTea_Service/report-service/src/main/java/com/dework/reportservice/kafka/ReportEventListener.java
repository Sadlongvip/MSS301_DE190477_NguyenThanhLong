package com.dework.reportservice.kafka;

import com.dework.reportservice.service.ReportSyncService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class ReportEventListener {

    private final ReportSyncService reportSyncService;
    private final ObjectMapper objectMapper;

    /**
     * Lắng nghe các sự kiện đơn hàng từ order-service (topic order-events)
     */
    @KafkaListener(topics = "order-events", groupId = "report-group")
    public void handleOrderEvents(String message) {
        log.info("Report Service nhận message từ topic order-events: {}", message);
        try {
            JsonNode root = objectMapper.readTree(message);
            String orderCode = root.has("orderCode") && !root.get("orderCode").isNull()
                    ? root.get("orderCode").asText()
                    : null;

            if (orderCode == null || orderCode.isBlank()) {
                return;
            }

            // Trường hợp 1: OrderCreatedEvent (chứa items)
            if (root.has("items")) {
                log.info("Report Service: Phát hiện đơn mới {}, bắt đầu đồng bộ vào report_db", orderCode);
                reportSyncService.syncOrderFromOrderService(orderCode);
            }
            // Trường hợp 2: OrderCancelledEvent (chứa reason)
            else if (root.has("reason") && !root.get("reason").isNull()) {
                String reason = root.get("reason").asText();
                log.info("Report Service: Phát hiện đơn hủy {}, lý do: {}", orderCode, reason);
                reportSyncService.updateOrderStatus(orderCode, "CANCELLED", null, reason);
            }
            // Trường hợp 3: OrderStatusUpdatedEvent (chứa status)
            else if (root.has("status") && !root.get("status").isNull()) {
                String status = root.get("status").asText();
                String paymentStatus = root.has("paymentStatus") && !root.get("paymentStatus").isNull()
                        ? root.get("paymentStatus").asText()
                        : null;
                String cancelReason = root.has("cancelReason") && !root.get("cancelReason").isNull()
                        ? root.get("cancelReason").asText()
                        : null;
                log.info("Report Service: Cập nhật trạng thái đơn {}: status={}, paymentStatus={}", orderCode, status, paymentStatus);
                reportSyncService.updateOrderStatus(orderCode, status, paymentStatus, cancelReason);
            }
        } catch (Exception e) {
            log.error("Lỗi khi xử lý message từ order-events trong Report Service: {}", e.getMessage(), e);
        }
    }

    /**
     * Lắng nghe các sự kiện thanh toán từ payment-service (topic payment-events)
     */
    @KafkaListener(topics = "payment-events", groupId = "report-group")
    public void handlePaymentEvents(String message) {
        log.info("Report Service nhận message từ topic payment-events: {}", message);
        try {
            JsonNode root = objectMapper.readTree(message);
            String orderCode = root.has("orderCode") && !root.get("orderCode").isNull()
                    ? root.get("orderCode").asText()
                    : null;

            if (orderCode == null || orderCode.isBlank()) {
                return;
            }

            // Thanh toán thất bại (chứa reason)
            if (root.has("reason") && !root.get("reason").isNull()) {
                log.info("Report Service: Thanh toán thất bại cho đơn {}", orderCode);
                reportSyncService.updatePaymentStatus(orderCode, "FAILED");
            } else {
                // Thanh toán thành công (PaymentSuccessEvent)
                log.info("Report Service: Thanh toán thành công cho đơn {}", orderCode);
                reportSyncService.updatePaymentStatus(orderCode, "PAID");
            }
        } catch (Exception e) {
            log.error("Lỗi khi xử lý message từ payment-events trong Report Service: {}", e.getMessage(), e);
        }
    }
}

