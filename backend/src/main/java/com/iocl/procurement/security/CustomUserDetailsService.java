package com.iocl.procurement.security;

import com.iocl.procurement.entity.Admin;
import com.iocl.procurement.entity.User;
import com.iocl.procurement.entity.UserStatus;
import com.iocl.procurement.repository.AdminRepository;
import com.iocl.procurement.repository.UserRepository;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final AdminRepository adminRepository;
    private final UserRepository userRepository;

    public CustomUserDetailsService(AdminRepository adminRepository, UserRepository userRepository) {
        this.adminRepository = adminRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        if (identifier == null || identifier.trim().isEmpty()) {
            throw new UsernameNotFoundException("Identifier cannot be empty");
        }

        final String trimmed = identifier.trim();

        // 1. Try finding Admin by email
        Optional<Admin> adminOpt = adminRepository.findByEmailIgnoreCase(trimmed);
        if (adminOpt.isPresent()) {
            return new AdminUserDetails(adminOpt.get());
        }

        // 2. Try finding normal User by username, email, or employeeId
        Optional<User> userOpt = userRepository.findByUsernameIgnoreCase(trimmed)
                .or(() -> userRepository.findByEmailIgnoreCase(trimmed))
                .or(() -> userRepository.findByEmployeeIdIgnoreCase(trimmed));

        if (userOpt.isPresent()) {
            User user = userOpt.get();

            if (user.getStatus() == UserStatus.INACTIVE) {
                throw new DisabledException("Your account is inactive. Please contact the administrator.");
            }
            if (user.getStatus() == UserStatus.SUSPENDED) {
                throw new LockedException("Your account has been suspended.");
            }

            return new UserUserDetails(user);
        }

        throw new UsernameNotFoundException("User not found with identifier: " + identifier);
    }
}
