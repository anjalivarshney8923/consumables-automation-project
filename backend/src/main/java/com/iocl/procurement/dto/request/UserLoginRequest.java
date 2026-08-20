package com.iocl.procurement.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UserLoginRequest {

    @NotBlank(message = "Username or Email is required")
    @Size(max = 150, message = "Username or Email must not exceed 150 characters")
    private String usernameOrEmail;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 100, message = "Password must be between 6 and 100 characters")
    private String password;

    public UserLoginRequest() {
    }

    public UserLoginRequest(String usernameOrEmail, String password) {
        this.usernameOrEmail = usernameOrEmail;
        this.password = password;
    }

    public String getUsernameOrEmail() {
        return usernameOrEmail;
    }

    public void setUsernameOrEmail(String usernameOrEmail) {
        this.usernameOrEmail = usernameOrEmail;
    }

    // Convenience alias getters/setters so clients sending "username", "email", or "identifier" map seamlessly
    public String getUsername() {
        return usernameOrEmail;
    }

    public void setUsername(String username) {
        if (this.usernameOrEmail == null || this.usernameOrEmail.isEmpty()) {
            this.usernameOrEmail = username;
        }
    }

    public String getEmail() {
        return usernameOrEmail;
    }

    public void setEmail(String email) {
        if (this.usernameOrEmail == null || this.usernameOrEmail.isEmpty()) {
            this.usernameOrEmail = email;
        }
    }

    public String getIdentifier() {
        return usernameOrEmail;
    }

    public void setIdentifier(String identifier) {
        if (this.usernameOrEmail == null || this.usernameOrEmail.isEmpty()) {
            this.usernameOrEmail = identifier;
        }
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    @Override
    public String toString() {
        return "UserLoginRequest{" +
                "usernameOrEmail='" + usernameOrEmail + '\'' +
                ", password='[PROTECTED]'" +
                '}';
    }
}
