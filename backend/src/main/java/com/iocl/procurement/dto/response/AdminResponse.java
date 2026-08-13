package com.iocl.procurement.dto.response;

import java.time.LocalDateTime;

public class AdminResponse {

    private Long adminId;
    private String name;
    private String email;
    private String role;
    private LocalDateTime createdAt;

    public AdminResponse() {
    }

    public AdminResponse(Long adminId, String name, String email, String role, LocalDateTime createdAt) {
        this.adminId = adminId;
        this.name = name;
        this.email = email;
        this.role = role;
        this.createdAt = createdAt;
    }

    public static Builder builder() {
        return new Builder();
    }

    public Long getAdminId() {
        return adminId;
    }

    public void setAdminId(Long adminId) {
        this.adminId = adminId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public static class Builder {
        private Long adminId;
        private String name;
        private String email;
        private String role;
        private LocalDateTime createdAt;

        public Builder adminId(Long adminId) {
            this.adminId = adminId;
            return this;
        }

        public Builder name(String name) {
            this.name = name;
            return this;
        }

        public Builder email(String email) {
            this.email = email;
            return this;
        }

        public Builder role(String role) {
            this.role = role;
            return this;
        }

        public Builder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public AdminResponse build() {
            return new AdminResponse(adminId, name, email, role, createdAt);
        }
    }
}
