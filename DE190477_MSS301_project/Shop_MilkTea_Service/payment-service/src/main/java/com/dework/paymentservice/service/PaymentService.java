package com.dework.paymentservice.service;

import com.dework.paymentservice.dto.PaymentRequestDTO;
import com.dework.paymentservice.dto.PaymentResponseDTO;
import jakarta.servlet.http.HttpServletRequest;

import java.util.Map;

public interface PaymentService {

    PaymentResponseDTO createPayment(PaymentRequestDTO request, HttpServletRequest httpRequest);

    Map<String, String> processVNPayIpn(Map<String, String> params);

    PaymentResponseDTO getPaymentStatusByOrderCode(String orderCode);
}
