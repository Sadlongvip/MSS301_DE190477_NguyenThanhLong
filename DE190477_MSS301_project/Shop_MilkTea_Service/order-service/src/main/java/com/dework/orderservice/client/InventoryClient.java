package com.dework.orderservice.client;

import com.dework.orderservice.dto.inventory.MilkTeaClientDto;
import com.dework.orderservice.dto.inventory.TeaSizeClientDto;
import com.dework.orderservice.dto.inventory.ToppingClientDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "inventory-service", url = "${services.inventory.url:http://localhost:8082}")
public interface InventoryClient {

    @GetMapping("/api/milkteas/{id}")
    MilkTeaClientDto getMilkTeaById(@PathVariable("id") Long id);

    @GetMapping("/api/sizes")
    List<TeaSizeClientDto> getAllSizes();

    @GetMapping("/api/toppings")
    List<ToppingClientDto> getToppings();
}
