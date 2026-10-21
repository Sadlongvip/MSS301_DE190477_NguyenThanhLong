package com.dework.customerservice.controller;

import com.dework.customerservice.dto.AccountRequest;
import com.dework.customerservice.dto.AccountResponse;
import com.dework.customerservice.dto.LoginRequest;
import com.dework.customerservice.dto.LoginResponse;
import com.dework.customerservice.service.AccountService;
import com.dework.customerservice.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final AccountService accountService;

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AccountResponse register(@Valid @RequestBody AccountRequest request) {
        return accountService.createAccount(request);
    }
}
