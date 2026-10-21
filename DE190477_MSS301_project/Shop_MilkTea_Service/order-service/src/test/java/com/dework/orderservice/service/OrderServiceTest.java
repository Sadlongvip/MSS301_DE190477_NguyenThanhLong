package com.dework.orderservice.service;

import com.dework.orderservice.dto.order.CreateOrderRequest;
import com.dework.orderservice.dto.order.OrderItemRequest;
import com.dework.orderservice.dto.order.OrderResponse;
import com.dework.orderservice.dto.order.UpdateOrderStatusRequest;
import com.dework.orderservice.exception.ApiException;
import com.dework.orderservice.model.Order;
import com.dework.orderservice.model.OrderItem;
import com.dework.orderservice.model.OrderStatus;
import com.dework.orderservice.model.PaymentMethod;
import com.dework.orderservice.model.PaymentStatus;
import com.dework.orderservice.repository.CartRepository;
import com.dework.orderservice.repository.OrderRepository;
import com.dework.orderservice.service.PriceVerificationService;
import com.dework.orderservice.service.PriceVerificationService.VerifiedProductInfo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private CartRepository cartRepository;

    @Mock
    private PriceVerificationService priceVerificationService;

    @InjectMocks
    private OrderService orderService;

    private CreateOrderRequest sampleRequest;

    @BeforeEach
    void setUp() {
        OrderItemRequest item = OrderItemRequest.builder()
                .milkTeaId(1L)
                .milkTeaName("Trà Sữa Trân Châu Hoàng Kim")
                .size("L")
                .sugar("70%")
                .ice("50%")
                .quantity(2)
                .unitPrice(35000.0)
                .build();

        sampleRequest = CreateOrderRequest.builder()
                .customerName("Nguyễn Văn A")
                .phoneNumber("0901234567")
                .shippingAddress("123 Đường ABC, Quận 1")
                .shippingFee(15000.0)
                .discountAmount(5000.0)
                .paymentMethod(PaymentMethod.COD)
                .items(List.of(item))
                .build();
    }

    @Test
    @DisplayName("Tạo đơn hàng thành công và tính đúng tổng tiền")
    void createOrder_Success() {
        when(priceVerificationService.getAllSizes()).thenReturn(List.of());
        when(priceVerificationService.getAllToppings()).thenReturn(List.of());
        when(priceVerificationService.verifyItemPrice(any(), any(), any(), anyDouble(), any(), any()))
                .thenReturn(VerifiedProductInfo.builder()
                        .milkTeaId(1L)
                        .milkTeaName("Trà Sữa Trân Châu Hoàng Kim")
                        .verifiedUnitPrice(35000.0)
                        .build());

        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order saved = invocation.getArgument(0);
            saved.setId(100L);
            return saved;
        });

        OrderResponse response = orderService.createOrder(sampleRequest, 1L);

        assertNotNull(response);
        assertEquals("Nguyễn Văn A", response.getCustomerName());
        assertEquals(1, response.getItems().size());
        assertEquals(70000.0, response.getSubtotal()); // 35000 * 2
        assertEquals(80000.0, response.getTotalAmount()); // 70000 + 15000 - 5000
        assertEquals(OrderStatus.PENDING, response.getStatus());
        assertEquals(PaymentStatus.UNPAID, response.getPaymentStatus());
        assertNotNull(response.getOrderCode());

        verify(orderRepository).save(any(Order.class));
    }

    @Test
    @DisplayName("Ném lỗi khi đơn giá client gửi lên sai lệch so với inventory-service (chống gian lận 0 đồng)")
    void createOrder_PriceMismatch_ThrowsBadRequest() {
        when(priceVerificationService.getAllSizes()).thenReturn(List.of());
        when(priceVerificationService.getAllToppings()).thenReturn(List.of());
        when(priceVerificationService.verifyItemPrice(any(), any(), any(), anyDouble(), any(), any()))
                .thenThrow(ApiException.badRequest("Đơn giá của món 'Trà Sữa Trân Châu Hoàng Kim' không chính xác. Vui lòng làm mới giỏ hàng!"));

        assertThrows(ApiException.class, () -> orderService.createOrder(sampleRequest, 1L));
    }

    @Test
    @DisplayName("Ném lỗi khi tạo đơn không có sản phẩm")
    void createOrder_EmptyItems_ThrowsBadRequest() {
        sampleRequest.setItems(new ArrayList<>());

        assertThrows(ApiException.class, () -> orderService.createOrder(sampleRequest, 1L));
    }

    @Test
    @DisplayName("Cập nhật trạng thái thanh toán PAID và tự động xác nhận đơn")
    void updatePaymentStatus_Paid_AutoConfirms() {
        Order mockOrder = Order.builder()
                .id(1L)
                .orderCode("ORD-123456")
                .status(OrderStatus.PENDING)
                .paymentStatus(PaymentStatus.UNPAID)
                .build();

        when(orderRepository.findByOrderCode("ORD-123456")).thenReturn(Optional.of(mockOrder));
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> i.getArgument(0));

        OrderResponse res = orderService.updatePaymentStatus("ORD-123456", "PAID");

        assertEquals(PaymentStatus.PAID, res.getPaymentStatus());
        assertEquals(OrderStatus.CONFIRMED, res.getStatus());
    }

    @Test
    @DisplayName("Khách hàng tự hủy đơn PENDING thành công")
    void cancelOrder_ByCustomer_Success() {
        Order mockOrder = Order.builder()
                .id(1L)
                .userId(10L)
                .orderCode("ORD-123456")
                .status(OrderStatus.PENDING)
                .build();

        when(orderRepository.findByOrderCode("ORD-123456")).thenReturn(Optional.of(mockOrder));
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> i.getArgument(0));

        OrderResponse res = orderService.cancelOrder("ORD-123456", "Đổi ý", 10L, false);

        assertEquals(OrderStatus.CANCELLED, res.getStatus());
        assertEquals("Đổi ý", res.getCancelReason());
    }

    @Test
    @DisplayName("Khách hàng không thể hủy đơn khi đã CONFIRMED")
    void cancelOrder_ByCustomer_NotPending_ThrowsBadRequest() {
        Order mockOrder = Order.builder()
                .id(1L)
                .userId(10L)
                .orderCode("ORD-123456")
                .status(OrderStatus.CONFIRMED)
                .build();

        when(orderRepository.findByOrderCode("ORD-123456")).thenReturn(Optional.of(mockOrder));

        assertThrows(ApiException.class, () -> orderService.cancelOrder("ORD-123456", "Muốn hủy", 10L, false));
    }

    @Test
    @DisplayName("Kiểm tra ánh xạ User 1-N Order: Một User có thể liên kết nhiều đơn hàng")
    void order_UserMapping_OneToMany_Success() {
        Order order1 = Order.builder()
                .id(1L)
                .orderCode("ORD-111111")
                .userId(10L)
                .build();

        Order order2 = Order.builder()
                .id(2L)
                .orderCode("ORD-222222")
                .userId(10L)
                .build();

        assertNotNull(order1.getUser());
        assertNotNull(order2.getUser());
        assertEquals(10L, order1.getUser().getId());
        assertEquals(10L, order2.getUser().getId());
        assertEquals(10L, order1.getUserId());
        assertEquals(10L, order2.getUserId());
    }
}
