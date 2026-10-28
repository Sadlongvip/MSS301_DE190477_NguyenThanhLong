package com.dework.orderservice.dto.inventory;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeaSizeClientDto {

    private Long id;
    private String name;
    private String code;
    private Double extraPrice;

    public double getExtraPrice() {
        return extraPrice != null ? extraPrice : 0.0;
    }
    private Boolean isDefault;
    private Boolean isAvailable;
}
