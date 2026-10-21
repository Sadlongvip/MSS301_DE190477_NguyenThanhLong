package com.dework.orderservice.repository;

import com.dework.orderservice.model.Order;
import com.dework.orderservice.model.OrderStatus;
import com.dework.orderservice.model.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderCode(String orderCode);

    boolean existsByOrderCode(String orderCode);

    @Query("SELECT o FROM Order o WHERE o.user.id = :userId ORDER BY o.createdAt DESC")
    List<Order> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId);

    List<Order> findByUser_IdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT o FROM Order o WHERE o.user.id = :userId ORDER BY o.createdAt DESC")
    Page<Order> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId, Pageable pageable);

    Page<Order> findByUser_IdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    List<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status);

    @Query("SELECT o FROM Order o WHERE " +
           "(:status IS NULL OR o.status = :status) AND " +
           "(:paymentStatus IS NULL OR o.paymentStatus = :paymentStatus) AND " +
           "(:keyword IS NULL OR :keyword = '' OR " +
           " LOWER(o.orderCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " LOWER(o.customerName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " o.phoneNumber LIKE CONCAT('%', :keyword, '%')) " +
           "ORDER BY o.createdAt DESC")
    Page<Order> searchOrders(
            @Param("status") OrderStatus status,
            @Param("paymentStatus") PaymentStatus paymentStatus,
            @Param("keyword") String keyword,
            Pageable pageable
    );
}
