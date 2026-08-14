package com.iocl.procurement.repository;

import com.iocl.procurement.entity.CartridgeThreshold;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartridgeThresholdRepository extends JpaRepository<CartridgeThreshold, Long> {

    Optional<CartridgeThreshold> findByCartridgeId(Long cartridgeId);

    Optional<CartridgeThreshold> findByCartridgePartNumberIgnoreCase(String partNumber);

    boolean existsByCartridgeId(Long cartridgeId);

    @Query("SELECT ct FROM CartridgeThreshold ct JOIN FETCH ct.cartridge c WHERE c.active = true ORDER BY c.cartridgeName ASC")
    List<CartridgeThreshold> findAllActiveWithCartridge();
}
