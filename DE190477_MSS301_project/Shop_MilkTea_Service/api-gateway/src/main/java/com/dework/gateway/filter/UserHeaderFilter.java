package com.dework.gateway.filter;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.servlet.function.ServerRequest;

import java.util.function.Function;

public final class UserHeaderFilter {

    public static final String USER_ID = "X-User-Id";
    public static final String USER_NAME = "X-User-Name";
    public static final String USER_ROLE = "X-User-Role";

    private UserHeaderFilter() {
    }

    public static Function<ServerRequest, ServerRequest> forwardUserInfo() {
        return request -> {
            // (1) Xóa các header do client tự ý gửi lên để tránh giả mạo
            ServerRequest.Builder builder = ServerRequest.from(request)
                    .headers(headers -> {
                        headers.remove(USER_ID);
                        headers.remove(USER_NAME);
                        headers.remove(USER_ROLE);
                    });

            // (2) Chèn thông tin người dùng từ JWT đã được Spring Security xác thực
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth instanceof JwtAuthenticationToken jwtAuth) {
                Jwt jwt = jwtAuth.getToken();
                if (jwt.getClaims().get("uid") != null) {
                    builder.header(USER_ID, String.valueOf(jwt.getClaims().get("uid")));
                }
                if (jwt.getSubject() != null) {
                    builder.header(USER_NAME, jwt.getSubject());
                }
                if (jwt.getClaimAsString("role") != null) {
                    builder.header(USER_ROLE, jwt.getClaimAsString("role"));
                }
            }
            return builder.build();
        };
    }
}