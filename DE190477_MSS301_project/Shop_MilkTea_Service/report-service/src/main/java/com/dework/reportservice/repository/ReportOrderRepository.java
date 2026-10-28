package com.dework.reportservice.repository;

import com.dework.reportservice.model.ReportOrder;
import com.dework.reportservice.repository.projection.DailyRevenueProjection;
import com.dework.reportservice.repository.projection.OrderStatusCountProjection;
import com.dework.reportservice.repository.projection.PaymentMethodCountProjection;
import com.dework.reportservice.repository.projection.SummaryStatsProjection;
import com.dework.reportservice.repository.projection.TopSellingItemProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReportOrderRepository extends JpaRepository<ReportOrder, Long> {

    @Query(value = """
            SELECT 
                COUNT(o.id) AS totalOrders,
                COALESCE(SUM(CASE WHEN o.status = 'COMPLETED' THEN o.total_amount ELSE 0 END), 0) AS totalRevenue,
                COUNT(CASE WHEN o.status = 'COMPLETED' THEN 1 END) AS completedOrders,
                COUNT(CASE WHEN o.status = 'CANCELLED' THEN 1 END) AS cancelledOrders,
                COUNT(CASE WHEN o.status = 'PENDING' THEN 1 END) AS pendingOrders,
                COALESCE(SUM(CASE WHEN o.status = 'COMPLETED' THEN o.discount_amount ELSE 0 END), 0) AS totalDiscount
            FROM t_orders o
            WHERE o.created_at BETWEEN :startDateTime AND :endDateTime
            """, nativeQuery = true)
    SummaryStatsProjection getSummaryStats(
            @Param("startDateTime") LocalDateTime startDateTime,
            @Param("endDateTime") LocalDateTime endDateTime
    );

    @Query(value = """
            SELECT 
                DATE(o.created_at) AS reportDate,
                COALESCE(SUM(CASE WHEN o.status = 'COMPLETED' THEN o.total_amount ELSE 0 END), 0) AS revenue,
                COUNT(o.id) AS totalOrders,
                COUNT(CASE WHEN o.status = 'COMPLETED' THEN 1 END) AS completedOrders,
                COUNT(CASE WHEN o.status = 'CANCELLED' THEN 1 END) AS cancelledOrders
            FROM t_orders o
            WHERE o.created_at BETWEEN :startDateTime AND :endDateTime
            GROUP BY DATE(o.created_at)
            ORDER BY DATE(o.created_at) ASC
            """, nativeQuery = true)
    List<DailyRevenueProjection> getDailyRevenueTrend(
            @Param("startDateTime") LocalDateTime startDateTime,
            @Param("endDateTime") LocalDateTime endDateTime
    );

    @Query(value = """
            SELECT 
                i.milk_tea_id AS milkTeaId,
                i.milk_tea_name AS milkTeaName,
                COALESCE(SUM(i.quantity), 0) AS totalQuantitySold,
                COALESCE(SUM(i.total_price), 0) AS totalRevenue,
                MAX(i.image) AS image
            FROM t_order_items i
            JOIN t_orders o ON i.order_id = o.id
            WHERE o.status = 'COMPLETED'
              AND o.created_at BETWEEN :startDateTime AND :endDateTime
            GROUP BY i.milk_tea_id, i.milk_tea_name
            ORDER BY totalQuantitySold DESC
            LIMIT :#{#limit}
            """, nativeQuery = true)
    List<TopSellingItemProjection> getTopSellingProducts(
            @Param("startDateTime") LocalDateTime startDateTime,
            @Param("endDateTime") LocalDateTime endDateTime,
            @Param("limit") int limit
    );

    @Query(value = """
            SELECT 
                o.status AS status,
                COUNT(o.id) AS count
            FROM t_orders o
            WHERE o.created_at BETWEEN :startDateTime AND :endDateTime
            GROUP BY o.status
            """, nativeQuery = true)
    List<OrderStatusCountProjection> getOrderStatusDistribution(
            @Param("startDateTime") LocalDateTime startDateTime,
            @Param("endDateTime") LocalDateTime endDateTime
    );

    @Query(value = """
            SELECT 
                o.payment_method AS paymentMethod,
                COUNT(o.id) AS orderCount,
                COALESCE(SUM(CASE WHEN o.status = 'COMPLETED' THEN o.total_amount ELSE 0 END), 0) AS totalAmount
            FROM t_orders o
            WHERE o.created_at BETWEEN :startDateTime AND :endDateTime
            GROUP BY o.payment_method
            """, nativeQuery = true)
    List<PaymentMethodCountProjection> getPaymentMethodBreakdown(
            @Param("startDateTime") LocalDateTime startDateTime,
            @Param("endDateTime") LocalDateTime endDateTime
    );

    @Query("""
            SELECT DISTINCT o FROM ReportOrder o
            LEFT JOIN FETCH o.items
            WHERE o.createdAt BETWEEN :startDateTime AND :endDateTime
              AND (:status IS NULL OR o.status = :status)
            ORDER BY o.createdAt DESC
            """)
    List<ReportOrder> findOrdersForReport(
            @Param("startDateTime") LocalDateTime startDateTime,
            @Param("endDateTime") LocalDateTime endDateTime,
            @Param("status") String status
    );
}

