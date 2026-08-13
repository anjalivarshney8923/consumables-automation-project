package com.iocl.procurement.service;

import com.iocl.procurement.dto.response.CartridgeResponse;
import java.util.List;

public interface CartridgeService {

    List<CartridgeResponse> getAllActiveCartridges();

    CartridgeResponse getCartridgeById(Long id);
}
