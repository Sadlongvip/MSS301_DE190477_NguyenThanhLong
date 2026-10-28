package com.dework.inventoryservice.dto.milkTea;

import com.dework.inventoryservice.model.MilkTea;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MilkTeaResponse {

    private Long id;
    private String name;
    private String description;
    private Double price;
    private String image;
    private Long categoryId;
    private String categoryName;
    private Boolean isAvailable;

    public static MilkTeaResponse from(MilkTea milkTea) {
        if (milkTea == null) {
            return null;
        }
        return MilkTeaResponse.builder()
                .id(milkTea.getId())
                .name(milkTea.getName())
                .description(milkTea.getDescription())
                .price(milkTea.getPrice())
                .image(milkTea.getImage())
                .categoryId(milkTea.getCategory() != null ? milkTea.getCategory().getId() : null)
                .categoryName(milkTea.getCategory() != null ? milkTea.getCategory().getName() : null)
                .isAvailable(milkTea.getIsAvailable() != null ? milkTea.getIsAvailable() : true)
                .build();
    }
}
