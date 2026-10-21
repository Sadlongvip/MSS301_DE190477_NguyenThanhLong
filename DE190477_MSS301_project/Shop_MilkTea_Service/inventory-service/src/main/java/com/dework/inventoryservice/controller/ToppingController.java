package com.dework.inventoryservice.controller;

import com.dework.inventoryservice.dto.topping.ToppingRequest;
import com.dework.inventoryservice.dto.topping.ToppingResponse;
import com.dework.inventoryservice.service.ToppingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/toppings")
@RequiredArgsConstructor
public class ToppingController {

    private final ToppingService toppingService;

    @GetMapping
    public List<ToppingResponse> getToppings(@RequestParam(required = false) String keyword) {
        return toppingService.searchToppings(keyword);
    }

    @GetMapping("/{id}")
    public ToppingResponse getToppingById(@PathVariable Long id) {
        return toppingService.getToppingById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ToppingResponse createTopping(@Valid @RequestBody ToppingRequest request) {
        return toppingService.createTopping(request);
    }

    @PutMapping("/{id}")
    public ToppingResponse updateTopping(@PathVariable Long id, @Valid @RequestBody ToppingRequest request) {
        return toppingService.updateTopping(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTopping(@PathVariable Long id) {
        toppingService.deleteTopping(id);
    }
}
