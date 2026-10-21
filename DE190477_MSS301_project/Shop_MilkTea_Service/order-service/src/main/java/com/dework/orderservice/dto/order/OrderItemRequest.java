package com.dework.orderservice.dto.order;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemRequest {

    @NotNull(message = "ID trà sữa không được để trống")
    private Long milkTeaId;

    @NotBlank(message = "Tên trà sữa không được để trống")
    @Size(max = 255, message = "Tên trà sữa không được vượt quá 255 ký tự")
    private String milkTeaName;

    private String size;

    private String sugar;

    private String ice;

    @Size(max = 500, message = "Thông tin topping không được vượt quá 500 ký tự")
    private String toppings;

    @Min(value = 1, message = "Số lượng phải lớn hơn hoặc bằng 1")
    @Builder.Default
    private int quantity = 1;

    @DecimalMin(value = "0.0", inclusive = true, message = "Đơn giá không được âm")
    private double unitPrice;

    private String image;

    @Size(max = 500, message = "Ghi chú không được vượt quá 500 ký tự")
    private String note;
}
