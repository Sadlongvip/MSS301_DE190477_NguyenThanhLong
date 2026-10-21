package com.dework.reportservice.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentMethodBreakdownDto {
    private String paymentMethod;
    private long orderCount;
    private double totalAmount;
}
