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
    private double price;
    private Boolean isAvailable;
}
