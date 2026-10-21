package com.dework.inventoryservice.service;

import com.dework.inventoryservice.context.AuditContext;
import com.dework.inventoryservice.dto.categoryTea.CategoryTeaRequest;
import com.dework.inventoryservice.dto.categoryTea.CategoryTeaResponse;
import com.dework.inventoryservice.exception.ApiException;
import com.dework.inventoryservice.model.CategoryTea;
import com.dework.inventoryservice.repository.CategoryTeaRepository;
import com.dework.inventoryservice.repository.MilkTeaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryTeaService {

    private final CategoryTeaRepository categoryTeaRepository;
    private final MilkTeaRepository milkTeaRepository;

    @Transactional
    public CategoryTeaResponse createCategory(CategoryTeaRequest request) {
        String trimmedName = request.getName().trim();
        if (categoryTeaRepository.existsByName(trimmedName)) {
            throw ApiException.conflict("Tên danh mục đã tồn tại: " + trimmedName);
        }

        CategoryTea category = new CategoryTea();
        category.setName(trimmedName);

        CategoryTea saved = categoryTeaRepository.save(category);
        log.info("Category created: id={}, name={}", saved.getId(), saved.getName());
        return CategoryTeaResponse.from(saved);
    }

    public CategoryTeaResponse getCategoryById(Long id) {
        return CategoryTeaResponse.from(findCategory(id));
    }

    public List<CategoryTeaResponse> getAllCategories() {
        return categoryTeaRepository.findAll(Sort.by("id").ascending())
                .stream()
                .map(CategoryTeaResponse::from)
                .toList();
    }

    public List<CategoryTeaResponse> searchCategories(String keyword) {
        List<CategoryTea> categories = (keyword == null || keyword.isBlank())
                ? categoryTeaRepository.findAll(Sort.by("id").ascending())
                : categoryTeaRepository.findByNameContainingIgnoreCase(keyword.trim());
        return categories.stream().map(CategoryTeaResponse::from).toList();
    }

    @Transactional
    public CategoryTeaResponse updateCategory(Long id, CategoryTeaRequest request) {
        CategoryTea category = findCategory(id);
        String trimmedName = request.getName().trim();

        if (categoryTeaRepository.existsByNameAndIdNot(trimmedName, id)) {
            throw ApiException.conflict("Tên danh mục đã được sử dụng: " + trimmedName);
        }

        category.setName(trimmedName);
        category.setUpdatedAt(LocalDateTime.now());
        category.setUpdatedBy(AuditContext.getCurrentUser());
        CategoryTea updated = categoryTeaRepository.save(category);
        log.info("Category updated: id={}, name={}", updated.getId(), updated.getName());
        return CategoryTeaResponse.from(updated);
    }

    @Transactional
    public void deleteCategory(Long id) {
        CategoryTea category = findCategory(id);
        if (milkTeaRepository.existsByCategoryId(id)) {
            throw ApiException.badRequest("Không thể xóa danh mục đang có sản phẩm trà sữa liên kết");
        }
        categoryTeaRepository.delete(category);
        log.info("Category deleted: id={}", id);
    }

    public CategoryTea findCategory(Long id) {
        return categoryTeaRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy danh mục với id: " + id));
    }
}
