package com.mss301.order.service;

import com.mss301.order.dto.CreateOrderRequest;
import com.mss301.order.entity.*;
import com.mss301.order.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

// Mỗi method = 1 LOCAL TRANSACTION trên orderdb (MySQL)
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final SagaLogRepository sagaLogRepository;
    private final OutboxRepository outboxRepository;

    @Transactional
    public Order createPendingOrder(CreateOrderRequest req) {
        Order order = new Order();
        order.setCustomerId(req.customerId());
        order.setProductId(req.productId());
        order.setQuantity(req.quantity());
        order.setAmount(req.amount());
        order.setStatus(OrderStatus.PENDING);
        order.setSagaStatus(SagaStatus.PENDING);
        Order savedOrder = orderRepository.save(order);

        // Transactional Outbox Pattern (EXT-5):
        // Lưu message vào bảng outbox trong CÙNG TRANSACTION với Order.
        // Đảm bảo không bao giờ mất message kể cả khi service crash ngay sau khi tạo đơn.
        OutboxMessage outbox = OutboxMessage.builder()
                .aggregateType("ORDER")
                .aggregateId(savedOrder.getId())
                .type("ORDER_CREATED")
                .payload(String.format("{\"orderId\":%d,\"customerId\":\"%s\",\"productId\":\"%s\",\"quantity\":%d,\"amount\":%.2f}",
                        savedOrder.getId(), req.customerId(), req.productId(), req.quantity(), req.amount()))
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build();
        outboxRepository.save(outbox);

        return savedOrder;
    }

    @Transactional
    public void markOutboxProcessed(Long outboxId) {
        outboxRepository.findById(outboxId).ifPresent(msg -> msg.setStatus("PROCESSED"));
    }

    public List<OutboxMessage> findPendingOutbox() {
        return outboxRepository.findByStatusOrderByIdAsc("PENDING");
    }

    @Transactional
    public void updateSagaStatus(Long orderId, SagaStatus sagaStatus) {
        Order order = orderRepository.findById(orderId).orElseThrow();
        order.setSagaStatus(sagaStatus);
    }

    @Transactional
    public void markFailed(Long orderId, String reason) {
        Order order = orderRepository.findById(orderId).orElseThrow();
        order.setSagaStatus(SagaStatus.FAILED);
        order.setFailureReason(reason);
    }

    @Transactional
    public void confirmOrder(Long orderId) {
        Order order = orderRepository.findById(orderId).orElseThrow();
        order.setStatus(OrderStatus.CONFIRMED);
        order.setSagaStatus(SagaStatus.COMPLETED);
    }

    // Compensating transaction của bước 1 (Slide 26: cancelOrder)
    @Transactional
    public void cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId).orElseThrow();
        order.setStatus(OrderStatus.CANCELLED);
        order.setSagaStatus(SagaStatus.COMPENSATED);
    }

    public void log(Long orderId, String step, String result, String message) {
        sagaLogRepository.save(new SagaLog(orderId, step, result, message));
    }

    public Order findById(Long id) {
        return orderRepository.findById(id).orElseThrow();
    }
}