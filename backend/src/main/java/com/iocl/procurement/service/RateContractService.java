package com.iocl.procurement.service;

import com.iocl.procurement.dto.request.RateContractRequest;
import com.iocl.procurement.dto.response.CallUpPOResponse;
import com.iocl.procurement.dto.response.CartridgeProcurementHistoryResponse;
import com.iocl.procurement.dto.response.RateContractDetailsResponse;
import com.iocl.procurement.dto.response.RateContractResponse;
import java.util.List;

public interface RateContractService {

    RateContractResponse createRateContract(RateContractRequest request);

    List<RateContractResponse> getAllRateContracts();

    RateContractResponse getRateContractById(Long id);

    RateContractDetailsResponse getRateContractDetails(Long id);

    List<CallUpPOResponse> getCallUpPOsByRateContractId(Long rateContractId);

    CartridgeProcurementHistoryResponse getCartridgeProcurementHistory(Long cartridgeId);

    CartridgeProcurementHistoryResponse getCartridgeProcurementHistoryByPartNumber(String partNumber);

    CartridgeProcurementHistoryResponse getRateContractProcurementHistory(Long rateContractId);
}
