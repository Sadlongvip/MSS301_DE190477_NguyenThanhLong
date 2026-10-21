package com.dework.reportservice.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardReportResponse {
    private String startDate;
    private String endDate;
    private DashboardSummaryDto summary;

    @Builder.Default
    private List<DailyRevenueDto> revenueTrends = new ArrayList<>();

    @Builder.Default
    private List<TopSellingItemDto> topSelling = new ArrayList<>();

    @Builder.Default
    private List<OrderStatusDistributionDto> orderStatusDistribution = new ArrayList<>();

    @Builder.Default
    private List<PaymentMethodBreakdownDto> paymentMethods = new ArrayList<>();
}
