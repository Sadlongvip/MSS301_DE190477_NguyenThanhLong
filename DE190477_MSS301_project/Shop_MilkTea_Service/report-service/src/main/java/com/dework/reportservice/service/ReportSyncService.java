package com.dework.reportservice.service;

import com.dework.reportservice.client.OrderClient;
import com.dework.reportservice.client.dto.OrderItemResponseDto;
import com.dework.reportservice.client.dto.OrderResponseDto;
import com.dework.reportservice.client.dto.PageResponseDto;
import com.dework.reportservice.model.ReportOrder;
import com.dework.reportservice.model.ReportOrderItem;
import com.dework.reportservice.repository.ReportOrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportSyncService {

    private final ReportOrderRepository reportOrderRepository;
    private final OrderClient orderClient;

    /**
     * Tự động đồng bộ ban đầu khi report-service khởi động nếu report_db còn trống
     */
    @Async
    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        try {
            long currentCount = reportOrderRepository.count();
            if (currentCount == 0) {
                log.info("Cơ sở dữ liệu report_db chưa có dữ liệu đơn hàng. Bắt đầu tự động đồng bộ từ order-service...");
                int synced = syncAllOrdersFromOrderService();
                log.info("Đồng bộ ban đầu hoàn tất: Đã nạp {} đơn hàng vào report_db", synced);
            } else {
                log.info("Cơ sở dữ liệu report_db đã có {} đơn hàng sẵn sàng phục vụ báo cáo", currentCount);
            }
        } catch (Exception e) {
            log.warn("Không thể tự động đồng bộ lúc khởi động (order-service có thể chưa online): {}", e.getMessage());
        }
    }

    /**
     * Đồng bộ toàn bộ đơn hàng từ order-service vào report_db qua REST OpenFeign
     */
    @Transactional
    public int syncAllOrdersFromOrderService() {
        int page = 0;
        int pageSize = 100;
        int totalSynced = 0;

        try {
            while (true) {
                PageResponseDto<OrderResponseDto> pageData = orderClient.searchOrders(page, pageSize);
                if (pageData == null || pageData.getContent() == null || pageData.getContent().isEmpty()) {
                    break;
                }

                for (OrderResponseDto dto : pageData.getContent()) {
                    upsertOrderFromDto(dto);
                    totalSynced++;
                }

                page++;
                if (page >= pageData.getTotalPages()) {
                    break;
                }
            }
            log.info("Đã đồng bộ tổng cộng {} đơn hàng từ order-service sang report_db", totalSynced);
            return totalSynced;
        } catch (Exception e) {
            log.error("Lỗi khi đồng bộ đơn hàng từ order-service: {}", e.getMessage(), e);
            throw new RuntimeException("Đồng bộ thất bại: " + e.getMessage(), e);
        }
    }

    /**
     * Đồng bộ một đơn hàng cụ thể từ order-service theo mã đơn
     */
    @Transactional
    public ReportOrder syncOrderFromOrderService(String orderCode) {
        if (orderCode == null || orderCode.isBlank()) {
            return null;
        }

        try {
            OrderResponseDto dto = orderClient.getOrderByCode(orderCode);
            if (dto != null) {
                return upsertOrderFromDto(dto);
            }
        } catch (Exception e) {
            log.warn("Không thể tải đơn hàng {} từ order-service: {}", orderCode, e.getMessage());
        }
        return null;
    }

    /**
     * Lưu mới hoặc cập nhật một đơn hàng từ DTO vào report_db (Idempotent)
     */
    @Transactional
    public ReportOrder upsertOrderFromDto(OrderResponseDto dto) {
        if (dto == null || dto.getOrderCode() == null) {
            return null;
        }

        ReportOrder order = reportOrderRepository.findByOrderCode(dto.getOrderCode()).orElse(null);
        if (order == null) {
            order = new ReportOrder();
            order.setOrderCode(dto.getOrderCode());
            order.setCreatedAt(dto.getCreatedAt() != null ? dto.getCreatedAt() : LocalDateTime.now());
        }

        order.setUserId(dto.getUserId());
        order.setCustomerName(dto.getCustomerName() != null ? dto.getCustomerName() : "Khách vãng lai");
        order.setPhoneNumber(dto.getPhoneNumber() != null ? dto.getPhoneNumber() : "");
        order.setShippingAddress(dto.getShippingAddress() != null ? dto.getShippingAddress() : "");
        order.setNote(dto.getNote());
        order.setSubtotal(dto.getSubtotal() != null ? dto.getSubtotal() : 0.0);
        order.setShippingFee(dto.getShippingFee() != null ? dto.getShippingFee() : 0.0);
        order.setDiscountAmount(dto.getDiscountAmount() != null ? dto.getDiscountAmount() : 0.0);
        order.setTotalAmount(dto.getTotalAmount() != null ? dto.getTotalAmount() : 0.0);
        order.setVoucherCode(dto.getVoucherCode());
        order.setPaymentMethod(dto.getPaymentMethod() != null ? dto.getPaymentMethod() : "COD");
        order.setPaymentStatus(dto.getPaymentStatus() != null ? dto.getPaymentStatus() : "UNPAID");
        order.setStatus(dto.getStatus() != null ? dto.getStatus() : "PENDING");
        order.setCancelReason(dto.getCancelReason());

        if (order.getItems() == null) {
            order.setItems(new ArrayList<>());
        } else {
            order.getItems().clear();
        }

        if (dto.getItems() != null) {
            for (OrderItemResponseDto itemDto : dto.getItems()) {
                ReportOrderItem item = ReportOrderItem.builder()
                        .milkTeaId(itemDto.getMilkTeaId())
                        .milkTeaName(itemDto.getMilkTeaName())
                        .size(itemDto.getSize())
                        .sugar(itemDto.getSugar())
                        .ice(itemDto.getIce())
                        .toppings(itemDto.getToppings())
                        .quantity(itemDto.getQuantity() != null ? itemDto.getQuantity() : 1)
                        .unitPrice(itemDto.getUnitPrice() != null ? itemDto.getUnitPrice() : 0.0)
                        .totalPrice(itemDto.getTotalPrice() != null ? itemDto.getTotalPrice() : 0.0)
                        .image(itemDto.getImage())
                        .note(itemDto.getNote())
                        .createdAt(order.getCreatedAt())
                        .build();
                order.getItems().add(item);
            }
        }

        return reportOrderRepository.save(order);
    }

    /**
     * Cập nhật trạng thái đơn hàng khi nhận event từ Kafka
     */
    @Transactional
    public void updateOrderStatus(String orderCode, String newStatus, String paymentStatus, String cancelReason) {
        ReportOrder order = reportOrderRepository.findByOrderCode(orderCode).orElse(null);
        if (order != null) {
            if (newStatus != null && !newStatus.isBlank()) {
                order.setStatus(newStatus);
            }
            if (paymentStatus != null && !paymentStatus.isBlank()) {
                order.setPaymentStatus(paymentStatus);
            }
            if (cancelReason != null && !cancelReason.isBlank()) {
                order.setCancelReason(cancelReason);
            }
            reportOrderRepository.save(order);
            log.info("Report DB: Đã cập nhật trạng thái đơn {}: status={}, paymentStatus={}", orderCode, newStatus, paymentStatus);
        } else {
            // Nếu chưa có đơn trong report_db, kéo toàn bộ thông tin từ order-service
            syncOrderFromOrderService(orderCode);
        }
    }

    /**
     * Cập nhật trạng thái thanh toán khi nhận event thanh toán từ Kafka
     */
    @Transactional
    public void updatePaymentStatus(String orderCode, String paymentStatus) {
        ReportOrder order = reportOrderRepository.findByOrderCode(orderCode).orElse(null);
        if (order != null) {
            order.setPaymentStatus(paymentStatus);
            if ("PAID".equalsIgnoreCase(paymentStatus) && "PENDING".equalsIgnoreCase(order.getStatus())) {
                order.setStatus("CONFIRMED");
            }
            reportOrderRepository.save(order);
            log.info("Report DB: Đã cập nhật paymentStatus cho đơn {}: {}", orderCode, paymentStatus);
        } else {
            syncOrderFromOrderService(orderCode);
        }
    }
}

