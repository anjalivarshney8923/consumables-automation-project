package com.iocl.procurement.repository;

import com.iocl.procurement.entity.RateContract;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RateContractRepository extends JpaRepository<RateContract, Long>, JpaSpecificationExecutor<RateContract> {

    List<RateContract> findAllByOrderByCreatedAtDesc();

    List<RateContract> findByCartridgeId(Long cartridgeId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM RateContract r WHERE r.id = :id")
    Optional<RateContract> findWithLockById(@Param("id") Long id);
}
