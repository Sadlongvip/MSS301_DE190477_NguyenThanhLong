package com.dework.customerservice.controller;

import com.dework.customerservice.dto.AccountRequest;
import com.dework.customerservice.dto.AccountResponse;
import com.dework.customerservice.service.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @GetMapping
    public List<AccountResponse> getAccounts(@RequestParam(required = false) String keyword) {
        return accountService.searchAccounts(keyword);
    }

    @GetMapping("/{id}")
    public AccountResponse getAccountById(@PathVariable Long id) {
        return accountService.getAccountById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AccountResponse createAccount(@Valid @RequestBody AccountRequest request) {
        return accountService.createAccount(request);
    }

    @PutMapping("/{id}")
    public AccountResponse updateAccount(@PathVariable Long id, @Valid @RequestBody AccountRequest request) {
        return accountService.updateAccount(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAccount(@PathVariable Long id) {
        accountService.deleteAccount(id);
    }
}
