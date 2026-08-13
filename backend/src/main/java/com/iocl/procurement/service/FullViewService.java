package com.iocl.procurement.service;

import com.iocl.procurement.dto.response.FullViewPageResponse;
import com.iocl.procurement.dto.response.FullViewRecordResponse;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface FullViewService {

    FullViewPageResponse getFullViewRecords(
            String search,
            String supplier,
            String cartridge,
            String status,
            LocalDate fromDate,
            LocalDate toDate,
            Pageable pageable
    );

    FullViewRecordResponse getFullViewRecordById(Long id);
}
