package com.dework.reportservice.repository.projection;

public interface TopSellingItemProjection {
    Long getMilkTeaId();
    String getMilkTeaName();
    Long getTotalQuantitySold();
    Double getTotalRevenue();
    String getImage();
}
