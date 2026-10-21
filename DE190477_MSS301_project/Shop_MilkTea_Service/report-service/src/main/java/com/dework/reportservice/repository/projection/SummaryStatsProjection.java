package com.dework.reportservice.repository.projection;

public interface SummaryStatsProjection {
    Long getTotalOrders();
    Double getTotalRevenue();
    Long getCompletedOrders();
    Long getCancelledOrders();
    Long getPendingOrders();
    Double getTotalDiscount();
}
