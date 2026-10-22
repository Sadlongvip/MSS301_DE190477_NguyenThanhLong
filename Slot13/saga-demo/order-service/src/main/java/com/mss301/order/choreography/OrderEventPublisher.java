package com.mss301.order.choreography;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "saga.choreography.enabled", havingValue = "true")
@RequiredArgsConstructor
@Slf4j
public class OrderEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishOrderCreated(OrderEvents.OrderCreatedEvent event) {
        log.info("[CHOREOGRAPHY] Publish OrderCreatedEvent: order={}", event.orderId());
        kafkaTemplate.send("order-created-topic", String.valueOf(event.orderId()), event);
    }
}
