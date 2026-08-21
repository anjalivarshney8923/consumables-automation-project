package com.iocl.procurement.dto.response;

import java.util.List;

public class AssetUsagePageResponse {

    private List<AssetUsageResponseDTO> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean first;
    private boolean last;

    private Long totalRecords;
    private Long totalQuantityUsed;
    private Long totalEngineers;
    private Long totalBeneficiaries;

    public AssetUsagePageResponse() {
    }

    public AssetUsagePageResponse(
            List<AssetUsageResponseDTO> content,
            int page,
            int size,
            long totalElements,
            int totalPages,
            boolean first,
            boolean last
    ) {
        this.content = content;
        this.page = page;
        this.size = size;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
        this.first = first;
        this.last = last;
        this.totalRecords = totalElements;
    }

    public AssetUsagePageResponse(
            List<AssetUsageResponseDTO> content,
            int page,
            int size,
            long totalElements,
            int totalPages,
            boolean first,
            boolean last,
            Long totalRecords,
            Long totalQuantityUsed,
            Long totalEngineers,
            Long totalBeneficiaries
    ) {
        this.content = content;
        this.page = page;
        this.size = size;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
        this.first = first;
        this.last = last;
        this.totalRecords = totalRecords != null ? totalRecords : totalElements;
        this.totalQuantityUsed = totalQuantityUsed;
        this.totalEngineers = totalEngineers;
        this.totalBeneficiaries = totalBeneficiaries;
    }

    public List<AssetUsageResponseDTO> getContent() {
        return content;
    }

    public void setContent(List<AssetUsageResponseDTO> content) {
        this.content = content;
    }

    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page;
    }

    public int getSize() {
        return size;
    }

    public void setSize(int size) {
        this.size = size;
    }

    public long getTotalElements() {
        return totalElements;
    }

    public void setTotalElements(long totalElements) {
        this.totalElements = totalElements;
    }

    public int getTotalPages() {
        return totalPages;
    }

    public void setTotalPages(int totalPages) {
        this.totalPages = totalPages;
    }

    public boolean isFirst() {
        return first;
    }

    public void setFirst(boolean first) {
        this.first = first;
    }

    public boolean isLast() {
        return last;
    }

    public void setLast(boolean last) {
        this.last = last;
    }

    public Long getTotalRecords() {
        return totalRecords;
    }

    public void setTotalRecords(Long totalRecords) {
        this.totalRecords = totalRecords;
    }

    public Long getTotalQuantityUsed() {
        return totalQuantityUsed;
    }

    public void setTotalQuantityUsed(Long totalQuantityUsed) {
        this.totalQuantityUsed = totalQuantityUsed;
    }

    public Long getTotalEngineers() {
        return totalEngineers;
    }

    public void setTotalEngineers(Long totalEngineers) {
        this.totalEngineers = totalEngineers;
    }

    public Long getTotalBeneficiaries() {
        return totalBeneficiaries;
    }

    public void setTotalBeneficiaries(Long totalBeneficiaries) {
        this.totalBeneficiaries = totalBeneficiaries;
    }
}
