package com.iocl.procurement.service.impl;

import com.iocl.procurement.dto.request.UserLoginRequest;
import com.iocl.procurement.dto.request.UserRegistrationRequest;
import com.iocl.procurement.dto.response.UserLoginResponse;
import com.iocl.procurement.dto.response.UserRegistrationResponse;
import com.iocl.procurement.entity.Role;
import com.iocl.procurement.entity.User;
import com.iocl.procurement.entity.UserStatus;
import com.iocl.procurement.exception.AppException;
import com.iocl.procurement.exception.InvalidCredentialsException;
import com.iocl.procurement.repository.UserRepository;
import com.iocl.procurement.security.JwtService;
import com.iocl.procurement.security.UserUserDetails;
import com.iocl.procurement.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
public class UserServiceImpl implements UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserServiceImpl(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Override
    @Transactional
    public UserRegistrationResponse registerUser(UserRegistrationRequest request) {
        String trimmedUsername = request.getUsername().trim();
        String trimmedEmail = request.getEmail().trim().toLowerCase();
        String trimmedEmployeeId = request.getEmployeeId().trim();

        logger.info("Processing user registration for username: [{}], email: [{}]", trimmedUsername, trimmedEmail);

        // 1. Check duplicate username
        if (userRepository.existsByUsernameIgnoreCase(trimmedUsername)) {
            logger.warn("User registration failed: Username [{}] already exists", trimmedUsername);
            throw new AppException("Username already exists", HttpStatus.CONFLICT);
        }

        // 2. Check duplicate email
        if (userRepository.existsByEmailIgnoreCase(trimmedEmail)) {
            logger.warn("User registration failed: Email [{}] is already registered", trimmedEmail);
            throw new AppException("Email already registered", HttpStatus.CONFLICT);
        }

        // 3. Check duplicate employee ID
        if (userRepository.existsByEmployeeIdIgnoreCase(trimmedEmployeeId)) {
            logger.warn("User registration failed: Employee ID [{}] is already registered", trimmedEmployeeId);
            throw new AppException("Employee ID already registered", HttpStatus.CONFLICT);
        }

        // 4. Securely Hash Password
        String encodedPassword = passwordEncoder.encode(request.getPassword());

        // 5. Construct User Entity strictly with Role.USER and UserStatus.ACTIVE
        User user = new User();
        user.setFullName(request.getFullName().trim());
        user.setUsername(trimmedUsername);
        user.setEmail(trimmedEmail);
        user.setPassword(encodedPassword);
        user.setEmployeeId(trimmedEmployeeId);
        user.setDepartment(request.getDepartment() != null ? request.getDepartment().trim() : null);
        user.setLocation(request.getLocation() != null ? request.getLocation().trim() : null);
        user.setRole(Role.USER); // Strict normal user role, preventing admin privilege escalation
        user.setStatus(UserStatus.ACTIVE);

        // 6. Save atomically in PostgreSQL
        User savedUser = userRepository.save(user);

        logger.info("User registered successfully with ID: [{}], username: [{}]", savedUser.getId(), savedUser.getUsername());

        return new UserRegistrationResponse(savedUser, "User registered successfully");
    }

    @Override
    @Transactional(readOnly = true)
    public UserLoginResponse loginUser(UserLoginRequest request) {
        final String identifier = request.getUsernameOrEmail().trim();

        logger.info("Processing user login attempt for identifier: [{}]", identifier);

        // 1. Find User by username, email, or employee ID (case-insensitive)
        User user = userRepository.findByUsernameIgnoreCase(identifier)
                .or(() -> userRepository.findByEmailIgnoreCase(identifier))
                .or(() -> userRepository.findByEmployeeIdIgnoreCase(identifier))
                .orElseThrow(() -> {
                    logger.warn("User login failed: No account found for identifier [{}]", identifier);
                    return new InvalidCredentialsException("Invalid username or password");
                });

        // 2. Verify Account Status
        if (user.getStatus() == UserStatus.INACTIVE) {
            logger.warn("User login rejected: Account [{}] is INACTIVE", identifier);
            throw new AppException("Your account is inactive. Please contact the administrator.", HttpStatus.FORBIDDEN);
        }

        if (user.getStatus() == UserStatus.SUSPENDED) {
            logger.warn("User login rejected: Account [{}] is SUSPENDED", identifier);
            throw new AppException("Your account has been suspended.", HttpStatus.FORBIDDEN);
        }

        // 3. Verify BCrypt Password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            logger.warn("User login failed: Incorrect password for identifier [{}]", identifier);
            throw new InvalidCredentialsException("Invalid username or password");
        }

        // 4. Generate JWT Token with User Claims
        UserUserDetails userDetails = new UserUserDetails(user);
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("userId", user.getId());
        extraClaims.put("name", user.getFullName());
        extraClaims.put("username", user.getUsername());
        extraClaims.put("email", user.getEmail());
        extraClaims.put("role", "USER");

        String token = jwtService.generateToken(userDetails, extraClaims);

        logger.info("User [{}] successfully authenticated. Role: USER. JWT token issued.", user.getUsername());

        return new UserLoginResponse(token, user, jwtService.getExpirationTimeMs());
    }
}
