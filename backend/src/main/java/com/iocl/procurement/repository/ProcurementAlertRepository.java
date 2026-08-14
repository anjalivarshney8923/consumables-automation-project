package com.iocl.procurement.repository;

import com.iocl.procurement.entity.AlertStatus;
import com.iocl.procurement.entity.AlertType;
import com.iocl.procurement.entity.ProcurementAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProcurementAlertRepository extends JpaRepository<ProcurementAlert, Long> {

    @Query("SELECT a FROM ProcurementAlert a JOIN FETCH a.cartridge ORDER BY a.createdAt DESC")
    List<ProcurementAlert> findAllWithCartridgeOrderByCreatedAtDesc();

    @Query("SELECT a FROM ProcurementAlert a JOIN FETCH a.cartridge WHERE a.status = :status ORDER BY a.createdAt DESC")
    List<ProcurementAlert> findByStatusWithCartridgeOrderByCreatedAtDesc(@Param("status") AlertStatus status);

    Optional<ProcurementAlert> findFirstByCartridgeIdAndAlertTypeAndStatusOrderByCreatedAtDesc(
            Long cartridgeId,
            AlertType alertType,
            AlertStatus status
    );

    long countByStatus(AlertStatus status);
}
