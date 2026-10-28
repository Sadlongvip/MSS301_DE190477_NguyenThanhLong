package com.dework.orderservice.service;

import com.dework.orderservice.model.Order;
import com.dework.orderservice.model.SagaStatus;
import com.dework.orderservice.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderSagaRecoveryService {

    private final OrderRepository orderRepository;
    private final OrderService orderService;

    /**
     * [EXT-4] Tự động quét các đơn hàng đang bị treo ở trạng thái COMPENSATING (Kịch bản số 8)
     * Chạy định kỳ mỗi 60 giây để thử bồi hoàn lại khi các dịch vụ (inventory, kafka...) đã hoạt động bình thường.
     */
    @Scheduled(fixedDelay = 60000)
    public void scanAndRecoverHangingSagas() {
        List<Order> stuckOrders = orderRepository.findBySagaStatus(SagaStatus.COMPENSATING);

        if (!stuckOrders.isEmpty()) {
            log.info("Phát hiện {} đơn hàng đang treo COMPENSATING, tiến hành quy trình khôi phục Saga...", stuckOrders.size());
            for (Order order : stuckOrders) {
                try {
                    orderService.recoverCompensation(order.getOrderCode());
                } catch (Exception ex) {
                    log.error("Lỗi khi khôi phục tự động đơn hàng orderCode={}: {}", order.getOrderCode(), ex.getMessage());
                }
            }
        }
    }
}
