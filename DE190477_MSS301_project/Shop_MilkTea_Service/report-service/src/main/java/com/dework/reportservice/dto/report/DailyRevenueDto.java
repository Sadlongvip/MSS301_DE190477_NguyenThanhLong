package com.dework.reportservice.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyRevenueDto {
    private String reportDate;
    private Double revenue;
    private Long totalOrders;
    private Long completedOrders;
    private Long cancelledOrders;
}
