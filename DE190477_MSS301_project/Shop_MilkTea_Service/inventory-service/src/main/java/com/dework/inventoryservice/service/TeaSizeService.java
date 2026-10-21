package com.dework.inventoryservice.service;

import com.dework.inventoryservice.context.AuditContext;
import com.dework.inventoryservice.dto.teaSize.TeaSizeRequest;
import com.dework.inventoryservice.dto.teaSize.TeaSizeResponse;
import com.dework.inventoryservice.exception.ApiException;
import com.dework.inventoryservice.model.TeaSize;
import com.dework.inventoryservice.repository.TeaSizeRepository;
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
public class TeaSizeService {

    private final TeaSizeRepository teaSizeRepository;

    public List<TeaSizeResponse> getAllSizes() {
        return teaSizeRepository.findAll(Sort.by("extraPrice").ascending())
                .stream()
                .map(TeaSizeResponse::from)
                .toList();
    }

    public TeaSizeResponse getSizeById(Long id) {
        return TeaSizeResponse.from(findSize(id));
    }

    @Transactional
    public TeaSizeResponse createSize(TeaSizeRequest request) {
        String trimmedCode = request.getCode().trim().toUpperCase();
        if (teaSizeRepository.existsByCodeIgnoreCase(trimmedCode)) {
            throw ApiException.conflict("Mã size đã tồn tại: " + trimmedCode);
        }

        TeaSize size = new TeaSize();
        size.setName(request.getName().trim());
        size.setCode(trimmedCode);
        size.setExtraPrice(request.getExtraPrice());
        size.setIsDefault(request.getIsDefault() != null ? request.getIsDefault() : false);
        size.setIsAvailable(request.getIsAvailable() != null ? request.getIsAvailable() : true);

        TeaSize saved = teaSizeRepository.save(size);
        log.info("TeaSize created: id={}, code={}, extraPrice={}", saved.getId(), saved.getCode(), saved.getExtraPrice());
        return TeaSizeResponse.from(saved);
    }

    @Transactional
    public TeaSizeResponse updateSize(Long id, TeaSizeRequest request) {
        TeaSize size = findSize(id);
        String trimmedCode = request.getCode().trim().toUpperCase();

        if (teaSizeRepository.existsByCodeIgnoreCaseAndIdNot(trimmedCode, id)) {
            throw ApiException.conflict("Mã size đã được sử dụng: " + trimmedCode);
        }

        size.setName(request.getName().trim());
        size.setCode(trimmedCode);
        size.setExtraPrice(request.getExtraPrice());
        if (request.getIsDefault() != null) {
            size.setIsDefault(request.getIsDefault());
        }
        if (request.getIsAvailable() != null) {
            size.setIsAvailable(request.getIsAvailable());
        }
        size.setUpdatedAt(LocalDateTime.now());
        size.setUpdatedBy(AuditContext.getCurrentUser());

        TeaSize updated = teaSizeRepository.save(size);
        log.info("TeaSize updated: id={}, code={}, extraPrice={}", updated.getId(), updated.getCode(), updated.getExtraPrice());
        return TeaSizeResponse.from(updated);
    }

    @Transactional
    public void deleteSize(Long id) {
        TeaSize size = findSize(id);
        teaSizeRepository.delete(size);
        log.info("TeaSize deleted: id={}", id);
    }

    private TeaSize findSize(Long id) {
        return teaSizeRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy kích cỡ với id: " + id));
    }
}
