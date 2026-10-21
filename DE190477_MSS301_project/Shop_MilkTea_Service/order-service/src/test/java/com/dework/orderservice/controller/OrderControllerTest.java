package com.dework.orderservice.controller;

import com.dework.orderservice.dto.order.CancelOrderRequest;
import com.dework.orderservice.dto.order.CreateOrderRequest;
import com.dework.orderservice.dto.order.OrderItemRequest;
import com.dework.orderservice.dto.order.OrderResponse;
import com.dework.orderservice.dto.order.UpdateOrderStatusRequest;
import com.dework.orderservice.model.OrderStatus;
import com.dework.orderservice.model.PaymentMethod;
import com.dework.orderservice.model.PaymentStatus;
import com.dework.orderservice.service.OrderService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderControllerTest {

    @Mock
    private OrderService orderService;

    @InjectMocks
    private OrderController orderController;

    @Test
    @DisplayName("createOrder gọi orderService.createOrder và trả về OrderResponse")
    void createOrder_Success() {
        OrderItemRequest item = OrderItemRequest.builder()
                .milkTeaId(1L)
                .milkTeaName("Trà Sữa Oolong")
                .quantity(1)
                .unitPrice(30000.0)
                .build();

        CreateOrderRequest request = CreateOrderRequest.builder()
                .customerName("Trần Thị B")
                .phoneNumber("0912345678")
                .shippingAddress("456 Đường XYZ")
                .paymentMethod(PaymentMethod.COD)
                .items(List.of(item))
                .build();

        OrderResponse mockResponse = OrderResponse.builder()
                .id(1L)
                .orderCode("ORD-20261019-ABCD")
                .customerName("Trần Thị B")
                .status(OrderStatus.PENDING)
                .paymentStatus(PaymentStatus.UNPAID)
                .totalAmount(30000.0)
                .build();

        when(orderService.createOrder(eq(request), eq(12L))).thenReturn(mockResponse);

        OrderResponse result = orderController.createOrder(12L, request);

        assertNotNull(result);
        assertEquals("ORD-20261019-ABCD", result.getOrderCode());
        assertEquals("Trần Thị B", result.getCustomerName());
        verify(orderService).createOrder(eq(request), eq(12L));
    }

    @Test
    @DisplayName("getMyOrders gọi orderService.getMyOrders với userId tương ứng")
    void getMyOrders_Success() {
        OrderResponse mockOrder = OrderResponse.builder().id(1L).orderCode("ORD-1").build();
        when(orderService.getMyOrders(10L)).thenReturn(List.of(mockOrder));

        List<OrderResponse> result = orderController.getMyOrders(10L);

        assertEquals(1, result.size());
        assertEquals("ORD-1", result.get(0).getOrderCode());
        verify(orderService).getMyOrders(10L);
    }

    @Test
    @DisplayName("getOrderByCode gọi orderService.getOrderByCode")
    void getOrderByCode_Success() {
        OrderResponse mockOrder = OrderResponse.builder().id(1L).orderCode("ORD-123").build();
        when(orderService.getOrderByCode("ORD-123")).thenReturn(mockOrder);

        OrderResponse result = orderController.getOrderByCode("ORD-123");

        assertNotNull(result);
        assertEquals("ORD-123", result.getOrderCode());
        verify(orderService).getOrderByCode("ORD-123");
    }

    @Test
    @DisplayName("searchOrders phân trang tìm kiếm đơn hàng")
    void searchOrders_Success() {
        OrderResponse mockOrder = OrderResponse.builder().id(1L).orderCode("ORD-123").build();
        Page<OrderResponse> page = new PageImpl<>(List.of(mockOrder));
        when(orderService.searchOrders(any(), any(), any(), any(Pageable.class))).thenReturn(page);

        Page<OrderResponse> result = orderController.searchOrders(null, null, "123", 0, 10);

        assertEquals(1, result.getTotalElements());
        verify(orderService).searchOrders(any(), any(), eq("123"), any(Pageable.class));
    }

    @Test
    @DisplayName("updateOrderStatus cập nhật trạng thái đơn hàng")
    void updateOrderStatus_Success() {
        UpdateOrderStatusRequest req = UpdateOrderStatusRequest.builder().status(OrderStatus.CONFIRMED).build();
        OrderResponse mockOrder = OrderResponse.builder().orderCode("ORD-123").status(OrderStatus.CONFIRMED).build();
        when(orderService.updateOrderStatus("ORD-123", req)).thenReturn(mockOrder);

        OrderResponse result = orderController.updateOrderStatus("ORD-123", req);

        assertEquals(OrderStatus.CONFIRMED, result.getStatus());
        verify(orderService).updateOrderStatus("ORD-123", req);
    }

    @Test
    @DisplayName("updatePaymentStatus cập nhật trạng thái thanh toán từ payment-service payload")
    void updatePaymentStatus_Success() {
        OrderResponse mockOrder = OrderResponse.builder().orderCode("ORD-123").paymentStatus(PaymentStatus.PAID).build();
        when(orderService.updatePaymentStatus("ORD-123", "PAID")).thenReturn(mockOrder);

        OrderResponse result = orderController.updatePaymentStatus("ORD-123", Map.of("paymentStatus", "PAID"));

        assertEquals(PaymentStatus.PAID, result.getPaymentStatus());
        verify(orderService).updatePaymentStatus("ORD-123", "PAID");
    }

    @Test
    @DisplayName("cancelOrder hủy đơn hàng với lý do")
    void cancelOrder_Success() {
        CancelOrderRequest req = CancelOrderRequest.builder().reason("Đổi ý").build();
        OrderResponse mockOrder = OrderResponse.builder().orderCode("ORD-123").status(OrderStatus.CANCELLED).build();
        when(orderService.cancelOrder("ORD-123", "Đổi ý", 10L, false)).thenReturn(mockOrder);

        OrderResponse result = orderController.cancelOrder("ORD-123", 10L, "CUSTOMER", req);

        assertEquals(OrderStatus.CANCELLED, result.getStatus());
        verify(orderService).cancelOrder("ORD-123", "Đổi ý", 10L, false);
    }
}
