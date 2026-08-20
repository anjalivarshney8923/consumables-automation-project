package com.iocl.procurement.repository;

import com.iocl.procurement.entity.Cartridge;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartridgeRepository extends JpaRepository<Cartridge, Long> {

    Optional<Cartridge> findByPartNumberIgnoreCase(String partNumber);

    Optional<Cartridge> findByCartridgeNameIgnoreCase(String cartridgeName);

    Optional<Cartridge> findByPartNumberIgnoreCaseOrCartridgeNameIgnoreCase(String partNumber, String cartridgeName);

    boolean existsByPartNumberIgnoreCase(String partNumber);

    List<Cartridge> findByActiveTrueOrderByCartridgeNameAsc();

    List<Cartridge> findAllByActiveTrueOrderByPrinterNameAsc();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM Cartridge c WHERE c.id = :id")
    Optional<Cartridge> findWithLockById(@Param("id") Long id);
}

