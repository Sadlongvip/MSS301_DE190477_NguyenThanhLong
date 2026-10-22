package com.mss301.order.choreography;

import com.mss301.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "saga.choreography.enabled", havingValue = "true")
@RequiredArgsConstructor
@Slf4j
public class OrderChoreographyListener {

    private final OrderService orderService;

    @KafkaListener(topics = "payment-completed-topic", groupId = "order-group")
    public void onPaymentCompleted(OrderEvents.PaymentCompletedEvent event) {
        log.info("[CHOREOGRAPHY] Nhận PaymentCompletedEvent: order={}", event.orderId());
        orderService.confirmOrder(event.orderId());
        orderService.log(event.orderId(), "CHOREOGRAPHY_CONFIRM", "SUCCESS", "Đã xác nhận đơn hàng qua Kafka event");
    }

    @KafkaListener(topics = {"inventory-failed-topic", "payment-failed-topic"}, groupId = "order-group")
    public void onCompensationNeeded(String payload) {
        log.warn("[CHOREOGRAPHY] Nhận event thất bại, tiến hành hủy đơn: {}", payload);
        // Trong mô hình Choreography, order-service tự hủy đơn khi các service sau bắn event lỗi
    }
}
