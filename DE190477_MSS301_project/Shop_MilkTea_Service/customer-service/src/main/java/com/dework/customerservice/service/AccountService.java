package com.dework.customerservice.service;

import com.dework.customerservice.context.AuditContext;
import com.dework.customerservice.dto.AccountRequest;
import com.dework.customerservice.dto.AccountResponse;
import com.dework.customerservice.exception.ApiException;
import com.dework.customerservice.model.Account;
import com.dework.customerservice.model.AccountStatus;
import com.dework.customerservice.model.Role;
import com.dework.customerservice.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AccountService {

    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.username:admin}")
    private String adminUsername;

    @Transactional
    public AccountResponse createAccount(AccountRequest request) {
        ensureUsernameAndEmailAvailable(request.getUsername(), request.getEmail(), null);

        Account account = Account.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole() != null ? request.getRole() : Role.CUSTOMER)
                .email(request.getEmail())
                .status(request.getStatus() != null ? request.getStatus() : AccountStatus.ACTIVE)
                .phoneNumber(request.getPhoneNumber())
                .address(request.getAddress())
                .birthday(request.getBirthday())
                .build();

        Account saved = accountRepository.save(account);
        log.info("Account created: id={}, username={}, role={}", saved.getId(), saved.getUsername(), saved.getRole());
        return AccountResponse.from(saved);
    }

    public AccountResponse getAccountById(Long id) {
        return AccountResponse.from(findAccount(id));
    }

    public List<AccountResponse> getAllAccounts() {
        return accountRepository.findAll(Sort.by("id").ascending())
                .stream()
                .map(AccountResponse::from)
                .toList();
    }

    public List<AccountResponse> searchAccounts(String keyword) {
        List<Account> accounts = (keyword == null || keyword.isBlank())
                ? accountRepository.findAll(Sort.by("id").ascending())
                : accountRepository.findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrderByIdAsc(
                        keyword.trim(), keyword.trim());
        return accounts.stream().map(AccountResponse::from).toList();
    }

    @Transactional
    public AccountResponse updateAccount(Long id, AccountRequest request) {
        Account account = findAccount(id);
        ensureUsernameAndEmailAvailable(request.getUsername(), request.getEmail(), id);

        account.setUsername(request.getUsername());
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            account.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        if (request.getRole() != null) {
            account.setRole(request.getRole());
        }
        account.setEmail(request.getEmail());
        if (request.getStatus() != null) {
            account.setStatus(request.getStatus());
        }
        account.setPhoneNumber(request.getPhoneNumber());
        account.setAddress(request.getAddress());
        account.setBirthday(request.getBirthday());
        account.setUpdatedAt(LocalDateTime.now());
        account.setUpdatedBy(AuditContext.getCurrentUser());

        Account updated = accountRepository.save(account);
        log.info("Account updated: id={}, username={}", updated.getId(), updated.getUsername());
        return AccountResponse.from(updated);
    }

    @Transactional
    public void deleteAccount(Long id) {
        Account account = findAccount(id);
        account.setStatus(AccountStatus.INACTIVE);
        accountRepository.save(account);
        log.info("Account soft-deleted (status set to INACTIVE): id={}", id);
    }

    private Account findAccount(Long id) {
        return accountRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Account not found with id: " + id));
    }

    private void ensureUsernameAndEmailAvailable(String username, String email, Long excludeId) {
        if (adminUsername.equalsIgnoreCase(username)) {
            throw ApiException.conflict("Username conflicts with admin account: " + username);
        }

        boolean usernameExists = excludeId == null
                ? accountRepository.existsByUsername(username)
                : accountRepository.existsByUsernameAndIdNot(username, excludeId);
        if (usernameExists) {
            throw ApiException.conflict("Username is already in use: " + username);
        }

        boolean emailExists = excludeId == null
                ? accountRepository.existsByEmail(email)
                : accountRepository.existsByEmailAndIdNot(email, excludeId);
        if (emailExists) {
            throw ApiException.conflict("Email is already in use: " + email);
        }
    }
}
