package com.mss301.shipping.controller;

import com.mss301.shipping.dto.CreateShipmentRequest;
import com.mss301.shipping.entity.Shipment;
import com.mss301.shipping.service.ShippingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shipping")
@RequiredArgsConstructor
public class ShippingController {

    private final ShippingService shippingService;

    @PostMapping("/create")
    public Shipment create(@RequestBody CreateShipmentRequest req) {
        return shippingService.create(req);
    }

    @PostMapping("/cancel/{orderId}")
    public String cancel(@PathVariable Long orderId) {
        shippingService.cancel(orderId);
        return "CANCELLED";
    }

    @GetMapping
    public List<Shipment> findAll() {
        return shippingService.findAll();
    }
}
