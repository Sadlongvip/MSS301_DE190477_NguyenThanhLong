package com.dework.paymentservice.kafka;

import com.dework.paymentservice.event.PaymentFailedEvent;
import com.dework.paymentservice.event.PaymentSuccessEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentEventProducer {

    public static final String PAYMENT_TOPIC = "payment-events";

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public void publishPaymentSuccess(PaymentSuccessEvent event) {
        try {
            String payload = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(PAYMENT_TOPIC, event.getOrderCode(), payload);
            log.info("Kafka Producer: Đã phát PaymentSuccessEvent cho đơn hàng: {}", event.getOrderCode());
        } catch (Exception e) {
            log.error("Lỗi khi gửi PaymentSuccessEvent lên Kafka: {}", e.getMessage(), e);
        }
    }

    public void publishPaymentFailed(PaymentFailedEvent event) {
        try {
            String payload = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(PAYMENT_TOPIC, event.getOrderCode(), payload);
            log.info("Kafka Producer: Đã phát PaymentFailedEvent cho đơn hàng: {}, Lý do: {}", event.getOrderCode(), event.getReason());
        } catch (Exception e) {
            log.error("Lỗi khi gửi PaymentFailedEvent lên Kafka: {}", e.getMessage(), e);
        }
    }
}
