package com.dework.paymentservice.context;

public final class AuditContext {

    private static final ThreadLocal<String> CURRENT_USER = new ThreadLocal<>();

    private AuditContext() {
    }

    public static void setCurrentUser(String username) {
        CURRENT_USER.set(username);
    }

    public static String getCurrentUser() {
        String user = CURRENT_USER.get();
        return (user != null && !user.isBlank()) ? user : "SYSTEM";
    }

    public static void clear() {
        CURRENT_USER.remove();
    }
}
