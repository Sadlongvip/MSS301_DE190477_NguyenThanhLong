package com.dework.inventoryservice.dto.teaSize;

import com.dework.inventoryservice.model.TeaSize;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeaSizeResponse {

    private Long id;
    private String name;
    private String code;
    private double extraPrice;
    private Boolean isDefault;
    private Boolean isAvailable;

    public static TeaSizeResponse from(TeaSize size) {
        if (size == null) {
            return null;
        }
        return TeaSizeResponse.builder()
                .id(size.getId())
                .name(size.getName())
                .code(size.getCode())
                .extraPrice(size.getExtraPrice())
                .isDefault(size.getIsDefault() != null ? size.getIsDefault() : false)
                .isAvailable(size.getIsAvailable() != null ? size.getIsAvailable() : true)
                .build();
    }
}
