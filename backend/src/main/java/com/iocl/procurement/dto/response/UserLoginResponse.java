package com.iocl.procurement.dto.response;

import com.iocl.procurement.entity.User;

public class UserLoginResponse {

    private String token;
    private String tokenType;
    private Long userId;
    private String fullName;
    private String username;
    private String email;
    private String employeeId;
    private String department;
    private String location;
    private String role;
    private Long expiresIn;
    private String message;

    public UserLoginResponse() {
        this.tokenType = "Bearer";
        this.message = "Login successful";
    }

    public UserLoginResponse(String token, User user, Long expiresIn) {
        this.token = token;
        this.tokenType = "Bearer";
        this.message = "Login successful";
        this.expiresIn = expiresIn;
        if (user != null) {
            this.userId = user.getId();
            this.fullName = user.getFullName();
            this.username = user.getUsername();
            this.email = user.getEmail();
            this.employeeId = user.getEmployeeId();
            this.department = user.getDepartment();
            this.location = user.getLocation();
            this.role = user.getRole() != null ? user.getRole().name() : "USER";
        }
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

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
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

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
