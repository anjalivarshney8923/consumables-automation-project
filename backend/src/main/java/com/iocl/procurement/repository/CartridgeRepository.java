package com.iocl.procurement.repository;

import com.iocl.procurement.entity.Cartridge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartridgeRepository extends JpaRepository<Cartridge, Long> {

    Optional<Cartridge> findByPartNumberIgnoreCase(String partNumber);

    boolean existsByPartNumberIgnoreCase(String partNumber);

    List<Cartridge> findByActiveTrueOrderByCartridgeNameAsc();

    List<Cartridge> findAllByActiveTrueOrderByPrinterNameAsc();
}
