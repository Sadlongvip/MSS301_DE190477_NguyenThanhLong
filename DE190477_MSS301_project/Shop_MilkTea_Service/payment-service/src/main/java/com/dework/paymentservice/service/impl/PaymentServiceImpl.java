package com.dework.paymentservice.service.impl;

import com.dework.paymentservice.client.OrderClient;
import com.dework.paymentservice.config.VNPayConfig;
import com.dework.paymentservice.dto.PaymentRequestDTO;
import com.dework.paymentservice.dto.PaymentResponseDTO;
import com.dework.paymentservice.event.PaymentFailedEvent;
import com.dework.paymentservice.event.PaymentSuccessEvent;
import com.dework.paymentservice.kafka.PaymentEventProducer;
import com.dework.paymentservice.model.PaymentMethod;
import com.dework.paymentservice.model.PaymentStatus;
import com.dework.paymentservice.model.PaymentTransaction;
import com.dework.paymentservice.repository.PaymentTransactionRepository;
import com.dework.paymentservice.service.PaymentService;
import com.dework.paymentservice.util.VNPayUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TimeZone;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final VNPayConfig vnPayConfig;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final OrderClient orderClient;
    private final PaymentEventProducer paymentEventProducer;

    @Override
    @Transactional
    public PaymentResponseDTO createPayment(PaymentRequestDTO request, HttpServletRequest httpRequest) {
        log.info("Creating payment transaction for order: {}", request.getOrderCode());

        String transactionCode = "PAY_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String paymentUrl = null;

        if (request.getPaymentMethod() == PaymentMethod.VNPAY) {
            paymentUrl = buildVNPayUrl(request, transactionCode, httpRequest);
        }

        PaymentTransaction transaction = PaymentTransaction.builder()
                .transactionCode(transactionCode)
                .orderCode(request.getOrderCode())
                .userId(request.getUserId())
                .amount(request.getAmount())
                .paymentMethod(request.getPaymentMethod())
                .status(PaymentStatus.PENDING)
                .bankCode(request.getBankCode())
                .orderInfo(request.getOrderInfo() != null ? request.getOrderInfo() : "Thanh toan don hang " + request.getOrderCode())
                .payUrl(paymentUrl)
                .build();

        paymentTransactionRepository.save(transaction);

        return PaymentResponseDTO.builder()
                .transactionCode(transactionCode)
                .orderCode(request.getOrderCode())
                .amount(request.getAmount())
                .paymentMethod(request.getPaymentMethod())
                .status(PaymentStatus.PENDING)
                .paymentUrl(paymentUrl)
                .message("Payment initiated successfully")
                .build();
    }

    @Override
    @Transactional
    public Map<String, String> processVNPayIpn(Map<String, String> params) {
        log.info("Received VNPay IPN callback with params: {}", params);
        Map<String, String> response = new HashMap<>();

        Map<String, String> fields = new HashMap<>(params);
        String vnpSecureHash = fields.remove("vnp_SecureHash");
        fields.remove("vnp_SecureHashType");

        // 1. Kiểm tra chữ ký Checksum
        String signValue = VNPayUtil.hashAllFields(fields);
        String calculatedHash = VNPayUtil.hmacSHA512(vnPayConfig.getHashSecret(), signValue);

        if (!calculatedHash.equalsIgnoreCase(vnpSecureHash)) {
            log.error("Invalid checksum from VNPay. Calculated: {}, Received: {}", calculatedHash, vnpSecureHash);
            response.put("RspCode", "97");
            response.put("Message", "Invalid Checksum");
            return response;
        }

        // 2. Tìm đơn giao dịch
        String transactionCode = params.get("vnp_TxnRef");
        PaymentTransaction transaction = paymentTransactionRepository.findByTransactionCode(transactionCode)
                .orElse(null);

        if (transaction == null) {
            log.warn("Transaction not found for TxnRef: {}", transactionCode);
            response.put("RspCode", "01");
            response.put("Message", "Order not found");
            return response;
        }

        // 3. Kiểm tra số tiền
        long vnpAmount = Long.parseLong(params.get("vnp_Amount")) / 100;
        long expectedAmount = transaction.getAmount() != null ? transaction.getAmount().longValue() : 0L;
        if (vnpAmount != expectedAmount) {
            log.warn("Invalid amount for TxnRef {}. Expected: {}, Received: {}", transactionCode, expectedAmount, vnpAmount);
            response.put("RspCode", "04");
            response.put("Message", "Invalid Amount");
            return response;
        }

        // 4. Kiểm tra trạng thái hiện tại (Idempotency)
        if (transaction.getStatus() != PaymentStatus.PENDING) {
            log.info("Transaction {} already confirmed with status: {}", transactionCode, transaction.getStatus());
            response.put("RspCode", "02");
            response.put("Message", "Order already confirmed");
            return response;
        }

        // 5. Cập nhật kết quả thanh toán
        String responseCode = params.get("vnp_ResponseCode");
        transaction.setResponseCode(responseCode);
        transaction.setBankCode(params.get("vnp_BankCode"));
        transaction.setVnpTransactionNo(params.get("vnp_TransactionNo"));
        transaction.setPaymentTime(LocalDateTime.now());

        boolean isSuccess = "00".equals(responseCode);
        if (isSuccess) {
            transaction.setStatus(PaymentStatus.SUCCESS);
            log.info("Payment success for order {}", transaction.getOrderCode());
            paymentEventProducer.publishPaymentSuccess(PaymentSuccessEvent.builder()
                    .orderCode(transaction.getOrderCode())
                    .transactionCode(transaction.getTransactionCode())
                    .amount(transaction.getAmount())
                    .paymentMethod(transaction.getPaymentMethod() != null ? transaction.getPaymentMethod().name() : "VNPAY")
                    .build());
        } else {
            transaction.setStatus(PaymentStatus.FAILED);
            log.warn("Payment failed with response code {} for order {}", responseCode, transaction.getOrderCode());
            paymentEventProducer.publishPaymentFailed(PaymentFailedEvent.builder()
                    .orderCode(transaction.getOrderCode())
                    .transactionCode(transaction.getTransactionCode())
                    .reason("Thanh toán VNPay không thành công (Mã phản hồi VNPay: " + responseCode + ")")
                    .build());
        }

        paymentTransactionRepository.save(transaction);

        // 6. Báo dự phòng cho order-service
        notifyOrderService(transaction.getOrderCode(), isSuccess ? "PAID" : "FAILED");

        response.put("RspCode", "00");
        response.put("Message", "Confirm Success");
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponseDTO getPaymentStatusByOrderCode(String orderCode) {
        PaymentTransaction transaction = paymentTransactionRepository.findTopByOrderCodeOrderByCreatedAtDesc(orderCode)
                .orElseThrow(() -> new RuntimeException("No payment transaction found for order: " + orderCode));

        return PaymentResponseDTO.builder()
                .transactionCode(transaction.getTransactionCode())
                .orderCode(transaction.getOrderCode())
                .amount(transaction.getAmount())
                .paymentMethod(transaction.getPaymentMethod())
                .status(transaction.getStatus())
                .paymentUrl(transaction.getPayUrl())
                .message("Payment status retrieved")
                .build();
    }

    private String buildVNPayUrl(PaymentRequestDTO request, String transactionCode, HttpServletRequest httpRequest) {
        Map<String, String> vnpParams = new HashMap<>();
        vnpParams.put("vnp_Version", vnPayConfig.getVersion());
        vnpParams.put("vnp_Command", vnPayConfig.getCommand());
        vnpParams.put("vnp_TmnCode", vnPayConfig.getTmnCode());
        vnpParams.put("vnp_Amount", String.valueOf((long) (request.getAmount() * 100)));
        vnpParams.put("vnp_CurrCode", "VND");
        vnpParams.put("vnp_TxnRef", transactionCode);
        vnpParams.put("vnp_OrderInfo", request.getOrderInfo() != null ? request.getOrderInfo() : "Thanh toan don hang " + request.getOrderCode());
        vnpParams.put("vnp_OrderType", vnPayConfig.getOrderType());
        vnpParams.put("vnp_Locale", "vn");
        vnpParams.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl());
        vnpParams.put("vnp_IpAddr", VNPayUtil.getIpAddress(httpRequest));

        if (request.getBankCode() != null && !request.getBankCode().isBlank()) {
            vnpParams.put("vnp_BankCode", request.getBankCode());
        }

        Calendar calendar = Calendar.getInstance(TimeZone.getTimeZone("GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        formatter.setTimeZone(TimeZone.getTimeZone("GMT+7"));
        String createDate = formatter.format(calendar.getTime());
        vnpParams.put("vnp_CreateDate", createDate);

        calendar.add(Calendar.MINUTE, 15);
        String expireDate = formatter.format(calendar.getTime());
        vnpParams.put("vnp_ExpireDate", expireDate);

        String hashData = VNPayUtil.hashAllFields(vnpParams);
        String secureHash = VNPayUtil.hmacSHA512(vnPayConfig.getHashSecret(), hashData);
        String queryUrl = VNPayUtil.buildQueryUrl(vnpParams);

        log.info("VNPay Generated URL for order: {}, hashData: {}, secureHash: {}", request.getOrderCode(), hashData, secureHash);

        return vnPayConfig.getPayUrl() + "?" + queryUrl + "&vnp_SecureHash=" + secureHash;
    }

    private void notifyOrderService(String orderCode, String paymentStatus) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("paymentStatus", paymentStatus);
            orderClient.updatePaymentStatus(orderCode, payload);
            log.info("Successfully notified order-service for order {}", orderCode);
        } catch (Exception ex) {
            log.warn("Could not notify order-service directly (order-service might be offline or endpoint not ready): {}", ex.getMessage());
        }
    }
}
