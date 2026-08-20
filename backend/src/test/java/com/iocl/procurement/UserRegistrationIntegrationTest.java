package com.iocl.procurement;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.iocl.procurement.dto.request.LoginRequest;
import com.iocl.procurement.dto.request.UserRegistrationRequest;
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

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UserRegistrationIntegrationTest {

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

        // Seed default Admin to verify admin login remains untouched
        Admin admin = new Admin();
        admin.setName("IOCL Administrator");
        admin.setEmail("admin@iocl.co.in");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRole(Role.ADMIN);
        adminRepository.save(admin);
    }

    @Test
    @DisplayName("Test 1: Valid user registration succeeds with HTTP 201, Role.USER, UserStatus.ACTIVE, and BCrypt password")
    void testValidRegistration() throws Exception {
        UserRegistrationRequest request = new UserRegistrationRequest(
                "Anjali Varshney",
                "anjali.varshney",
                "anjali.varshney@iocl.co.in",
                "IOCL10025",
                "Procurement",
                "Refinery",
                "SecurePass@123"
        );

        mockMvc.perform(post("/api/auth/user/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username", is("anjali.varshney")))
                .andExpect(jsonPath("$.email", is("anjali.varshney@iocl.co.in")))
                .andExpect(jsonPath("$.fullName", is("Anjali Varshney")))
                .andExpect(jsonPath("$.employeeId", is("IOCL10025")))
                .andExpect(jsonPath("$.department", is("Procurement")))
                .andExpect(jsonPath("$.location", is("Refinery")))
                .andExpect(jsonPath("$.role", is("USER")))
                .andExpect(jsonPath("$.status", is("ACTIVE")))
                .andExpect(jsonPath("$.message", is("User registered successfully")))
                .andExpect(jsonPath("$.password").doesNotExist())
                .andExpect(jsonPath("$.passwordHash").doesNotExist());

        // Verify database state in PostgreSQL / JPA repository
        User savedUser = userRepository.findByUsernameIgnoreCase("anjali.varshney").orElse(null);
        assertNotNull(savedUser);
        assertEquals("Anjali Varshney", savedUser.getFullName());
        assertEquals("anjali.varshney@iocl.co.in", savedUser.getEmail());
        assertEquals("IOCL10025", savedUser.getEmployeeId());
        assertEquals(Role.USER, savedUser.getRole());
        assertEquals(UserStatus.ACTIVE, savedUser.getStatus());
        assertNotEquals("SecurePass@123", savedUser.getPassword());
        assertTrue(passwordEncoder.matches("SecurePass@123", savedUser.getPassword()));
    }

    @Test
    @DisplayName("Test 2: Duplicate username registration fails with HTTP 409 Conflict")
    void testDuplicateUsername() throws Exception {
        User existingUser = new User(
                "Existing User",
                "anjali.varshney",
                "other.email@iocl.co.in",
                passwordEncoder.encode("SecurePass@123"),
                "IOCL99999",
                "IT",
                "Head Office",
                Role.USER,
                UserStatus.ACTIVE
        );
        userRepository.save(existingUser);

        UserRegistrationRequest request = new UserRegistrationRequest(
                "Anjali Varshney",
                "anjali.varshney", // Same username
                "new.unique@iocl.co.in",
                "IOCL10026",
                "Procurement",
                "Refinery",
                "SecurePass@123"
        );

        mockMvc.perform(post("/api/auth/user/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("Username already exists")));
    }

    @Test
    @DisplayName("Test 3: Duplicate email registration fails with HTTP 409 Conflict")
    void testDuplicateEmail() throws Exception {
        User existingUser = new User(
                "Existing User",
                "different.user",
                "anjali.varshney@iocl.co.in",
                passwordEncoder.encode("SecurePass@123"),
                "IOCL99999",
                "IT",
                "Head Office",
                Role.USER,
                UserStatus.ACTIVE
        );
        userRepository.save(existingUser);

        UserRegistrationRequest request = new UserRegistrationRequest(
                "Anjali Varshney",
                "anjali.varshney",
                "anjali.varshney@iocl.co.in", // Same email
                "IOCL10027",
                "Procurement",
                "Refinery",
                "SecurePass@123"
        );

        mockMvc.perform(post("/api/auth/user/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("Email already registered")));
    }

    @Test
    @DisplayName("Test 4: Duplicate employee ID registration fails with HTTP 409 Conflict")
    void testDuplicateEmployeeId() throws Exception {
        User existingUser = new User(
                "Existing User",
                "user.one",
                "user.one@iocl.co.in",
                passwordEncoder.encode("SecurePass@123"),
                "IOCL10025",
                "IT",
                "Head Office",
                Role.USER,
                UserStatus.ACTIVE
        );
        userRepository.save(existingUser);

        UserRegistrationRequest request = new UserRegistrationRequest(
                "Anjali Varshney",
                "user.two",
                "user.two@iocl.co.in",
                "IOCL10025", // Same Employee ID
                "Procurement",
                "Refinery",
                "SecurePass@123"
        );

        mockMvc.perform(post("/api/auth/user/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("Employee ID already registered")));
    }

    @Test
    @DisplayName("Test 5: Invalid email format fails with HTTP 400 Bad Request")
    void testInvalidEmail() throws Exception {
        UserRegistrationRequest request = new UserRegistrationRequest(
                "Anjali Varshney",
                "anjali.varshney",
                "not-an-email-format",
                "IOCL10028",
                "Procurement",
                "Refinery",
                "SecurePass@123"
        );

        mockMvc.perform(post("/api/auth/user/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors.email", containsString("Please enter a valid email address")));
    }

    @Test
    @DisplayName("Test 6: Short password (< 8 chars) fails with HTTP 400 Bad Request")
    void testShortPassword() throws Exception {
        UserRegistrationRequest request = new UserRegistrationRequest(
                "Anjali Varshney",
                "anjali.varshney",
                "anjali@iocl.co.in",
                "IOCL10029",
                "Procurement",
                "Refinery",
                "12345" // 5 characters
        );

        mockMvc.perform(post("/api/auth/user/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors.password", containsString("Password must be at least 8 characters long")));
    }

    @Test
    @DisplayName("Test 7: Malicious payload attempting role escalation cannot create ADMIN")
    void testRoleEscalationPrevention() throws Exception {
        String rawJson = """
                {
                    "fullName": "Malicious User",
                    "username": "hacker.user",
                    "email": "hacker@test.com",
                    "employeeId": "IOCL66666",
                    "department": "IT",
                    "location": "Head Office",
                    "password": "Password@123",
                    "role": "ADMIN",
                    "status": "SUSPENDED"
                }
                """;

        mockMvc.perform(post("/api/auth/user/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(rawJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role", is("USER")))
                .andExpect(jsonPath("$.status", is("ACTIVE")));

        User savedUser = userRepository.findByUsernameIgnoreCase("hacker.user").orElse(null);
        assertNotNull(savedUser);
        assertEquals(Role.USER, savedUser.getRole(), "User role must strictly remain USER");
        assertEquals(UserStatus.ACTIVE, savedUser.getStatus(), "User status must strictly remain ACTIVE");
    }

    @Test
    @DisplayName("Test 8: Existing Admin Login continues to work seamlessly")
    void testAdminLoginUntouched() throws Exception {
        LoginRequest adminLogin = new LoginRequest("admin@iocl.co.in", "admin123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminLogin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.tokenType", is("Bearer")))
                .andExpect(jsonPath("$.email", is("admin@iocl.co.in")))
                .andExpect(jsonPath("$.role", is("ADMIN")));
    }
}
