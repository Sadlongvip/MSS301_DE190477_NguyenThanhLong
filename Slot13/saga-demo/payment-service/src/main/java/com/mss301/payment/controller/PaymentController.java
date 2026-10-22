package com.mss301.payment.controller;

import com.mss301.payment.dto.PaymentRequest;
import com.mss301.payment.entity.Payment;
import com.mss301.payment.entity.Wallet;
import com.mss301.payment.repository.PaymentRepository;
import com.mss301.payment.repository.WalletRepository;
import com.mss301.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;
    private final WalletRepository walletRepository;
    private final PaymentRepository paymentRepository;

    @PostMapping("/pay")
    public Payment pay(@RequestBody PaymentRequest req,
                       @RequestHeader(value = "X-Simulate-Delay", required = false, defaultValue = "0") long delayMs) {
        // [EXT-2]: Giả lập payment xử lý chậm (> 2s) để kiểm thử HTTP Read Timeout
        if (delayMs > 0 || req.amount() == 8888.0) {
            long sleepTime = delayMs > 0 ? delayMs : 3000L;
            log.warn("[EXT-2 DEMO] Giả lập xử lý thanh toán chậm {} ms cho order={}", sleepTime, req.orderId());
            try { Thread.sleep(sleepTime); } catch (InterruptedException ignored) {}
        }
        return paymentService.pay(req);
    }

    @PostMapping("/refund/{orderId}")
    public String refund(@PathVariable Long orderId) {
        paymentService.refund(orderId);
        return "REFUNDED";
    }

    @GetMapping("/wallets")
    public List<Wallet> wallets() {
        return walletRepository.findAll();
    }

    @GetMapping
    public List<Payment> payments() {
        return paymentRepository.findAll();
    }
}
