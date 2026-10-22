package com.mss301.order.client;

import com.mss301.order.dto.PaymentRequest;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.service.annotation.HttpExchange;
import org.springframework.web.service.annotation.PostExchange;

@HttpExchange("/api/payments")
public interface PaymentApi {

    @PostExchange("/pay")
    void pay(@RequestBody PaymentRequest req);

    @PostExchange("/refund/{orderId}")
    void refund(@PathVariable("orderId") Long orderId);
}
