package com.mss301.order.choreography;

import java.io.Serializable;

public class OrderEvents {

    public record OrderCreatedEvent(Long orderId, String customerId, String productId, int quantity, double amount) implements Serializable {}

    public record InventoryReservedEvent(Long orderId, String customerId, String productId, int quantity, double amount) implements Serializable {}

    public record InventoryFailedEvent(Long orderId, String reason) implements Serializable {}

    public record PaymentCompletedEvent(Long orderId, String customerId, double amount) implements Serializable {}

    public record PaymentFailedEvent(Long orderId, String reason) implements Serializable {}
}
