package com.iocl.procurement;

import com.iocl.procurement.entity.Admin;
import com.iocl.procurement.entity.Role;
import com.iocl.procurement.security.AdminUserDetails;
import com.iocl.procurement.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;
    private AdminUserDetails userDetails;

    @BeforeEach
    void setUp() {
        // Standard 256-bit test secret
        String testSecret = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
        long expirationMs = 3600000; // 1 hour
        jwtService = new JwtService(testSecret, expirationMs);

        Admin admin = new Admin(1L, "Admin User", "admin@iocl.co.in", "encodedPassword", Role.ADMIN);
        userDetails = new AdminUserDetails(admin);
    }

    @Test
    void testGenerateAndValidateToken() {
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("adminId", 1L);
        extraClaims.put("name", "Admin User");
        extraClaims.put("role", "ADMIN");

        String token = jwtService.generateToken(userDetails, extraClaims);

        assertNotNull(token);
        assertFalse(token.isEmpty());

        String extractedUsername = jwtService.extractUsername(token);
        assertEquals("admin@iocl.co.in", extractedUsername);

        assertTrue(jwtService.isTokenValid(token, userDetails));
        assertTrue(jwtService.validateToken(token));
        assertFalse(jwtService.isTokenExpired(token));
    }

    @Test
    void testInvalidToken() {
        assertFalse(jwtService.validateToken("invalid.jwt.token"));
    }
}
