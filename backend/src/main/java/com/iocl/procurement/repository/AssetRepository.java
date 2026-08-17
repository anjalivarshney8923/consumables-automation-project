package com.iocl.procurement.repository;

import com.iocl.procurement.entity.Asset;
import com.iocl.procurement.entity.AssetStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {

    Optional<Asset> findBySerialNumberIgnoreCase(String serialNumber);

    boolean existsBySerialNumberIgnoreCase(String serialNumber);

    boolean existsBySerialNumberIgnoreCaseAndIdNot(String serialNumber, Long id);

    List<Asset> findAllByOrderByCreatedAtDesc();

    List<Asset> findByDepartmentIgnoreCaseOrderByCreatedAtDesc(String department);

    List<Asset> findByStatusOrderByCreatedAtDesc(AssetStatus status);

    @Query("SELECT a FROM Asset a JOIN FETCH a.cartridge WHERE " +
            "(:search IS NULL OR :search = '' OR " +
            "LOWER(a.modelName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(a.serialNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(a.department) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(a.cartridge.cartridgeName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(a.cartridge.partNumber) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
            "(:status IS NULL OR a.status = :status) " +
            "ORDER BY a.createdAt DESC")
    List<Asset> searchAssets(@Param("search") String search, @Param("status") AssetStatus status);
}
