package com.iocl.procurement.service;

import com.iocl.procurement.dto.request.CallUpPORequest;
import com.iocl.procurement.dto.response.CallUpPOResponse;
import java.util.List;

public interface CallUpPOService {

    CallUpPOResponse createCallUpPO(CallUpPORequest request);

    List<CallUpPOResponse> getAllCallUpPOs();

    CallUpPOResponse getCallUpPOById(Long id);
}
