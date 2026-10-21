package com.dework.reportservice.service;

import com.dework.reportservice.context.AuditContext;
import com.dework.reportservice.dto.report.AdminDashboardReportResponse;
import com.dework.reportservice.dto.report.DailyRevenueDto;
import com.dework.reportservice.dto.report.DashboardSummaryDto;
import com.dework.reportservice.dto.report.OrderStatusDistributionDto;
import com.dework.reportservice.dto.report.PaymentMethodBreakdownDto;
import com.dework.reportservice.dto.report.TopSellingItemDto;
import com.dework.reportservice.exception.ApiException;
import com.dework.reportservice.repository.ReportOrderRepository;
import com.dework.reportservice.repository.projection.DailyRevenueProjection;
import com.dework.reportservice.repository.projection.OrderStatusCountProjection;
import com.dework.reportservice.repository.projection.PaymentMethodCountProjection;
import com.dework.reportservice.repository.projection.SummaryStatsProjection;
import com.dework.reportservice.repository.projection.TopSellingItemProjection;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService {

    private final ReportOrderRepository reportOrderRepository;

    public void validateAdminRole() {
        String role = AuditContext.getCurrentUserRole();
        if (role == null || !role.equalsIgnoreCase("ADMIN")) {
            throw ApiException.forbidden("Bạn không có quyền truy cập báo cáo quản trị (Yêu cầu quyền ADMIN)");
        }
    }

    public AdminDashboardReportResponse getDashboardReport(LocalDate startDate, LocalDate endDate, int topLimit) {
        validateAdminRole();
        DateRange range = normalizeDateRange(startDate, endDate);

        DashboardSummaryDto summary = getSummaryInternal(range);
        List<DailyRevenueDto> revenueTrends = getDailyRevenueTrendInternal(range);
        List<TopSellingItemDto> topSelling = getTopSellingProductsInternal(range, topLimit > 0 ? topLimit : 10);
        List<OrderStatusDistributionDto> orderStatusDistribution = getOrderStatusDistributionInternal(range);
        List<PaymentMethodBreakdownDto> paymentMethods = getPaymentMethodBreakdownInternal(range);

        return AdminDashboardReportResponse.builder()
                .startDate(range.startDate().toString())
                .endDate(range.endDate().toString())
                .summary(summary)
                .revenueTrends(revenueTrends)
                .topSelling(topSelling)
                .orderStatusDistribution(orderStatusDistribution)
                .paymentMethods(paymentMethods)
                .build();
    }

    public DashboardSummaryDto getSummary(LocalDate startDate, LocalDate endDate) {
        validateAdminRole();
        return getSummaryInternal(normalizeDateRange(startDate, endDate));
    }

    public List<DailyRevenueDto> getDailyRevenueTrend(LocalDate startDate, LocalDate endDate) {
        validateAdminRole();
        return getDailyRevenueTrendInternal(normalizeDateRange(startDate, endDate));
    }

    public List<TopSellingItemDto> getTopSellingProducts(LocalDate startDate, LocalDate endDate, int limit) {
        validateAdminRole();
        return getTopSellingProductsInternal(normalizeDateRange(startDate, endDate), limit > 0 ? limit : 10);
    }

    public List<OrderStatusDistributionDto> getOrderStatusDistribution(LocalDate startDate, LocalDate endDate) {
        validateAdminRole();
        return getOrderStatusDistributionInternal(normalizeDateRange(startDate, endDate));
    }

    public List<PaymentMethodBreakdownDto> getPaymentMethodBreakdown(LocalDate startDate, LocalDate endDate) {
        validateAdminRole();
        return getPaymentMethodBreakdownInternal(normalizeDateRange(startDate, endDate));
    }

    private DashboardSummaryDto getSummaryInternal(DateRange range) {
        SummaryStatsProjection stats = reportOrderRepository.getSummaryStats(range.startDateTime(), range.endDateTime());
        if (stats == null) {
            return DashboardSummaryDto.builder()
                    .totalOrders(0)
                    .totalRevenue(0.0)
                    .completedOrders(0)
                    .cancelledOrders(0)
                    .pendingOrders(0)
                    .averageOrderValue(0.0)
                    .totalDiscountAmount(0.0)
                    .build();
        }

        long totalOrders = stats.getTotalOrders() != null ? stats.getTotalOrders() : 0L;
        double totalRevenue = stats.getTotalRevenue() != null ? stats.getTotalRevenue() : 0.0;
        long completedOrders = stats.getCompletedOrders() != null ? stats.getCompletedOrders() : 0L;
        long cancelledOrders = stats.getCancelledOrders() != null ? stats.getCancelledOrders() : 0L;
        long pendingOrders = stats.getPendingOrders() != null ? stats.getPendingOrders() : 0L;
        double totalDiscount = stats.getTotalDiscount() != null ? stats.getTotalDiscount() : 0.0;

        double aov = completedOrders > 0 ? totalRevenue / completedOrders : 0.0;

        return DashboardSummaryDto.builder()
                .totalOrders(totalOrders)
                .totalRevenue(totalRevenue)
                .completedOrders(completedOrders)
                .cancelledOrders(cancelledOrders)
                .pendingOrders(pendingOrders)
                .averageOrderValue(Math.round(aov * 100.0) / 100.0)
                .totalDiscountAmount(totalDiscount)
                .build();
    }

    private List<DailyRevenueDto> getDailyRevenueTrendInternal(DateRange range) {
        List<DailyRevenueProjection> rows = reportOrderRepository.getDailyRevenueTrend(range.startDateTime(), range.endDateTime());
        return rows.stream().map(r -> DailyRevenueDto.builder()
                .reportDate(r.getReportDate())
                .revenue(r.getRevenue() != null ? r.getRevenue() : 0.0)
                .totalOrders(r.getTotalOrders() != null ? r.getTotalOrders() : 0L)
                .completedOrders(r.getCompletedOrders() != null ? r.getCompletedOrders() : 0L)
                .cancelledOrders(r.getCancelledOrders() != null ? r.getCancelledOrders() : 0L)
                .build()
        ).toList();
    }

    private List<TopSellingItemDto> getTopSellingProductsInternal(DateRange range, int limit) {
        List<TopSellingItemProjection> rows = reportOrderRepository.getTopSellingProducts(range.startDateTime(), range.endDateTime(), limit);
        return rows.stream().map(r -> TopSellingItemDto.builder()
                .milkTeaId(r.getMilkTeaId())
                .milkTeaName(r.getMilkTeaName())
                .totalQuantitySold(r.getTotalQuantitySold() != null ? r.getTotalQuantitySold() : 0L)
                .totalRevenue(r.getTotalRevenue() != null ? r.getTotalRevenue() : 0.0)
                .image(r.getImage())
                .build()
        ).toList();
    }

    private List<OrderStatusDistributionDto> getOrderStatusDistributionInternal(DateRange range) {
        List<OrderStatusCountProjection> rows = reportOrderRepository.getOrderStatusDistribution(range.startDateTime(), range.endDateTime());
        long total = rows.stream().mapToLong(r -> r.getCount() != null ? r.getCount() : 0L).sum();

        return rows.stream().map(r -> {
            long count = r.getCount() != null ? r.getCount() : 0L;
            double pct = total > 0 ? (count * 100.0 / total) : 0.0;
            return OrderStatusDistributionDto.builder()
                    .status(r.getStatus())
                    .count(count)
                    .percentage(Math.round(pct * 10.0) / 10.0)
                    .build();
        }).toList();
    }

    private List<PaymentMethodBreakdownDto> getPaymentMethodBreakdownInternal(DateRange range) {
        List<PaymentMethodCountProjection> rows = reportOrderRepository.getPaymentMethodBreakdown(range.startDateTime(), range.endDateTime());
        return rows.stream().map(r -> PaymentMethodBreakdownDto.builder()
                .paymentMethod(r.getPaymentMethod())
                .orderCount(r.getOrderCount() != null ? r.getOrderCount() : 0L)
                .totalAmount(r.getTotalAmount() != null ? r.getTotalAmount() : 0.0)
                .build()
        ).toList();
    }

    private record DateRange(LocalDate startDate, LocalDate endDate, LocalDateTime startDateTime, LocalDateTime endDateTime) {
    }

    private DateRange normalizeDateRange(LocalDate startDate, LocalDate endDate) {
        LocalDate start = (startDate != null) ? startDate : LocalDate.now().minusDays(30);
        LocalDate end = (endDate != null) ? endDate : LocalDate.now();

        if (start.isAfter(end)) {
            throw ApiException.badRequest("Ngày bắt đầu không được lớn hơn ngày kết thúc");
        }

        LocalDateTime startDateTime = start.atStartOfDay();
        LocalDateTime endDateTime = end.atTime(LocalTime.MAX);
        return new DateRange(start, end, startDateTime, endDateTime);
    }
}
