package com.dework.inventoryservice.controller;

import com.dework.inventoryservice.dto.milkTea.MilkTeaRequest;
import com.dework.inventoryservice.dto.milkTea.MilkTeaResponse;
import com.dework.inventoryservice.service.MilkTeaService;
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
@RequestMapping("/api/milkteas")
@RequiredArgsConstructor
public class MilkTeaController {

    private final MilkTeaService milkTeaService;

    @GetMapping
    public List<MilkTeaResponse> getMilkTeas(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId) {
        return milkTeaService.searchMilkTeas(keyword, categoryId);
    }

    @GetMapping("/{id}")
    public MilkTeaResponse getMilkTeaById(@PathVariable Long id) {
        return milkTeaService.getMilkTeaById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MilkTeaResponse createMilkTea(@Valid @RequestBody MilkTeaRequest request) {
        return milkTeaService.createMilkTea(request);
    }

    @PutMapping("/{id}")
    public MilkTeaResponse updateMilkTea(@PathVariable Long id, @Valid @RequestBody MilkTeaRequest request) {
        return milkTeaService.updateMilkTea(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMilkTea(@PathVariable Long id) {
        milkTeaService.deleteMilkTea(id);
    }
}
