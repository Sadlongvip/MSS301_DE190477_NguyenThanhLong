package com.dework.customerservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {

    private String accessToken;
    private String tokenType;
    private Long expiresIn;
    private String role;
    private Long userId;
    private String username;
    private String email;
}
