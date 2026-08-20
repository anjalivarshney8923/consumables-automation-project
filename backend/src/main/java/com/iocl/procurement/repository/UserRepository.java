package com.iocl.procurement.repository;

import com.iocl.procurement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    boolean existsByUsernameIgnoreCase(String username);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByEmployeeIdIgnoreCase(String employeeId);

    Optional<User> findByUsernameIgnoreCase(String username);

    Optional<User> findByEmailIgnoreCase(String email);

    Optional<User> findByEmployeeIdIgnoreCase(String employeeId);

    List<User> findByFullNameContainingIgnoreCaseOrEmployeeIdContainingIgnoreCase(String fullName, String employeeId);

    @org.springframework.data.jpa.repository.Query("SELECT u FROM User u WHERE " +
            "LOWER(u.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(u.employeeId) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(u.department) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "ORDER BY u.fullName ASC")
    List<User> searchEmployees(@org.springframework.data.repository.query.Param("query") String query);

    List<User> findAllByOrderByFullNameAsc();
}
