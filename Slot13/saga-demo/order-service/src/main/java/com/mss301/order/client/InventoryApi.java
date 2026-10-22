package com.mss301.order.client;

import com.mss301.order.dto.ReserveRequest;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.service.annotation.HttpExchange;
import org.springframework.web.service.annotation.PostExchange;

@HttpExchange("/api/inventory")
public interface InventoryApi {

    @PostExchange("/reserve")
    void reserve(@RequestBody ReserveRequest req);

    @PostExchange("/release/{orderId}")
    void release(@PathVariable("orderId") Long orderId);
}
