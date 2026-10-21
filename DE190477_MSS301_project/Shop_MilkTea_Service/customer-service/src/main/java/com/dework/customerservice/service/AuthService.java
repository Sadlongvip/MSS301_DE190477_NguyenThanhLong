package com.dework.customerservice.service;

import com.dework.customerservice.dto.LoginRequest;
import com.dework.customerservice.dto.LoginResponse;
import com.dework.customerservice.exception.ApiException;
import com.dework.customerservice.model.Account;
import com.dework.customerservice.model.AccountStatus;
import com.dework.customerservice.repository.AccountRepository;
import com.dework.customerservice.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final long ADMIN_ID = 0L;

    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Value("${app.admin.username:admin}")
    private String adminUsername;

    @Value("${app.admin.password:admin123}")
    private String adminPassword;

    @Value("${app.admin.role:ADMIN}")
    private String adminRole;

    public LoginResponse login(LoginRequest request) {
        // 1. Kiểm tra tài khoản Admin cấu hình in-memory (trong application.properties)
        if (adminUsername.equalsIgnoreCase(request.getUsername())) {
            if (!adminPassword.equals(request.getPassword())) {
                throw ApiException.unauthorized("Invalid username or password");
            }
            return buildResponse(ADMIN_ID, adminUsername, "admin@milkteashop.com", adminRole);
        }

        // 2. Kiểm tra tài khoản khách hàng / nhân viên trong database (theo username hoặc email)
        Account account = accountRepository.findByUsernameOrEmail(request.getUsername(), request.getUsername())
                .orElseThrow(() -> ApiException.unauthorized("Invalid username or password"));

        // 3. So khớp mật khẩu mã hóa BCrypt
        if (!passwordEncoder.matches(request.getPassword(), account.getPassword())) {
            throw ApiException.unauthorized("Invalid username or password");
        }

        // 4. Chặn tài khoản bị vô hiệu hóa (INACTIVE)
        if (account.getStatus() == AccountStatus.INACTIVE) {
            throw ApiException.forbidden("Your account is inactive. Please contact the administrator.");
        }

        return buildResponse(account.getId(), account.getUsername(), account.getEmail(), account.getRole().name());
    }

    private LoginResponse buildResponse(Long userId, String username, String email, String role) {
        String token = jwtService.generateToken(userId, username, role);
        return LoginResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .expiresIn(jwtService.getExpirationSeconds())
                .role(role)
                .userId(userId)
                .username(username)
                .email(email)
                .build();
    }
}
