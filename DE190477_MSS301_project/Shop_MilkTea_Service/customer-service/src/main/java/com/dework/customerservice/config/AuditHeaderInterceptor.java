package com.dework.customerservice.config;

import com.dework.customerservice.context.AuditContext;
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
            AuditContext.setCurrentUser(username);
        } else {
            AuditContext.setCurrentUser("SYSTEM");
        }
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        AuditContext.clear();
    }
}
