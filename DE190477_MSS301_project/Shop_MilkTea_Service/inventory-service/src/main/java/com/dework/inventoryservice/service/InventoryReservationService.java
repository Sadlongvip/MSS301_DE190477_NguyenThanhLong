package com.dework.inventoryservice.service;

import com.dework.inventoryservice.event.OrderCreatedEvent;
import com.dework.inventoryservice.event.OrderItemPayload;
import com.dework.inventoryservice.model.InventoryReservation;
import com.dework.inventoryservice.model.InventoryReservationStatus;
import com.dework.inventoryservice.model.MilkTea;
import com.dework.inventoryservice.repository.InventoryReservationRepository;
import com.dework.inventoryservice.repository.MilkTeaRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryReservationService {

    private final MilkTeaRepository milkTeaRepository;
    private final InventoryReservationRepository inventoryReservationRepository;
    private final ObjectMapper objectMapper;

    /**
     * Cơ chế 1: KIỂM TRA + GIỮ HÀNG (Reserve Inventory)
     * Kiểm tra từng sản phẩm trong đơn: tồn tại, đang mở bán (isAvailable), và đủ số lượng tồn kho (stockQuantity).
     * Nếu hợp lệ -> Trừ số lượng tồn kho và lưu bản ghi giữ hàng với trạng thái RESERVED.
     */
    @Transactional
    public ReservationResult reserveInventory(OrderCreatedEvent event) {
        String orderCode = event.getOrderCode();
        log.info("Bắt đầu kiểm tra và giữ hàng cho đơn hàng: {}", orderCode);

        // Kiểm tra tính lũy đẳng (Idempotency)
        Optional<InventoryReservation> existingOpt = inventoryReservationRepository.findByOrderCode(orderCode);
        if (existingOpt.isPresent()) {
            InventoryReservation existing = existingOpt.get();
            log.info("Đơn hàng {} đã có bản ghi giữ chỗ với trạng thái: {}", orderCode, existing.getStatus());
            return new ReservationResult(existing.getStatus() == InventoryReservationStatus.RESERVED, "Đã xử lý trước đó");
        }

        List<OrderItemPayload> items = event.getItems();
        if (items == null || items.isEmpty()) {
            return new ReservationResult(false, "Đơn hàng không chứa sản phẩm nào");
        }

        // 1. Kiểm tra toàn bộ sản phẩm trước khi thao tác trừ kho
        for (OrderItemPayload item : items) {
            Long milkTeaId = item.getMilkTeaId();
            MilkTea milkTea = milkTeaRepository.findById(milkTeaId).orElse(null);

            if (milkTea == null) {
                String error = "Không tìm thấy sản phẩm có ID: " + milkTeaId;
                log.warn("Kiểm tra kho thất bại: {}", error);
                return new ReservationResult(false, error);
            }

            if (Boolean.FALSE.equals(milkTea.getIsAvailable())) {
                String error = "Sản phẩm '" + milkTea.getName() + "' hiện đang tạm ngưng phục vụ";
                log.warn("Kiểm tra kho thất bại: {}", error);
                return new ReservationResult(false, error);
            }

            int reqQty = item.getQuantity() != null ? item.getQuantity() : 1;
            int currentStock = milkTea.getStockQuantity() != null ? milkTea.getStockQuantity() : 0;
            if (currentStock < reqQty) {
                String error = "Sản phẩm '" + milkTea.getName() + "' không đủ số lượng tồn kho (Hiện có: " + currentStock + ", Yêu cầu: " + reqQty + ")";
                log.warn("Kiểm tra kho thất bại: {}", error);
                return new ReservationResult(false, error);
            }
        }

        // 2. Toàn bộ sản phẩm đạt yêu cầu -> Thực hiện trừ tồn kho (Giữ hàng)
        for (OrderItemPayload item : items) {
            MilkTea milkTea = milkTeaRepository.findById(item.getMilkTeaId()).orElseThrow();
            int reqQty = item.getQuantity() != null ? item.getQuantity() : 1;
            int newStock = milkTea.getStockQuantity() - reqQty;
            milkTea.setStockQuantity(newStock);
            milkTeaRepository.save(milkTea);
            log.info("Đã giữ hàng sản phẩm [{}]: Tồn kho giảm từ {} -> {}", milkTea.getName(), newStock + reqQty, newStock);
        }

        // 3. Lưu bản ghi giữ chỗ kho vào DB
        String itemsJson = null;
        try {
            itemsJson = objectMapper.writeValueAsString(items);
        } catch (Exception e) {
            log.error("Lỗi parse items sang JSON: {}", e.getMessage());
        }

        InventoryReservation reservation = InventoryReservation.builder()
                .orderCode(orderCode)
                .status(InventoryReservationStatus.RESERVED)
                .itemsJson(itemsJson)
                .build();
        inventoryReservationRepository.save(reservation);

        log.info("Giữ hàng thành công cho đơn hàng: {} (Trạng thái: RESERVED)", orderCode);
        return new ReservationResult(true, "Giữ hàng thành công");
    }

    /**
     * Cơ chế 2: BÙ TRỪ KHI CÓ SỰ CỐ (Compensating Transaction)
     * Khi thanh toán thất bại, hết hạn hoặc đơn bị hủy -> Hoàn trả lại số lượng tồn kho đã giữ và chuyển trạng thái sang RELEASED.
     */
    @Transactional
    public void releaseInventory(String orderCode, String reason) {
        log.info("Kích hoạt Giao dịch bù trừ (Rollback) cho đơn hàng: {}, Lý do: {}", orderCode, reason);

        Optional<InventoryReservation> reservationOpt = inventoryReservationRepository.findByOrderCode(orderCode);
        if (reservationOpt.isEmpty()) {
            log.warn("Không tìm thấy bản ghi giữ chỗ để bù trừ cho đơn hàng: {}", orderCode);
            return;
        }

        InventoryReservation reservation = reservationOpt.get();
        if (reservation.getStatus() != InventoryReservationStatus.RESERVED) {
            log.info("Bản ghi giữ chỗ của đơn hàng {} đang ở trạng thái {}, không cần bù trừ", orderCode, reservation.getStatus());
            return;
        }

        // Hoàn trả lại số lượng tồn kho cho từng sản phẩm
        if (reservation.getItemsJson() != null && !reservation.getItemsJson().isBlank()) {
            try {
                List<OrderItemPayload> items = objectMapper.readValue(
                        reservation.getItemsJson(),
                        new TypeReference<List<OrderItemPayload>>() {}
                );

                for (OrderItemPayload item : items) {
                    if (item.getMilkTeaId() != null) {
                        milkTeaRepository.findById(item.getMilkTeaId()).ifPresent(milkTea -> {
                            int reqQty = item.getQuantity() != null ? item.getQuantity() : 1;
                            int currentStock = milkTea.getStockQuantity() != null ? milkTea.getStockQuantity() : 0;
                            milkTea.setStockQuantity(currentStock + reqQty);
                            milkTeaRepository.save(milkTea);
                            log.info("Bù trừ thành công: Đã hoàn lại {} ly cho sản phẩm [{}] (Tồn mới: {})",
                                    reqQty, milkTea.getName(), milkTea.getStockQuantity());
                        });
                    }
                }
            } catch (Exception e) {
                log.error("Lỗi khi đọc itemsJson trong quá trình bù trừ: {}", e.getMessage(), e);
            }
        }

        // Cập nhật trạng thái bản ghi giữ chỗ thành RELEASED
        reservation.setStatus(InventoryReservationStatus.RELEASED);
        reservation.setReason(reason);
        inventoryReservationRepository.save(reservation);

        log.info("Hoàn tất Giao dịch bù trừ (Rollback) cho đơn hàng: {}", orderCode);
    }

    /**
     * Xác nhận giữ chỗ thành công thành xuất kho chính thức (CONFIRMED)
     */
    @Transactional
    public void confirmInventory(String orderCode) {
        inventoryReservationRepository.findByOrderCode(orderCode).ifPresent(reservation -> {
            if (reservation.getStatus() == InventoryReservationStatus.RESERVED) {
                reservation.setStatus(InventoryReservationStatus.CONFIRMED);
                inventoryReservationRepository.save(reservation);
                log.info("Xác nhận xuất hàng thành công cho đơn hàng: {}", orderCode);
            }
        });
    }

    public record ReservationResult(boolean success, String message) {}
}
