package com.dework.orderservice.dto.cart;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCartItemRequest {

    @Min(value = 0, message = "Số lượng không được âm (0 tương ứng với xóa món)")
    private int quantity;
}
