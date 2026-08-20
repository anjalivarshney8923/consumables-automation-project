package com.iocl.procurement.repository;

import com.iocl.procurement.entity.AssetUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AssetUsageRepository extends JpaRepository<AssetUsage, Long> {

    List<AssetUsage> findByUserIdOrderByCreatedAtDescIdDesc(Long userId);

    List<AssetUsage> findByUserIdAndUsageDateBetweenOrderByUsageDateDesc(Long userId, LocalDate fromDate, LocalDate toDate);

    Optional<AssetUsage> findByIdAndUserId(Long id, Long userId);

    List<AssetUsage> findByAssetIdOrderByCreatedAtDesc(Long assetId);

    List<AssetUsage> findByCartridgeIdOrderByCreatedAtDesc(Long cartridgeId);

    List<AssetUsage> findAllByOrderByCreatedAtDescIdDesc();

    @Query("SELECT COALESCE(SUM(u.quantityUsed), 0) FROM AssetUsage u WHERE u.cartridge.id = :cartridgeId")
    Long getTotalQuantityUsedByCartridgeId(@Param("cartridgeId") Long cartridgeId);

    @Query("SELECT COALESCE(SUM(u.quantityUsed), 0) FROM AssetUsage u WHERE u.user.id = :userId")
    Long getTotalQuantityUsedByUserId(@Param("userId") Long userId);
}
