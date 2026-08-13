package com.iocl.procurement.repository;

import com.iocl.procurement.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Long> {

    /**
     * Find an admin by their unique email address (case-insensitive search).
     *
     * @param email Admin's email address
     * @return Optional containing the Admin if found, otherwise empty
     */
    Optional<Admin> findByEmailIgnoreCase(String email);

    /**
     * Standard find by email.
     *
     * @param email Admin's email address
     * @return Optional containing the Admin if found
     */
    Optional<Admin> findByEmail(String email);

    /**
     * Check if an admin with the given email already exists.
     *
     * @param email Admin's email address
     * @return true if exists, false otherwise
     */
    boolean existsByEmailIgnoreCase(String email);

    /**
     * Standard exists by email.
     *
     * @param email Admin's email address
     * @return true if exists, false otherwise
     */
    boolean existsByEmail(String email);
}
