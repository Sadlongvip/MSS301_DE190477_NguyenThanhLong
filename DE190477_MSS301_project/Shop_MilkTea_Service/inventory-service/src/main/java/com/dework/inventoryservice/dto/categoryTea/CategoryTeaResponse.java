package com.dework.inventoryservice.dto.categoryTea;

import com.dework.inventoryservice.model.CategoryTea;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryTeaResponse {

    private Long id;
    private String name;
    private Integer milkTeaCount;

    public static CategoryTeaResponse from(CategoryTea category) {
        if (category == null) {
            return null;
        }
        return CategoryTeaResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .milkTeaCount(category.getMilkTeas() != null ? category.getMilkTeas().size() : 0)
                .build();
    }
}
