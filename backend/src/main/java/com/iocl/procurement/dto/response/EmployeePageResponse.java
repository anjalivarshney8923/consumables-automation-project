package com.iocl.procurement.dto.response;

import java.util.List;

public class EmployeePageResponse {

    private List<EmployeeResponseDTO> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean first;
    private boolean last;

    private Long totalEmployees;
    private Long activeEmployees;
    private Long totalDepartments;
    private Long employeesWithPrinters;

    public EmployeePageResponse() {
    }

    public EmployeePageResponse(
            List<EmployeeResponseDTO> content,
            int page,
            int size,
            long totalElements,
            int totalPages,
            boolean first,
            boolean last,
            Long totalEmployees,
            Long activeEmployees,
            Long totalDepartments,
            Long employeesWithPrinters
    ) {
        this.content = content;
        this.page = page;
        this.size = size;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
        this.first = first;
        this.last = last;
        this.totalEmployees = totalEmployees != null ? totalEmployees : totalElements;
        this.activeEmployees = activeEmployees;
        this.totalDepartments = totalDepartments;
        this.employeesWithPrinters = employeesWithPrinters;
    }

    // Getters and Setters

    public List<EmployeeResponseDTO> getContent() {
        return content;
    }

    public void setContent(List<EmployeeResponseDTO> content) {
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

    public Long getTotalEmployees() {
        return totalEmployees;
    }

    public void setTotalEmployees(Long totalEmployees) {
        this.totalEmployees = totalEmployees;
    }

    public Long getActiveEmployees() {
        return activeEmployees;
    }

    public void setActiveEmployees(Long activeEmployees) {
        this.activeEmployees = activeEmployees;
    }

    public Long getTotalDepartments() {
        return totalDepartments;
    }

    public void setTotalDepartments(Long totalDepartments) {
        this.totalDepartments = totalDepartments;
    }

    public Long getEmployeesWithPrinters() {
        return employeesWithPrinters;
    }

    public void setEmployeesWithPrinters(Long employeesWithPrinters) {
        this.employeesWithPrinters = employeesWithPrinters;
    }
}
