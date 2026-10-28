package com.dework.reportservice.controller;

import com.dework.reportservice.dto.report.AdminDashboardReportResponse;
import com.dework.reportservice.dto.report.DailyRevenueDto;
import com.dework.reportservice.dto.report.DashboardSummaryDto;
import com.dework.reportservice.dto.report.OrderStatusDistributionDto;
import com.dework.reportservice.dto.report.PaymentMethodBreakdownDto;
import com.dework.reportservice.dto.report.TopSellingItemDto;
import com.dework.reportservice.service.ReportService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReportControllerTest {

    @Mock
    private ReportService reportService;

    @InjectMocks
    private ReportController reportController;

    @Test
    @DisplayName("getDashboardReport gọi reportService và trả về kết quả")
    void getDashboardReport_CallsService() {
        AdminDashboardReportResponse mockRes = AdminDashboardReportResponse.builder()
                .startDate("2026-10-01")
                .endDate("2026-10-20")
                .build();

        when(reportService.getDashboardReport(any(), any(), anyInt())).thenReturn(mockRes);

        AdminDashboardReportResponse response = reportController.getDashboardReport(LocalDate.now(), LocalDate.now(), 10);

        assertNotNull(response);
        assertEquals("2026-10-01", response.getStartDate());
        verify(reportService).getDashboardReport(any(), any(), anyInt());
    }

    @Test
    @DisplayName("getSummary gọi reportService.getSummary và trả về kết quả")
    void getSummary_CallsService() {
        DashboardSummaryDto mockSummary = DashboardSummaryDto.builder()
                .totalOrders(15L)
                .totalRevenue(300000.0)
                .build();
        when(reportService.getSummary(any(), any())).thenReturn(mockSummary);

        DashboardSummaryDto result = reportController.getSummary(LocalDate.now(), LocalDate.now());

        assertNotNull(result);
        assertEquals(15L, result.getTotalOrders());
        assertEquals(300000.0, result.getTotalRevenue());
        verify(reportService).getSummary(any(), any());
    }

    @Test
    @DisplayName("getTopSellingProducts gọi reportService.getTopSellingProducts và trả về danh sách")
    void getTopSellingProducts_CallsService() {
        TopSellingItemDto item = TopSellingItemDto.builder()
                .milkTeaId(1L)
                .milkTeaName("Trà Sữa")
                .totalQuantitySold(50L)
                .build();
        when(reportService.getTopSellingProducts(any(), any(), anyInt())).thenReturn(List.of(item));

        List<TopSellingItemDto> result = reportController.getTopSellingProducts(null, null, 5);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Trà Sữa", result.get(0).getMilkTeaName());
        verify(reportService).getTopSellingProducts(any(), any(), anyInt());
    }
}
