package com.mss301.order.saga;

import com.mss301.order.entity.Order;
import com.mss301.order.entity.SagaStatus;
import com.mss301.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderSagaRecoveryService {

    private final OrderRepository orderRepository;
    private final OrderSagaOrchestrator orchestrator;

    // [EXT-4]: Tự động quét các order bị treo ở trạng thái COMPENSATING
    // chạy định kỳ mỗi 60 giây để thử bồi hoàn lại khi các service đã online trở lại.
    @Scheduled(fixedDelay = 60000)
    public void scanAndRecoverHangingSagas() {
        List<Order> stuckOrders = orderRepository.findAll().stream()
                .filter(o -> o.getSagaStatus() == SagaStatus.COMPENSATING)
                .toList();

        if (!stuckOrders.isEmpty()) {
            log.info("Phát hiện {} đơn hàng đang treo COMPENSATING, tiến hành khôi phục...", stuckOrders.size());
            for (Order order : stuckOrders) {
                try {
                    orchestrator.recoverCompensation(order.getId());
                } catch (Exception ex) {
                    log.error("Lỗi khi khôi phục tự động order={}: {}", order.getId(), ex.getMessage());
                }
            }
        }
    }
}
