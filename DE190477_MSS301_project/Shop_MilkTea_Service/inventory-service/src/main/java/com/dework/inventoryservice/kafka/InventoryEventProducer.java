package com.dework.inventoryservice.kafka;

import com.dework.inventoryservice.event.InventoryFailedEvent;
import com.dework.inventoryservice.event.InventoryReservedEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class InventoryEventProducer {

    public static final String INVENTORY_TOPIC = "inventory-events";

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public void publishInventoryReserved(InventoryReservedEvent event) {
        try {
            String payload = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(INVENTORY_TOPIC, event.getOrderCode(), payload);
            log.info("Kafka Producer: Đã phát InventoryReservedEvent cho đơn hàng: {}", event.getOrderCode());
        } catch (Exception e) {
            log.error("Lỗi khi gửi InventoryReservedEvent lên Kafka: {}", e.getMessage(), e);
        }
    }

    public void publishInventoryFailed(InventoryFailedEvent event) {
        try {
            String payload = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(INVENTORY_TOPIC, event.getOrderCode(), payload);
            log.info("Kafka Producer: Đã phát InventoryFailedEvent cho đơn hàng: {}, Lý do: {}", event.getOrderCode(), event.getReason());
        } catch (Exception e) {
            log.error("Lỗi khi gửi InventoryFailedEvent lên Kafka: {}", e.getMessage(), e);
        }
    }
}
