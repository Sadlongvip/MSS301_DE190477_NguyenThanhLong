package com.dework.paymentservice.model;

import com.dework.paymentservice.context.AuditContext;
import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@MappedSuperclass
@Getter
@Setter
public abstract class BaseEntity {

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "created_by", updatable = false)
    private String createdBy;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "updated_by")
    private String updatedBy;

    @PrePersist
    protected void onBaseCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        String user = AuditContext.getCurrentUser();
        if (this.createdBy == null || this.createdBy.isBlank()) {
            this.createdBy = user;
        }
        if (this.updatedBy == null || this.updatedBy.isBlank()) {
            this.updatedBy = user;
        }
    }

    @PreUpdate
    protected void onBaseUpdate() {
        this.updatedAt = LocalDateTime.now();
        this.updatedBy = AuditContext.getCurrentUser();
    }
}
