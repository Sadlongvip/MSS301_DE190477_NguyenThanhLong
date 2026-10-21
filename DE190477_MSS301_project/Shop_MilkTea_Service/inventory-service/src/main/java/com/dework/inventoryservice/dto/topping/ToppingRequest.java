package com.dework.inventoryservice.dto.topping;

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
public class ToppingRequest {

    @NotBlank(message = "Tên topping không được để trống")
    @Size(max = 255, message = "Tên topping không được vượt quá 255 ký tự")
    private String name;

    @NotNull(message = "Giá topping không được để trống")
    @PositiveOrZero(message = "Giá topping phải lớn hơn hoặc bằng 0")
    private Double price;

    private Boolean isAvailable = true;
}
