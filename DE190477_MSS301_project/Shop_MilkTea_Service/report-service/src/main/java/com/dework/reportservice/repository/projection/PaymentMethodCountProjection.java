package com.dework.reportservice.repository.projection;

public interface PaymentMethodCountProjection {
    String getPaymentMethod();
    Long getOrderCount();
    Double getTotalAmount();
}
