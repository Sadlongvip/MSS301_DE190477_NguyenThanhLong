package com.dework.reportservice.controller;

import com.dework.reportservice.dto.report.AdminDashboardReportResponse;
import com.dework.reportservice.dto.report.DailyRevenueDto;
import com.dework.reportservice.dto.report.DashboardSummaryDto;
import com.dework.reportservice.dto.report.OrderStatusDistributionDto;
import com.dework.reportservice.dto.report.PaymentMethodBreakdownDto;
import com.dework.reportservice.dto.report.TopSellingItemDto;
import com.dework.reportservice.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/dashboard")
    public AdminDashboardReportResponse getDashboardReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "10") int topLimit) {
        return reportService.getDashboardReport(startDate, endDate, topLimit);
    }

    @GetMapping("/summary")
    public DashboardSummaryDto getSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return reportService.getSummary(startDate, endDate);
    }

    @GetMapping("/revenue-trend")
    public List<DailyRevenueDto> getDailyRevenueTrend(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return reportService.getDailyRevenueTrend(startDate, endDate);
    }

    @GetMapping("/top-selling")
    public List<TopSellingItemDto> getTopSellingProducts(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "10") int limit) {
        return reportService.getTopSellingProducts(startDate, endDate, limit);
    }

    @GetMapping("/order-status")
    public List<OrderStatusDistributionDto> getOrderStatusDistribution(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return reportService.getOrderStatusDistribution(startDate, endDate);
    }

    @GetMapping("/payment-methods")
    public List<PaymentMethodBreakdownDto> getPaymentMethodBreakdown(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return reportService.getPaymentMethodBreakdown(startDate, endDate);
    }
}
