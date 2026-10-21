package com.dework.reportservice.context;

public final class AuditContext {

    private static final ThreadLocal<String> CURRENT_USER = new ThreadLocal<>();
    private static final ThreadLocal<Long> CURRENT_USER_ID = new ThreadLocal<>();
    private static final ThreadLocal<String> CURRENT_USER_ROLE = new ThreadLocal<>();

    private AuditContext() {
    }

    public static void setCurrentUser(String username) {
        CURRENT_USER.set(username);
    }

    public static String getCurrentUser() {
        String user = CURRENT_USER.get();
        return (user != null && !user.isBlank()) ? user : "SYSTEM";
    }

    public static void setCurrentUserId(Long userId) {
        CURRENT_USER_ID.set(userId);
    }

    public static Long getCurrentUserId() {
        return CURRENT_USER_ID.get();
    }

    public static void setCurrentUserRole(String role) {
        CURRENT_USER_ROLE.set(role);
    }

    public static String getCurrentUserRole() {
        return CURRENT_USER_ROLE.get();
    }

    public static void clear() {
        CURRENT_USER.remove();
        CURRENT_USER_ID.remove();
        CURRENT_USER_ROLE.remove();
    }
}
