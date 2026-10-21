package com.dework.paymentservice.dto;

import com.dework.paymentservice.model.PaymentMethod;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentRequestDTO {

    @NotBlank(message = "Order code is required")
    private String orderCode;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "1000.0", message = "Amount must be at least 1,000 VND")
    private Double amount;

    @Builder.Default
    private PaymentMethod paymentMethod = PaymentMethod.VNPAY;

    private String orderInfo;

    private String bankCode;

    private Long userId;
}
