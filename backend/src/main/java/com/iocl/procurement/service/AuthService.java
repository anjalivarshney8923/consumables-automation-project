package com.iocl.procurement.service;

import com.iocl.procurement.dto.request.LoginRequest;
import com.iocl.procurement.dto.response.AdminResponse;
import com.iocl.procurement.dto.response.LoginResponse;

public interface AuthService {

    /**
     * Authenticate Admin credentials and generate a JWT token.
     *
     * @param request Login credentials (email, password)
     * @return LoginResponse containing the JWT token and Admin profile details
     */
    LoginResponse login(LoginRequest request);

    /**
     * Get profile details of the currently authenticated Admin by email.
     *
     * @param email Email extracted from the JWT token
     * @return AdminResponse containing admin profile data
     */
    AdminResponse getCurrentAdmin(String email);
}
