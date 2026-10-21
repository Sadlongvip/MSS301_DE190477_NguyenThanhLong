package com.dework.paymentservice.controller;

import com.dework.paymentservice.dto.PaymentRequestDTO;
import com.dework.paymentservice.dto.PaymentResponseDTO;
import com.dework.paymentservice.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create")
    public ResponseEntity<PaymentResponseDTO> createPayment(
            @Valid @RequestBody PaymentRequestDTO request,
            HttpServletRequest httpRequest
    ) {
        PaymentResponseDTO response = paymentService.createPayment(request, httpRequest);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/vnpay-ipn")
    public ResponseEntity<Map<String, String>> processVNPayIpn(
            @RequestParam Map<String, String> params
    ) {
        log.info("Incoming VNPay IPN webhook: {}", params);
        Map<String, String> response = paymentService.processVNPayIpn(params);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{orderCode}/status")
    public ResponseEntity<PaymentResponseDTO> getPaymentStatus(
            @PathVariable String orderCode
    ) {
        PaymentResponseDTO response = paymentService.getPaymentStatusByOrderCode(orderCode);
        return ResponseEntity.ok(response);
    }
}
