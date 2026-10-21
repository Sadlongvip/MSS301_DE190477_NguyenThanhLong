package com.dework.reportservice.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopSellingItemDto {
    private Long milkTeaId;
    private String milkTeaName;
    private long totalQuantitySold;
    private double totalRevenue;
    private String image;
}
