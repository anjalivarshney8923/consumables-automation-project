package com.iocl.procurement.service.impl;

import com.iocl.procurement.dto.request.LoginRequest;
import com.iocl.procurement.dto.response.AdminResponse;
import com.iocl.procurement.dto.response.LoginResponse;
import com.iocl.procurement.entity.Admin;
import com.iocl.procurement.exception.InvalidCredentialsException;
import com.iocl.procurement.exception.ResourceNotFoundException;
import com.iocl.procurement.repository.AdminRepository;
import com.iocl.procurement.security.AdminUserDetails;
import com.iocl.procurement.security.JwtService;
import com.iocl.procurement.service.AuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthServiceImpl implements AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final AuthenticationManager authenticationManager;
    private final AdminRepository adminRepository;
    private final JwtService jwtService;

    public AuthServiceImpl(
            AuthenticationManager authenticationManager,
            AdminRepository adminRepository,
            JwtService jwtService
    ) {
        this.authenticationManager = authenticationManager;
        this.adminRepository = adminRepository;
        this.jwtService = jwtService;
    }

    @Override
    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        final String email = request.getEmail().trim().toLowerCase();

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword())
            );

            AdminUserDetails userDetails = (AdminUserDetails) authentication.getPrincipal();

            Admin admin = adminRepository.findByEmailIgnoreCase(email)
                    .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

            Map<String, Object> extraClaims = new HashMap<>();
            extraClaims.put("adminId", admin.getId());
            extraClaims.put("name", admin.getName());
            extraClaims.put("role", admin.getRole().name());

            String token = jwtService.generateToken(userDetails, extraClaims);

            logger.info("Admin [{}] successfully authenticated. JWT token issued.", email);

            return LoginResponse.builder()
                    .token(token)
                    .tokenType("Bearer")
                    .adminId(admin.getId())
                    .name(admin.getName())
                    .email(admin.getEmail())
                    .role(admin.getRole().name())
                    .expiresIn(jwtService.getExpirationTimeMs())
                    .build();

        } catch (BadCredentialsException ex) {
            logger.warn("Failed login attempt for email: {}", email);
            throw new InvalidCredentialsException("Invalid email or password");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public AdminResponse getCurrentAdmin(String email) {
        Admin admin = adminRepository.findByEmailIgnoreCase(email.trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with email: " + email));

        return AdminResponse.builder()
                .adminId(admin.getId())
                .name(admin.getName())
                .email(admin.getEmail())
                .role(admin.getRole().name())
                .createdAt(admin.getCreatedAt())
                .build();
    }
}
