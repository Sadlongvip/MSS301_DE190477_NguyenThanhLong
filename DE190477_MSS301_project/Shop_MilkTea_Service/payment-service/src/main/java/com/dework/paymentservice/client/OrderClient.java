package com.dework.paymentservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "order-service", url = "${services.order.url:http://localhost:8083}")
public interface OrderClient {

    @PutMapping("/api/orders/{orderCode}/payment-status")
    void updatePaymentStatus(
            @PathVariable("orderCode") String orderCode,
            @RequestBody Map<String, Object> payload
    );
}
