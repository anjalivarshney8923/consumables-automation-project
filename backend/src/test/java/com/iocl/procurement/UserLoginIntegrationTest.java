package com.iocl.procurement;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.iocl.procurement.dto.request.LoginRequest;
import com.iocl.procurement.dto.request.UserLoginRequest;
import com.iocl.procurement.entity.Admin;
import com.iocl.procurement.entity.Role;
import com.iocl.procurement.entity.User;
import com.iocl.procurement.entity.UserStatus;
import com.iocl.procurement.repository.AdminRepository;
import com.iocl.procurement.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UserLoginIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.iocl.procurement.repository.AssetUsageRepository assetUsageRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        if (assetUsageRepository != null) {
            assetUsageRepository.deleteAll();
        }
        userRepository.deleteAll();
        adminRepository.deleteAll();

        // 1. Seed standard Admin
        Admin admin = new Admin();
        admin.setName("IOCL Administrator");
        admin.setEmail("admin@iocl.co.in");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRole(Role.ADMIN);
        adminRepository.save(admin);

        // 2. Seed active normal User
        User activeUser = new User(
                "Anjali Varshney",
                "anjali.varshney",
                "anjali.varshney@iocl.co.in",
                passwordEncoder.encode("SecurePass@123"),
                "IOCL10025",
                "Procurement",
                "Refinery",
                Role.USER,
                UserStatus.ACTIVE
        );
        userRepository.save(activeUser);

        // 3. Seed inactive normal User
        User inactiveUser = new User(
                "Inactive User",
                "inactive.user",
                "inactive@iocl.co.in",
                passwordEncoder.encode("SecurePass@123"),
                "IOCL99999",
                "IT",
                "Head Office",
                Role.USER,
                UserStatus.INACTIVE
        );
        userRepository.save(inactiveUser);
    }

    @Test
    @DisplayName("TEST 1: Correct username + correct password -> 200 OK, JWT returned, role = USER")
    void testSuccessfulLoginByUsername() throws Exception {
        UserLoginRequest request = new UserLoginRequest("anjali.varshney", "SecurePass@123");

        mockMvc.perform(post("/api/auth/user/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.tokenType", is("Bearer")))
                .andExpect(jsonPath("$.username", is("anjali.varshney")))
                .andExpect(jsonPath("$.email", is("anjali.varshney@iocl.co.in")))
                .andExpect(jsonPath("$.fullName", is("Anjali Varshney")))
                .andExpect(jsonPath("$.employeeId", is("IOCL10025")))
                .andExpect(jsonPath("$.role", is("USER")))
                .andExpect(jsonPath("$.password").doesNotExist())
                .andExpect(jsonPath("$.passwordHash").doesNotExist());
    }

    @Test
    @DisplayName("TEST 2: Correct email + correct password -> 200 OK, JWT returned")
    void testSuccessfulLoginByEmail() throws Exception {
        UserLoginRequest request = new UserLoginRequest("anjali.varshney@iocl.co.in", "SecurePass@123");

        mockMvc.perform(post("/api/auth/user/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.username", is("anjali.varshney")))
                .andExpect(jsonPath("$.role", is("USER")));
    }

    @Test
    @DisplayName("TEST 3: Correct employee ID + correct password -> 200 OK, JWT returned")
    void testSuccessfulLoginByEmployeeId() throws Exception {
        UserLoginRequest request = new UserLoginRequest("IOCL10025", "SecurePass@123");

        mockMvc.perform(post("/api/auth/user/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.employeeId", is("IOCL10025")))
                .andExpect(jsonPath("$.role", is("USER")));
    }

    @Test
    @DisplayName("TEST 4: Correct username + wrong password -> 401 Unauthorized")
    void testWrongPassword() throws Exception {
        UserLoginRequest request = new UserLoginRequest("anjali.varshney", "WrongPassword999");

        mockMvc.perform(post("/api/auth/user/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message", containsString("Invalid username or password")));
    }

    @Test
    @DisplayName("TEST 5: Non-existing username -> 401 Unauthorized")
    void testNonExistingUser() throws Exception {
        UserLoginRequest request = new UserLoginRequest("unknown.ghost.user", "SecurePass@123");

        mockMvc.perform(post("/api/auth/user/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message", containsString("Invalid username or password")));
    }

    @Test
    @DisplayName("TEST 6: Inactive user account login rejected -> 403 Forbidden")
    void testInactiveUserLoginRejected() throws Exception {
        UserLoginRequest request = new UserLoginRequest("inactive.user", "SecurePass@123");

        mockMvc.perform(post("/api/auth/user/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message", containsString("account is inactive")));
    }

    @Test
    @DisplayName("TEST 7: Empty username or password -> 400 Bad Request")
    void testEmptyValidation() throws Exception {
        UserLoginRequest emptyRequest = new UserLoginRequest("", "");

        mockMvc.perform(post("/api/auth/user/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(emptyRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("TEST 8: Valid USER JWT accessing ADMIN endpoint -> 403 Forbidden")
    void testUserJwtCannotAccessAdminEndpoints() throws Exception {
        // Log in as normal USER to get a real valid USER JWT
        UserLoginRequest userLogin = new UserLoginRequest("anjali.varshney", "SecurePass@123");
        MvcResult loginResult = mockMvc.perform(post("/api/auth/user/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userLogin)))
                .andExpect(status().isOk())
                .andReturn();

        String responseBody = loginResult.getResponse().getContentAsString();
        String userToken = objectMapper.readTree(responseBody).get("token").asText();
        assertNotNull(userToken);

        // Attempt to access ADMIN-only endpoint (/api/auth/me) with USER token -> MUST BE 403 FORBIDDEN
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden());

        // Attempt to access ADMIN-only thresholds endpoint (/api/thresholds) -> MUST BE 403 FORBIDDEN
        mockMvc.perform(get("/api/thresholds")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("TEST 9: Existing Admin Login continues to work seamlessly")
    void testExistingAdminLoginAndAccess() throws Exception {
        LoginRequest adminLogin = new LoginRequest("admin@iocl.co.in", "admin123");

        MvcResult adminResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminLogin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.role", is("ADMIN")))
                .andReturn();

        String adminToken = objectMapper.readTree(adminResult.getResponse().getContentAsString()).get("token").asText();
        assertNotNull(adminToken);

        // Admin accessing /api/auth/me succeeds with 200 OK
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email", is("admin@iocl.co.in")))
                .andExpect(jsonPath("$.role", is("ADMIN")));
    }
}
