package com.dework.inventoryservice.dto.milkTea;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MilkTeaRequest {

    @NotBlank(message = "Tên trà sữa không được để trống")
    @Size(max = 255, message = "Tên trà sữa không được vượt quá 255 ký tự")
    private String name;

    private String description;

    @NotNull(message = "Giá không được để trống")
    @Positive(message = "Giá trà sữa phải lớn hơn 0")
    private Double price;

    private String image;

    @NotNull(message = "Danh mục không được để trống")
    private Long categoryId;

    private Boolean isAvailable = true;
}
