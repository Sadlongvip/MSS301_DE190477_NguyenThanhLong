package com.fuwork.customerservice.dto;

import com.fuwork.customerservice.model.Account;
import com.fuwork.customerservice.model.AccountStatus;
import com.fuwork.customerservice.model.Role;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountResponse {

    private Long id;
    private String username;
    private Role role;
    private String email;
    private AccountStatus status;
    private String phoneNumber;
    private String address;
    private LocalDate birthday;

    public static AccountResponse from(Account account) {
        if (account == null) {
            return null;
        }
        return AccountResponse.builder()
                .id(account.getId())
                .username(account.getUsername())
                .role(account.getRole())
                .email(account.getEmail())
                .status(account.getStatus())
                .phoneNumber(account.getPhoneNumber())
                .address(account.getAddress())
                .birthday(account.getBirthday())
                .build();
    }
}
