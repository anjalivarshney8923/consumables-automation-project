package com.iocl.procurement.repository;

import com.iocl.procurement.entity.Employee;
import com.iocl.procurement.entity.EmployeeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long>, JpaSpecificationExecutor<Employee> {

    Optional<Employee> findByEmployeeNumberIgnoreCase(String employeeNumber);

    boolean existsByEmployeeNumberIgnoreCase(String employeeNumber);

    boolean existsByEmployeeNumberIgnoreCaseAndIdNot(String employeeNumber, Long id);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);

    long countByStatus(EmployeeStatus status);

    @Query("SELECT COUNT(DISTINCT e.department) FROM Employee e WHERE e.department IS NOT NULL AND TRIM(e.department) <> ''")
    long countDistinctDepartments();

    @Query("SELECT COUNT(e) FROM Employee e WHERE (e.printerName IS NOT NULL AND TRIM(e.printerName) <> '') OR (e.printerSerialNumber IS NOT NULL AND TRIM(e.printerSerialNumber) <> '')")
    long countEmployeesWithPrinters();

    List<Employee> findByStatusOrderByFullNameAsc(EmployeeStatus status);

    @Query("SELECT e FROM Employee e WHERE e.status = :status AND " +
           "(LOWER(e.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(e.employeeNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(e.department) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(e.email) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Employee> searchActiveEmployees(@Param("query") String query, @Param("status") EmployeeStatus status);
}
