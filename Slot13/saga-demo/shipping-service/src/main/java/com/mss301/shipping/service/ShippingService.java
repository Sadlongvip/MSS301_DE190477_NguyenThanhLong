package com.mss301.shipping.service;

import com.mss301.shipping.dto.CreateShipmentRequest;
import com.mss301.shipping.entity.Shipment;
import com.mss301.shipping.repository.ShipmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShippingService {

    private final ShipmentRepository shipmentRepository;

    @Transactional
    public Shipment create(CreateShipmentRequest req) {
        // Idempotent: nếu đã tạo đơn vận chuyển cho order này thì trả về luôn
        Optional<Shipment> existing = shipmentRepository.findByOrderId(req.orderId());
        if (existing.isPresent()) {
            log.info("Shipment cho order={} đã tồn tại (idempotent)", req.orderId());
            return existing.get();
        }

        // Quy tắc nghiệp vụ bài tập EXT-1: Lỗi nếu quantity > 3
        if (req.quantity() > 3) {
            log.warn("Không thể tạo shipment: quantity={} > 3", req.quantity());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Số lượng " + req.quantity() + " vượt quá giới hạn vận chuyển tối đa 3 sản phẩm");
        }

        Shipment shipment = Shipment.builder()
                .orderId(req.orderId())
                .customerId(req.customerId())
                .quantity(req.quantity())
                .address(req.address() != null ? req.address() : "Địa chỉ mặc định")
                .status("CREATED")
                .createdAt(LocalDateTime.now())
                .build();

        Shipment saved = shipmentRepository.save(shipment);
        log.info("Đã tạo shipment thành công: id={}, order={}", saved.getId(), req.orderId());
        return saved;
    }

    @Transactional
    public void cancel(Long orderId) {
        // Idempotent: tìm và cập nhật CANCELLED, nếu không có thì bỏ qua an toàn
        shipmentRepository.findByOrderId(orderId).ifPresent(shipment -> {
            if ("CREATED".equals(shipment.getStatus())) {
                shipment.setStatus("CANCELLED");
                shipmentRepository.save(shipment);
                log.info("Đã hủy shipment cho order={}", orderId);
            }
        });
    }

    public List<Shipment> findAll() {
        return shipmentRepository.findAll();
    }
}
