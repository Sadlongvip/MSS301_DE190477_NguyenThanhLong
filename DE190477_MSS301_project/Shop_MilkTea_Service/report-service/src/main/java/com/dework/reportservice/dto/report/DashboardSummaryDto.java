package com.dework.reportservice.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryDto {
    private Long totalOrders;
    private Double totalRevenue;
    private Long completedOrders;
    private Long cancelledOrders;
    private Long pendingOrders;
    private Double averageOrderValue;
    private Double totalDiscountAmount;
}
