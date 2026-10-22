package com.mss301.order.controller;

import com.mss301.order.dto.CreateOrderRequest;
import com.mss301.order.entity.*;
import com.mss301.order.repository.*;
import com.mss301.order.saga.OrderSagaOrchestrator;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderSagaOrchestrator orchestrator;
    private final OrderRepository orderRepository;
    private final SagaLogRepository sagaLogRepository;
    private final OutboxRepository outboxRepository;

    @PostMapping
    public Order placeOrder(@RequestBody CreateOrderRequest req) {
        return orchestrator.placeOrder(req);
    }

    @GetMapping
    public List<Order> findAll() {
        return orderRepository.findAll();
    }

    @GetMapping("/{id}/saga-logs")
    public List<SagaLog> sagaLogs(@PathVariable Long id) {
        return sagaLogRepository.findByOrderIdOrderByIdAsc(id);
    }

    // [EXT-4] Admin API khôi phục Saga cho order bị treo (COMPENSATING)
    @PostMapping("/{id}/compensate")
    public ResponseEntity<?> compensateOrder(@PathVariable Long id) {
        boolean recovered = orchestrator.recoverCompensation(id);
        Order order = orderRepository.findById(id).orElse(null);
        return ResponseEntity.ok(Map.of(
                "orderId", id,
                "recovered", recovered,
                "status", order != null ? order.getStatus() : "UNKNOWN",
                "sagaStatus", order != null ? order.getSagaStatus() : "UNKNOWN"
        ));
    }

    // [EXT-5] API kiểm tra bảng outbox
    @GetMapping("/outbox")
    public List<OutboxMessage> outboxMessages() {
        return outboxRepository.findAll();
    }
}