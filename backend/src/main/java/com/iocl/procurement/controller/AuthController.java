package com.iocl.procurement.controller;

import com.iocl.procurement.dto.request.LoginRequest;
import com.iocl.procurement.dto.request.UserLoginRequest;
import com.iocl.procurement.dto.request.UserRegistrationRequest;
import com.iocl.procurement.dto.response.AdminResponse;
import com.iocl.procurement.dto.response.LoginResponse;
import com.iocl.procurement.dto.response.UserLoginResponse;
import com.iocl.procurement.dto.response.UserRegistrationResponse;
import com.iocl.procurement.service.AuthService;
import com.iocl.procurement.service.UserService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final AuthService authService;
    private final UserService userService;

    public AuthController(AuthService authService, UserService userService) {
        this.authService = authService;
        this.userService = userService;
    }

    /**
     * POST /api/auth/login
     * Authenticates an Admin user and returns a signed JWT token with Admin details.
     *
     * @param loginRequest Login credentials
     * @return 200 OK with LoginResponse, or 401/400 error
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        logger.info("Received login request for email: [{}]", loginRequest.getEmail());
        LoginResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/auth/user/login
     * Authenticates a Normal User (via username, email, or employee ID) and returns signed JWT token.
     *
     * @param request User login credentials
     * @return 200 OK with UserLoginResponse, or 401/400/403 error
     */
    @PostMapping("/user/login")
    public ResponseEntity<UserLoginResponse> loginUser(@Valid @RequestBody UserLoginRequest request) {
        logger.info("Received user login request for identifier: [{}]", request.getUsernameOrEmail());
        UserLoginResponse response = userService.loginUser(request);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/auth/user/register
     * Public endpoint for registering normal users.
     * Always assigns Role.USER and UserStatus.ACTIVE.
     *
     * @param request User registration details
     * @return 201 CREATED with UserRegistrationResponse
     */
    @PostMapping("/user/register")
    public ResponseEntity<UserRegistrationResponse> registerUser(@Valid @RequestBody UserRegistrationRequest request) {
        logger.info("Received user registration request for username: [{}], email: [{}]", request.getUsername(), request.getEmail());
        UserRegistrationResponse response = userService.registerUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * POST /api/auth/register
     * Alias endpoint for normal user registration.
     *
     * @param request User registration details
     * @return 201 CREATED with UserRegistrationResponse
     */
    @PostMapping("/register")
    public ResponseEntity<UserRegistrationResponse> registerUserAlias(@Valid @RequestBody UserRegistrationRequest request) {
        return registerUser(request);
    }

    /**
     * GET /api/auth/me
     * Returns details of the currently authenticated Admin extracted from the JWT token.
     *
     * @param authentication Spring Security authentication object
     * @return 200 OK with AdminResponse
     */
    @GetMapping("/me")
    public ResponseEntity<AdminResponse> getCurrentAdmin(Authentication authentication) {
        String email = authentication.getName();
        logger.info("Fetching profile details for authenticated admin: [{}]", email);
        AdminResponse response = authService.getCurrentAdmin(email);
        return ResponseEntity.ok(response);
    }
}
