package com.dework.orderservice.dto.order;

import com.dework.orderservice.model.OrderStatus;
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
public class UpdateOrderStatusRequest {

    @NotNull(message = "Trạng thái đơn hàng không được để trống")
    private OrderStatus status;

    @Size(max = 500, message = "Lý do hủy đơn không được vượt quá 500 ký tự")
    private String cancelReason;
}
