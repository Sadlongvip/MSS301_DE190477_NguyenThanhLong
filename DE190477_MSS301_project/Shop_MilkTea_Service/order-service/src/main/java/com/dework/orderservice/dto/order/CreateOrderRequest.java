package com.dework.orderservice.dto.order;

import com.dework.orderservice.model.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderRequest {

    @NotBlank(message = "Tên người nhận không được để trống")
    @Size(max = 255, message = "Tên người nhận không được vượt quá 255 ký tự")
    private String customerName;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Size(max = 20, message = "Số điện thoại không được vượt quá 20 ký tự")
    private String phoneNumber;

    @NotBlank(message = "Địa chỉ nhận hàng không được để trống")
    @Size(max = 500, message = "Địa chỉ nhận hàng không được vượt quá 500 ký tự")
    private String shippingAddress;

    private String note;

    private String voucherCode;

    @DecimalMin(value = "0.0", inclusive = true, message = "Phí giao hàng không được âm")
    @Builder.Default
    private Double shippingFee = 0.0;

    @DecimalMin(value = "0.0", inclusive = true, message = "Số tiền giảm giá không được âm")
    @Builder.Default
    private Double discountAmount = 0.0;

    public double getShippingFee() {
        return shippingFee != null ? shippingFee : 0.0;
    }

    public double getDiscountAmount() {
        return discountAmount != null ? discountAmount : 0.0;
    }

    @Builder.Default
    private PaymentMethod paymentMethod = PaymentMethod.COD;

    private String sessionId;

    @NotEmpty(message = "Danh sách sản phẩm không được để trống")
    @Valid
    private List<OrderItemRequest> items;
}
