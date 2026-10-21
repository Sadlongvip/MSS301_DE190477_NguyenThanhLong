package com.dework.inventoryservice.dto.teaSize;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeaSizeRequest {

    @NotBlank(message = "Tên size không được để trống")
    @Size(max = 100, message = "Tên size không được vượt quá 100 ký tự")
    private String name;

    @NotBlank(message = "Mã size (code) không được để trống (VD: M, L, XL)")
    @Size(max = 20, message = "Mã size không được vượt quá 20 ký tự")
    private String code;

    @NotNull(message = "Phụ thu giá size không được để trống")
    @PositiveOrZero(message = "Phụ thu giá size phải lớn hơn hoặc bằng 0")
    private Double extraPrice;

    private Boolean isDefault = false;

    private Boolean isAvailable = true;
}
