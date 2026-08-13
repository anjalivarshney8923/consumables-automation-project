package com.iocl.procurement.dto.response;

public class LoginResponse {

    private String token;
    private String tokenType;
    private Long adminId;
    private String name;
    private String email;
    private String role;
    private Long expiresIn;

    public LoginResponse() {
        this.tokenType = "Bearer";
    }

    public LoginResponse(String token, String tokenType, Long adminId, String name, String email, String role, Long expiresIn) {
        this.token = token;
        this.tokenType = tokenType != null ? tokenType : "Bearer";
        this.adminId = adminId;
        this.name = name;
        this.email = email;
        this.role = role;
        this.expiresIn = expiresIn;
    }

    public static Builder builder() {
        return new Builder();
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
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

    public Long getExpiresIn() {
        return expiresIn;
    }

    public void setExpiresIn(Long expiresIn) {
        this.expiresIn = expiresIn;
    }

    public static class Builder {
        private String token;
        private String tokenType = "Bearer";
        private Long adminId;
        private String name;
        private String email;
        private String role;
        private Long expiresIn;

        public Builder token(String token) {
            this.token = token;
            return this;
        }

        public Builder tokenType(String tokenType) {
            this.tokenType = tokenType;
            return this;
        }

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

        public Builder expiresIn(Long expiresIn) {
            this.expiresIn = expiresIn;
            return this;
        }

        public LoginResponse build() {
            return new LoginResponse(token, tokenType, adminId, name, email, role, expiresIn);
        }
    }
}
