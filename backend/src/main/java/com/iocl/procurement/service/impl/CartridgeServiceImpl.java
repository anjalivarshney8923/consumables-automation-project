package com.iocl.procurement.service.impl;

import com.iocl.procurement.dto.response.CartridgeResponse;
import com.iocl.procurement.entity.Cartridge;
import com.iocl.procurement.exception.ResourceNotFoundException;
import com.iocl.procurement.repository.CartridgeRepository;
import com.iocl.procurement.service.CartridgeService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class CartridgeServiceImpl implements CartridgeService {

    private final CartridgeRepository cartridgeRepository;

    public CartridgeServiceImpl(CartridgeRepository cartridgeRepository) {
        this.cartridgeRepository = cartridgeRepository;
    }

    @Override
    public List<CartridgeResponse> getAllActiveCartridges() {
        return cartridgeRepository.findByActiveTrueOrderByCartridgeNameAsc()
                .stream()
                .map(CartridgeResponse::new)
                .toList();
    }

    @Override
    public CartridgeResponse getCartridgeById(Long id) {
        Cartridge cartridge = cartridgeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cartridge not found with id: " + id));
        return new CartridgeResponse(cartridge);
    }
}
