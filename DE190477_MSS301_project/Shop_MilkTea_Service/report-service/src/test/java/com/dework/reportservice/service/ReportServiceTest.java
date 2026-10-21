package com.dework.reportservice.service;

import com.dework.reportservice.context.AuditContext;
import com.dework.reportservice.dto.report.AdminDashboardReportResponse;
import com.dework.reportservice.dto.report.DashboardSummaryDto;
import com.dework.reportservice.dto.report.OrderStatusDistributionDto;
import com.dework.reportservice.dto.report.TopSellingItemDto;
import com.dework.reportservice.exception.ApiException;
import com.dework.reportservice.repository.ReportOrderRepository;
import com.dework.reportservice.repository.projection.DailyRevenueProjection;
import com.dework.reportservice.repository.projection.OrderStatusCountProjection;
import com.dework.reportservice.repository.projection.PaymentMethodCountProjection;
import com.dework.reportservice.repository.projection.SummaryStatsProjection;
import com.dework.reportservice.repository.projection.TopSellingItemProjection;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReportServiceTest {

    @Mock
    private ReportOrderRepository reportOrderRepository;

    @InjectMocks
    private ReportService reportService;

    @BeforeEach
    void setUp() {
        AuditContext.setCurrentUserRole("ADMIN");
        AuditContext.setCurrentUser("admin_test");
    }

    @AfterEach
    void tearDown() {
        AuditContext.clear();
    }

    @Test
    @DisplayName("Từ chối truy cập báo cáo nếu role không phải ADMIN")
    void validateAdminRole_NonAdmin_ThrowsForbidden() {
        AuditContext.setCurrentUserRole("CUSTOMER");

        ApiException ex = assertThrows(ApiException.class, () ->
                reportService.getSummary(LocalDate.now().minusDays(7), LocalDate.now())
        );

        assertEquals(403, ex.getStatus().value());
    }

    @Test
    @DisplayName("Ném lỗi khi ngày bắt đầu sau ngày kết thúc")
    void validateDateRange_StartDateAfterEndDate_ThrowsBadRequest() {
        LocalDate start = LocalDate.now();
        LocalDate end = LocalDate.now().minusDays(5);

        ApiException ex = assertThrows(ApiException.class, () ->
                reportService.getSummary(start, end)
        );

        assertEquals(400, ex.getStatus().value());
    }

    @Test
    @DisplayName("Tính toán chính xác tổng hợp KPI và AOV")
    void getSummary_Success() {
        SummaryStatsProjection mockStats = mock(SummaryStatsProjection.class);
        when(mockStats.getTotalOrders()).thenReturn(10L);
        when(mockStats.getTotalRevenue()).thenReturn(500000.0);
        when(mockStats.getCompletedOrders()).thenReturn(5L);
        when(mockStats.getCancelledOrders()).thenReturn(2L);
        when(mockStats.getPendingOrders()).thenReturn(3L);
        when(mockStats.getTotalDiscount()).thenReturn(20000.0);

        when(reportOrderRepository.getSummaryStats(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(mockStats);

        DashboardSummaryDto summary = reportService.getSummary(LocalDate.now().minusDays(10), LocalDate.now());

        assertNotNull(summary);
        assertEquals(10L, summary.getTotalOrders());
        assertEquals(500000.0, summary.getTotalRevenue());
        assertEquals(5L, summary.getCompletedOrders());
        assertEquals(100000.0, summary.getAverageOrderValue()); // 500000 / 5
        assertEquals(20000.0, summary.getTotalDiscountAmount());
    }

    @Test
    @DisplayName("Tránh lỗi chia cho 0 khi chưa có đơn hàng hoàn thành nào")
    void getSummary_ZeroCompletedOrders_AovIsZero() {
        SummaryStatsProjection mockStats = mock(SummaryStatsProjection.class);
        when(mockStats.getTotalOrders()).thenReturn(2L);
        when(mockStats.getTotalRevenue()).thenReturn(0.0);
        when(mockStats.getCompletedOrders()).thenReturn(0L);

        when(reportOrderRepository.getSummaryStats(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(mockStats);

        DashboardSummaryDto summary = reportService.getSummary(null, null);

        assertNotNull(summary);
        assertEquals(0.0, summary.getAverageOrderValue());
    }

    @Test
    @DisplayName("Lấy báo cáo tổng hợp All-in-One Dashboard thành công")
    void getDashboardReport_Success() {
        SummaryStatsProjection mockStats = mock(SummaryStatsProjection.class);
        when(reportOrderRepository.getSummaryStats(any(), any())).thenReturn(mockStats);
        when(reportOrderRepository.getDailyRevenueTrend(any(), any())).thenReturn(List.of());
        when(reportOrderRepository.getTopSellingProducts(any(), any(), anyInt())).thenReturn(List.of());
        when(reportOrderRepository.getOrderStatusDistribution(any(), any())).thenReturn(List.of());
        when(reportOrderRepository.getPaymentMethodBreakdown(any(), any())).thenReturn(List.of());

        AdminDashboardReportResponse res = reportService.getDashboardReport(null, null, 10);

        assertNotNull(res);
        assertNotNull(res.getSummary());
        assertNotNull(res.getRevenueTrends());
        assertNotNull(res.getTopSelling());
    }

    @Test
    @DisplayName("Tính toán đúng tỷ lệ phần trăm phân bố trạng thái đơn hàng")
    void getOrderStatusDistribution_CalculatesPercentages() {
        OrderStatusCountProjection p1 = mock(OrderStatusCountProjection.class);
        when(p1.getStatus()).thenReturn("COMPLETED");
        when(p1.getCount()).thenReturn(70L);

        OrderStatusCountProjection p2 = mock(OrderStatusCountProjection.class);
        when(p2.getStatus()).thenReturn("CANCELLED");
        when(p2.getCount()).thenReturn(30L);

        when(reportOrderRepository.getOrderStatusDistribution(any(), any()))
                .thenReturn(List.of(p1, p2));

        List<OrderStatusDistributionDto> result = reportService.getOrderStatusDistribution(null, null);

        assertEquals(2, result.size());
        assertEquals(70.0, result.get(0).getPercentage());
        assertEquals(30.0, result.get(1).getPercentage());
    }
}
