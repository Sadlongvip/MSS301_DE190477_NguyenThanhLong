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
    private double revenue;
    private long totalOrders;
    private long completedOrders;
    private long cancelledOrders;
}
