package com.dework.inventoryservice.dto.topping;

import com.dework.inventoryservice.model.Topping;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ToppingResponse {

    private Long id;
    private String name;
    private Double price;
    private Boolean isAvailable;

    public static ToppingResponse from(Topping topping) {
        if (topping == null) {
            return null;
        }
        return ToppingResponse.builder()
                .id(topping.getId())
                .name(topping.getName())
                .price(topping.getPrice())
                .isAvailable(topping.getIsAvailable() != null ? topping.getIsAvailable() : true)
                .build();
    }
}
