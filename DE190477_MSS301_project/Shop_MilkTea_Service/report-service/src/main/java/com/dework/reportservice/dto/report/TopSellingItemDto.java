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
    private Long totalQuantitySold;
    private Double totalRevenue;
    private String image;
}
