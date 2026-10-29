package com.dework.reportservice.client;

import com.dework.reportservice.client.dto.OrderResponseDto;
import com.dework.reportservice.client.dto.PageResponseDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "order-service", url = "${services.order.url:http://localhost:8083}")
public interface OrderClient {

    @GetMapping("/api/orders/{orderCode}")
    OrderResponseDto getOrderByCode(@PathVariable("orderCode") String orderCode);

    @GetMapping("/api/orders")
    PageResponseDto<OrderResponseDto> searchOrders(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "100") int size
    );
}

