package com.dework.inventoryservice.controller;

import com.dework.inventoryservice.dto.categoryTea.CategoryTeaRequest;
import com.dework.inventoryservice.dto.categoryTea.CategoryTeaResponse;
import com.dework.inventoryservice.service.CategoryTeaService;
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
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryTeaController {

    private final CategoryTeaService categoryTeaService;

    @GetMapping
    public List<CategoryTeaResponse> getCategories(@RequestParam(required = false) String keyword) {
        return categoryTeaService.searchCategories(keyword);
    }

    @GetMapping("/{id}")
    public CategoryTeaResponse getCategoryById(@PathVariable Long id) {
        return categoryTeaService.getCategoryById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CategoryTeaResponse createCategory(@Valid @RequestBody CategoryTeaRequest request) {
        return categoryTeaService.createCategory(request);
    }

    @PutMapping("/{id}")
    public CategoryTeaResponse updateCategory(@PathVariable Long id, @Valid @RequestBody CategoryTeaRequest request) {
        return categoryTeaService.updateCategory(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCategory(@PathVariable Long id) {
        categoryTeaService.deleteCategory(id);
    }
}
