package com.dework.reportservice.service;

import com.dework.reportservice.client.OrderClient;
import com.dework.reportservice.client.dto.OrderItemResponseDto;
import com.dework.reportservice.client.dto.OrderResponseDto;
import com.dework.reportservice.client.dto.PageResponseDto;
import com.dework.reportservice.model.ReportOrder;
import com.dework.reportservice.repository.ReportOrderRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReportSyncServiceTest {

    @Mock
    private ReportOrderRepository reportOrderRepository;

    @Mock
    private OrderClient orderClient;

    @InjectMocks
    private ReportSyncService reportSyncService;

    @Test
    @DisplayName("upsertOrderFromDto tạo mới đơn hàng khi chưa tồn tại trong report_db")
    void upsertOrderFromDto_NewOrder_Success() {
        OrderItemResponseDto itemDto = OrderItemResponseDto.builder()
                .milkTeaId(10L)
                .milkTeaName("Trà Sữa Oolong")
                .quantity(2)
                .unitPrice(30000.0)
                .totalPrice(60000.0)
                .build();

        OrderResponseDto dto = OrderResponseDto.builder()
                .orderCode("ORD-1001")
                .customerName("Nguyễn Văn A")
                .phoneNumber("0901234567")
                .shippingAddress("Hồ Chí Minh")
                .totalAmount(60000.0)
                .status("PENDING")
                .paymentStatus("UNPAID")
                .createdAt(LocalDateTime.now())
                .items(List.of(itemDto))
                .build();

        when(reportOrderRepository.findByOrderCode("ORD-1001")).thenReturn(Optional.empty());
        when(reportOrderRepository.save(any(ReportOrder.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ReportOrder saved = reportSyncService.upsertOrderFromDto(dto);

        assertNotNull(saved);
        assertEquals("ORD-1001", saved.getOrderCode());
        assertEquals("Nguyễn Văn A", saved.getCustomerName());
        assertEquals(1, saved.getItems().size());
        assertEquals("Trà Sữa Oolong", saved.getItems().get(0).getMilkTeaName());
        verify(reportOrderRepository).save(any(ReportOrder.class));
    }

    @Test
    @DisplayName("upsertOrderFromDto cập nhật đơn hàng khi đã tồn tại trong report_db")
    void upsertOrderFromDto_ExistingOrder_UpdatesFields() {
        ReportOrder existing = ReportOrder.builder()
                .id(1L)
                .orderCode("ORD-1002")
                .customerName("Cũ")
                .status("PENDING")
                .items(new ArrayList<>())
                .build();

        OrderResponseDto dto = OrderResponseDto.builder()
                .orderCode("ORD-1002")
                .customerName("Mới")
                .status("COMPLETED")
                .items(List.of())
                .build();

        when(reportOrderRepository.findByOrderCode("ORD-1002")).thenReturn(Optional.of(existing));
        when(reportOrderRepository.save(any(ReportOrder.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ReportOrder updated = reportSyncService.upsertOrderFromDto(dto);

        assertNotNull(updated);
        assertEquals("Mới", updated.getCustomerName());
        assertEquals("COMPLETED", updated.getStatus());
        verify(reportOrderRepository).save(existing);
    }

    @Test
    @DisplayName("syncAllOrdersFromOrderService đồng bộ tất cả đơn hàng qua Feign Client")
    void syncAllOrdersFromOrderService_Success() {
        OrderResponseDto order1 = OrderResponseDto.builder().orderCode("ORD-1").build();
        OrderResponseDto order2 = OrderResponseDto.builder().orderCode("ORD-2").build();

        PageResponseDto<OrderResponseDto> page0 = PageResponseDto.<OrderResponseDto>builder()
                .content(List.of(order1, order2))
                .totalPages(1)
                .totalElements(2L)
                .size(100)
                .number(0)
                .build();

        when(orderClient.searchOrders(0, 100)).thenReturn(page0);
        when(reportOrderRepository.findByOrderCode(any())).thenReturn(Optional.empty());
        when(reportOrderRepository.save(any(ReportOrder.class))).thenAnswer(invocation -> invocation.getArgument(0));

        int syncedCount = reportSyncService.syncAllOrdersFromOrderService();

        assertEquals(2, syncedCount);
        verify(orderClient).searchOrders(0, 100);
    }

    @Test
    @DisplayName("updateOrderStatus cập nhật trạng thái đơn đã có trong report_db")
    void updateOrderStatus_ExistingOrder_UpdatesStatus() {
        ReportOrder existing = ReportOrder.builder()
                .orderCode("ORD-1003")
                .status("PENDING")
                .paymentStatus("UNPAID")
                .build();

        when(reportOrderRepository.findByOrderCode("ORD-1003")).thenReturn(Optional.of(existing));

        reportSyncService.updateOrderStatus("ORD-1003", "COMPLETED", "PAID", null);

        assertEquals("COMPLETED", existing.getStatus());
        assertEquals("PAID", existing.getPaymentStatus());
        verify(reportOrderRepository).save(existing);
        verify(orderClient, never()).getOrderByCode(any());
    }

    @Test
    @DisplayName("updatePaymentStatus cập nhật trạng thái PAID và tự động CONFIRMED đơn PENDING")
    void updatePaymentStatus_Paid_ConfirmsPendingOrder() {
        ReportOrder existing = ReportOrder.builder()
                .orderCode("ORD-1004")
                .status("PENDING")
                .paymentStatus("UNPAID")
                .build();

        when(reportOrderRepository.findByOrderCode("ORD-1004")).thenReturn(Optional.of(existing));

        reportSyncService.updatePaymentStatus("ORD-1004", "PAID");

        assertEquals("PAID", existing.getPaymentStatus());
        assertEquals("CONFIRMED", existing.getStatus());
        verify(reportOrderRepository).save(existing);
    }
}

