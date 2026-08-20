package com.iocl.procurement.service;

import com.iocl.procurement.dto.request.UserLoginRequest;
import com.iocl.procurement.dto.request.UserRegistrationRequest;
import com.iocl.procurement.dto.response.UserLoginResponse;
import com.iocl.procurement.dto.response.UserRegistrationResponse;

public interface UserService {

    UserRegistrationResponse registerUser(UserRegistrationRequest request);

    UserLoginResponse loginUser(UserLoginRequest request);
}
