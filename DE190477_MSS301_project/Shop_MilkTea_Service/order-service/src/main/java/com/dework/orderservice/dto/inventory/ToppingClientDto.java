package com.dework.orderservice.dto.inventory;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ToppingClientDto {

    private Long id;
    private String name;
    private Double price;

    public double getPrice() {
        return price != null ? price : 0.0;
    }
    private Boolean isAvailable;
}
