package com.dework.inventoryservice.service;

import com.dework.inventoryservice.context.AuditContext;
import com.dework.inventoryservice.dto.milkTea.MilkTeaRequest;
import com.dework.inventoryservice.dto.milkTea.MilkTeaResponse;
import com.dework.inventoryservice.exception.ApiException;
import com.dework.inventoryservice.model.CategoryTea;
import com.dework.inventoryservice.model.MilkTea;
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
public class MilkTeaService {

    private final MilkTeaRepository milkTeaRepository;
    private final CategoryTeaRepository categoryTeaRepository;

    @Transactional
    public MilkTeaResponse createMilkTea(MilkTeaRequest request) {
        CategoryTea category = findCategory(request.getCategoryId());

        MilkTea milkTea = new MilkTea();
        milkTea.setName(request.getName().trim());
        milkTea.setDescription(request.getDescription());
        milkTea.setPrice(request.getPrice());
        milkTea.setImage(request.getImage());
        milkTea.setCategory(category);
        if (request.getIsAvailable() != null) {
            milkTea.setIsAvailable(request.getIsAvailable());
        }

        MilkTea saved = milkTeaRepository.save(milkTea);
        log.info("MilkTea created: id={}, name={}", saved.getId(), saved.getName());
        return MilkTeaResponse.from(saved);
    }

    public MilkTeaResponse getMilkTeaById(Long id) {
        return MilkTeaResponse.from(findMilkTea(id));
    }

    public List<MilkTeaResponse> getAllMilkTeas() {
        return milkTeaRepository.findAll(Sort.by("id").ascending())
                .stream()
                .map(MilkTeaResponse::from)
                .toList();
    }

    public List<MilkTeaResponse> searchMilkTeas(String keyword, Long categoryId) {
        List<MilkTea> result;
        boolean hasKeyword = keyword != null && !keyword.isBlank();
        boolean hasCategory = categoryId != null;

        if (hasKeyword && hasCategory) {
            result = milkTeaRepository.findByCategoryIdAndNameContainingIgnoreCase(categoryId, keyword.trim());
        } else if (hasKeyword) {
            result = milkTeaRepository.findByNameContainingIgnoreCase(keyword.trim());
        } else if (hasCategory) {
            result = milkTeaRepository.findByCategoryId(categoryId);
        } else {
            result = milkTeaRepository.findAll(Sort.by("id").ascending());
        }

        return result.stream().map(MilkTeaResponse::from).toList();
    }

    @Transactional
    public MilkTeaResponse updateMilkTea(Long id, MilkTeaRequest request) {
        MilkTea milkTea = findMilkTea(id);
        CategoryTea category = findCategory(request.getCategoryId());

        milkTea.setName(request.getName().trim());
        milkTea.setDescription(request.getDescription());
        milkTea.setPrice(request.getPrice());
        milkTea.setImage(request.getImage());
        milkTea.setCategory(category);
        if (request.getIsAvailable() != null) {
            milkTea.setIsAvailable(request.getIsAvailable());
        }
        milkTea.setUpdatedAt(LocalDateTime.now());
        milkTea.setUpdatedBy(AuditContext.getCurrentUser());

        MilkTea updated = milkTeaRepository.save(milkTea);
        log.info("MilkTea updated: id={}, name={}", updated.getId(), updated.getName());
        return MilkTeaResponse.from(updated);
    }

    @Transactional
    public void deleteMilkTea(Long id) {
        MilkTea milkTea = findMilkTea(id);
        milkTeaRepository.delete(milkTea);
        log.info("MilkTea deleted: id={}", id);
    }

    private MilkTea findMilkTea(Long id) {
        return milkTeaRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy sản phẩm trà sữa với id: " + id));
    }

    private CategoryTea findCategory(Long categoryId) {
        return categoryTeaRepository.findById(categoryId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy danh mục với id: " + categoryId));
    }
}
