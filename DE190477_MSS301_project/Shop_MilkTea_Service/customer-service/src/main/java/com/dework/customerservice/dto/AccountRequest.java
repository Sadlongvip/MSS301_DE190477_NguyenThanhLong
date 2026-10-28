package com.dework.customerservice.dto;

import com.dework.customerservice.model.AccountStatus;
import com.dework.customerservice.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountRequest {

    @NotBlank(message = "Username cannot be blank")
    private String username;

    private String password;

    @Builder.Default
    private Role role = Role.CUSTOMER;

    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Email should be valid")
    private String email;

    @Builder.Default
    private AccountStatus status = AccountStatus.ACTIVE;

    private String phoneNumber;

    private String address;

    private LocalDate birthday;
}
