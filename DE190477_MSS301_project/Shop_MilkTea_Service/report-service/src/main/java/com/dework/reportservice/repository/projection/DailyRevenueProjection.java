package com.dework.reportservice.repository.projection;

public interface DailyRevenueProjection {
    String getReportDate();
    Double getRevenue();
    Long getTotalOrders();
    Long getCompletedOrders();
    Long getCancelledOrders();
}
