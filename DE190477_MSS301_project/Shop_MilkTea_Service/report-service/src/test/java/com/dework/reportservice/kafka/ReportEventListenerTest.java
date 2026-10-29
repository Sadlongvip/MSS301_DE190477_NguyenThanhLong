package com.dework.reportservice.kafka;

import com.dework.reportservice.service.ReportSyncService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class ReportEventListenerTest {

    @Mock
    private ReportSyncService reportSyncService;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private ReportEventListener reportEventListener;

    @BeforeEach
    void setUp() {
        objectMapper.findAndRegisterModules();
    }

    @Test
    @DisplayName("handleOrderEvents nhận OrderCreatedEvent và gọi syncOrderFromOrderService")
    void handleOrderEvents_OrderCreated() {
        String json = """
                {
                    "orderCode": "ORD-2001",
                    "totalAmount": 55000.0,
                    "items": [{"milkTeaId": 1, "milkTeaName": "Trà sữa", "quantity": 1}]
                }
                """;

        reportEventListener.handleOrderEvents(json);

        verify(reportSyncService).syncOrderFromOrderService("ORD-2001");
    }

    @Test
    @DisplayName("handleOrderEvents nhận OrderCancelledEvent và gọi updateOrderStatus")
    void handleOrderEvents_OrderCancelled() {
        String json = """
                {
                    "orderCode": "ORD-2002",
                    "reason": "Khách đổi ý"
                }
                """;

        reportEventListener.handleOrderEvents(json);

        verify(reportSyncService).updateOrderStatus("ORD-2002", "CANCELLED", null, "Khách đổi ý");
    }

    @Test
    @DisplayName("handleOrderEvents nhận OrderStatusUpdatedEvent và gọi updateOrderStatus")
    void handleOrderEvents_OrderStatusUpdated() {
        String json = """
                {
                    "orderCode": "ORD-2003",
                    "status": "COMPLETED",
                    "paymentStatus": "PAID"
                }
                """;

        reportEventListener.handleOrderEvents(json);

        verify(reportSyncService).updateOrderStatus("ORD-2003", "COMPLETED", "PAID", null);
    }

    @Test
    @DisplayName("handlePaymentEvents nhận PaymentSuccessEvent và gọi updatePaymentStatus PAID")
    void handlePaymentEvents_PaymentSuccess() {
        String json = """
                {
                    "orderCode": "ORD-2004",
                    "transactionCode": "TXN-999"
                }
                """;

        reportEventListener.handlePaymentEvents(json);

        verify(reportSyncService).updatePaymentStatus("ORD-2004", "PAID");
    }

    @Test
    @DisplayName("handlePaymentEvents nhận PaymentFailedEvent và gọi updatePaymentStatus FAILED")
    void handlePaymentEvents_PaymentFailed() {
        String json = """
                {
                    "orderCode": "ORD-2005",
                    "reason": "Thẻ hết hạn"
                }
                """;

        reportEventListener.handlePaymentEvents(json);

        verify(reportSyncService).updatePaymentStatus("ORD-2005", "FAILED");
    }
}

