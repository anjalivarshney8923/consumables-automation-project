package com.iocl.procurement.controller;

import com.iocl.procurement.dto.request.LoginRequest;
import com.iocl.procurement.dto.response.AdminResponse;
import com.iocl.procurement.dto.response.LoginResponse;
import com.iocl.procurement.service.AuthService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    public AuthController(AuthService authService) {
        this.authService = authService;
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
