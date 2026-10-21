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
    private long totalOrders;
    private double totalRevenue;
    private long completedOrders;
    private long cancelledOrders;
    private long pendingOrders;
    private double averageOrderValue;
    private double totalDiscountAmount;
}
