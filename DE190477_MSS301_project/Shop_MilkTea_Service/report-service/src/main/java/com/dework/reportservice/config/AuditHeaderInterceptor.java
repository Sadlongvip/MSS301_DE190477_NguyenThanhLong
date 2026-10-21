package com.dework.reportservice.config;

import com.dework.reportservice.context.AuditContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AuditHeaderInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String username = request.getHeader("X-User-Name");
        if (username != null && !username.isBlank()) {
            AuditContext.setCurrentUser(username.trim());
        } else {
            AuditContext.setCurrentUser("SYSTEM");
        }

        String userIdStr = request.getHeader("X-User-Id");
        if (userIdStr != null && !userIdStr.isBlank()) {
            try {
                AuditContext.setCurrentUserId(Long.parseLong(userIdStr.trim()));
            } catch (NumberFormatException ignored) {
            }
        }

        String role = request.getHeader("X-User-Role");
        if (role != null && !role.isBlank()) {
            AuditContext.setCurrentUserRole(role.trim());
        }

        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        AuditContext.clear();
    }
}
