package com.iocl.procurement.repository;

import com.iocl.procurement.entity.CallUpPurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CallUpPurchaseOrderRepository extends JpaRepository<CallUpPurchaseOrder, Long> {

    boolean existsByPoNumberIgnoreCase(String poNumber);

    List<CallUpPurchaseOrder> findAllByOrderByCreatedAtDesc();

    List<CallUpPurchaseOrder> findByRateContractIdOrderByCreatedAtDesc(Long rateContractId);
}
