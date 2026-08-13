package com.iocl.procurement.service.impl;

import com.iocl.procurement.dto.request.CallUpPORequest;
import com.iocl.procurement.dto.response.CallUpPOResponse;
import com.iocl.procurement.entity.CallUpPurchaseOrder;
import com.iocl.procurement.entity.RateContract;
import com.iocl.procurement.exception.AppException;
import com.iocl.procurement.exception.ResourceNotFoundException;
import com.iocl.procurement.repository.CallUpPurchaseOrderRepository;
import com.iocl.procurement.repository.RateContractRepository;
import com.iocl.procurement.service.CallUpPOService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class CallUpPOServiceImpl implements CallUpPOService {

    private final CallUpPurchaseOrderRepository callUpPORepository;
    private final RateContractRepository rateContractRepository;

    public CallUpPOServiceImpl(
            CallUpPurchaseOrderRepository callUpPORepository,
            RateContractRepository rateContractRepository
    ) {
        this.callUpPORepository = callUpPORepository;
        this.rateContractRepository = rateContractRepository;
    }

    @Override
    @Transactional
    public CallUpPOResponse createCallUpPO(CallUpPORequest request) {
        String cleanPoNumber = request.getPoNumber().trim();

        // 1. Check duplicate PO/WO number
        if (callUpPORepository.existsByPoNumberIgnoreCase(cleanPoNumber)) {
            throw new AppException(
                    "Call-Up PO / WO number [" + cleanPoNumber + "] already exists.",
                    HttpStatus.CONFLICT
            );
        }

        // 2. Fetch Rate Contract with Pessimistic Lock to ensure transaction safety
        RateContract rateContract = rateContractRepository.findWithLockById(request.getRateContractId())
                .orElseThrow(() -> new ResourceNotFoundException("Rate Contract not found with id: " + request.getRateContractId()));

        // 3. Validate Quantity against available quantity
        int requestedQty = request.getQuantity();
        int availableQty = rateContract.getNetAvailableQuantity();

        if (requestedQty > availableQty) {
            throw new AppException(
                    "Call-Up quantity (" + requestedQty + ") exceeds the available quantity (" + availableQty + ") in the rate contract.",
                    HttpStatus.BAD_REQUEST
            );
        }

        // 4. Save Call-Up Purchase Order
        CallUpPurchaseOrder po = new CallUpPurchaseOrder();
        po.setPoNumber(cleanPoNumber);
        po.setPoDate(request.getPoDate());
        po.setSupplierName(request.getSupplierName().trim());
        po.setRateContract(rateContract);
        po.setQuantity(requestedQty);
        po.setRemarks(request.getRemarks() != null ? request.getRemarks().trim() : null);

        CallUpPurchaseOrder savedPO = callUpPORepository.save(po);

        // 5. Update Rate Contract quantity taken through WO & recalculate available quantity
        rateContract.setQuantityTakenThroughWO(rateContract.getQuantityTakenThroughWO() + requestedQty);
        rateContract.recalculateNetAvailableQuantity();
        rateContractRepository.save(rateContract);

        return new CallUpPOResponse(savedPO);
    }

    @Override
    public List<CallUpPOResponse> getAllCallUpPOs() {
        return callUpPORepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(CallUpPOResponse::new)
                .toList();
    }

    @Override
    public CallUpPOResponse getCallUpPOById(Long id) {
        CallUpPurchaseOrder po = callUpPORepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Call-Up PO not found with id: " + id));
        return new CallUpPOResponse(po);
    }
}
