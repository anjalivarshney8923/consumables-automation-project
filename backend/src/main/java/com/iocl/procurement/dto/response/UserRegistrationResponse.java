package com.iocl.procurement.dto.response;

import com.iocl.procurement.entity.User;

import java.time.LocalDateTime;

public class UserRegistrationResponse {

    private Long id;
    private String fullName;
    private String username;
    private String email;
    private String employeeId;
    private String department;
    private String location;
    private String role;
    private String status;
    private String message;
    private LocalDateTime createdAt;

    public UserRegistrationResponse() {
    }

    public UserRegistrationResponse(User user, String message) {
        if (user != null) {
            this.id = user.getId();
            this.fullName = user.getFullName();
            this.username = user.getUsername();
            this.email = user.getEmail();
            this.employeeId = user.getEmployeeId();
            this.department = user.getDepartment();
            this.location = user.getLocation();
            this.role = user.getRole() != null ? user.getRole().name() : "USER";
            this.status = user.getStatus() != null ? user.getStatus().name() : "ACTIVE";
            this.createdAt = user.getCreatedAt();
        }
        this.message = message != null ? message : "User registered successfully";
    }

    public UserRegistrationResponse(User user) {
        this(user, "User registered successfully");
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
