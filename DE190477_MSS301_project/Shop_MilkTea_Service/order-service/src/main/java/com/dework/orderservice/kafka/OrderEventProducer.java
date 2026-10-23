package com.dework.orderservice.kafka;

import com.dework.orderservice.event.OrderCancelledEvent;
import com.dework.orderservice.event.OrderCreatedEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderEventProducer {

    public static final String ORDER_TOPIC = "order-events";

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public void publishOrderCreated(OrderCreatedEvent event) {
        try {
            String payload = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(ORDER_TOPIC, event.getOrderCode(), payload);
            log.info("Kafka Producer: Đã phát OrderCreatedEvent cho đơn hàng: {}", event.getOrderCode());
        } catch (Exception e) {
            log.error("Lỗi khi phát OrderCreatedEvent lên Kafka: {}", e.getMessage(), e);
        }
    }

    public void publishOrderCancelled(OrderCancelledEvent event) {
        try {
            String payload = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(ORDER_TOPIC, event.getOrderCode(), payload);
            log.info("Kafka Producer: Đã phát OrderCancelledEvent cho đơn hàng: {}, Lý do: {}", event.getOrderCode(), event.getReason());
        } catch (Exception e) {
            log.error("Lỗi khi phát OrderCancelledEvent lên Kafka: {}", e.getMessage(), e);
        }
    }
}
