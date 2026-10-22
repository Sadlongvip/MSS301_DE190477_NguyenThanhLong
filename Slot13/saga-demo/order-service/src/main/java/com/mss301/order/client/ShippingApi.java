package com.mss301.order.client;

import com.mss301.order.dto.CreateShipmentRequest;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.service.annotation.HttpExchange;
import org.springframework.web.service.annotation.PostExchange;

@HttpExchange("/api/shipping")
public interface ShippingApi {

    @PostExchange("/create")
    void create(@RequestBody CreateShipmentRequest req);

    @PostExchange("/cancel/{orderId}")
    void cancel(@PathVariable("orderId") Long orderId);
}
