package com.iocl.procurement.repository;

import com.iocl.procurement.entity.AssetUsage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AssetUsageRepository extends JpaRepository<AssetUsage, Long>, JpaSpecificationExecutor<AssetUsage> {

    @EntityGraph(attributePaths = {"user", "cartridge", "asset"})
    List<AssetUsage> findByUserIdOrderByCreatedAtDescIdDesc(Long userId);

    @EntityGraph(attributePaths = {"user", "cartridge", "asset"})
    List<AssetUsage> findByUserIdAndUsageDateBetweenOrderByUsageDateDesc(Long userId, LocalDate fromDate, LocalDate toDate);

    @EntityGraph(attributePaths = {"user", "cartridge", "asset"})
    Optional<AssetUsage> findByIdAndUserId(Long id, Long userId);

    @Override
    @EntityGraph(attributePaths = {"user", "cartridge", "asset"})
    Optional<AssetUsage> findById(Long id);

    @Override
    @EntityGraph(attributePaths = {"user", "cartridge", "asset"})
    Page<AssetUsage> findAll(Specification<AssetUsage> spec, Pageable pageable);

    @EntityGraph(attributePaths = {"user", "cartridge", "asset"})
    List<AssetUsage> findByAssetIdOrderByCreatedAtDesc(Long assetId);

    @EntityGraph(attributePaths = {"user", "cartridge", "asset"})
    List<AssetUsage> findByCartridgeIdOrderByCreatedAtDesc(Long cartridgeId);

    @EntityGraph(attributePaths = {"user", "cartridge", "asset"})
    List<AssetUsage> findAllByOrderByCreatedAtDescIdDesc();

    long countByUserId(Long userId);

    long countByUserIdAndUsageDateBetween(Long userId, LocalDate start, LocalDate end);

    @Query("SELECT MAX(u.usageDate) FROM AssetUsage u WHERE u.user.id = :userId")
    LocalDate findLatestUsageDateByUserId(@Param("userId") Long userId);

    @Query("SELECT MAX(u.usageDate) FROM AssetUsage u")
    LocalDate findLatestUsageDate();

    @Query("SELECT COALESCE(SUM(u.quantityUsed), 0) FROM AssetUsage u WHERE u.cartridge.id = :cartridgeId")
    Long getTotalQuantityUsedByCartridgeId(@Param("cartridgeId") Long cartridgeId);

    @Query("SELECT COALESCE(SUM(u.quantityUsed), 0) FROM AssetUsage u WHERE u.user.id = :userId")
    Long getTotalQuantityUsedByUserId(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(u.quantityUsed), 0) FROM AssetUsage u")
    Long getTotalQuantityUsedAll();
}
