package com.dework.orderservice.dto.order;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePaymentStatusRequest {

    @NotBlank(message = "Trạng thái thanh toán không được để trống")
    private String paymentStatus;
}
