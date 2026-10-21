package com.dework.orderservice.dto.inventory;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MilkTeaClientDto {

    private Long id;
    private String name;
    private String description;
    private double price;
    private String image;
    private Long categoryId;
    private String categoryName;
    private Boolean isAvailable;
}
