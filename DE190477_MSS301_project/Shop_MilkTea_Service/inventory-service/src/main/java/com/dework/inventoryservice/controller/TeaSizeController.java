package com.dework.inventoryservice.controller;

import com.dework.inventoryservice.dto.teaSize.TeaSizeRequest;
import com.dework.inventoryservice.dto.teaSize.TeaSizeResponse;
import com.dework.inventoryservice.service.TeaSizeService;
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
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/sizes")
@RequiredArgsConstructor
public class TeaSizeController {

    private final TeaSizeService teaSizeService;

    @GetMapping
    public List<TeaSizeResponse> getAllSizes() {
        return teaSizeService.getAllSizes();
    }

    @GetMapping("/{id}")
    public TeaSizeResponse getSizeById(@PathVariable Long id) {
        return teaSizeService.getSizeById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TeaSizeResponse createSize(@Valid @RequestBody TeaSizeRequest request) {
        return teaSizeService.createSize(request);
    }

    @PutMapping("/{id}")
    public TeaSizeResponse updateSize(@PathVariable Long id, @Valid @RequestBody TeaSizeRequest request) {
        return teaSizeService.updateSize(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSize(@PathVariable Long id) {
        teaSizeService.deleteSize(id);
    }
}
