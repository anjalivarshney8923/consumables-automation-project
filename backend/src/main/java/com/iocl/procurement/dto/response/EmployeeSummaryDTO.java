package com.iocl.procurement.dto.response;

public class EmployeeSummaryDTO {

    private long totalEmployees;
    private long activeEmployees;
    private long totalDepartments;
    private long employeesWithPrinters;

    public EmployeeSummaryDTO() {
    }

    public EmployeeSummaryDTO(long totalEmployees, long activeEmployees, long totalDepartments, long employeesWithPrinters) {
        this.totalEmployees = totalEmployees;
        this.activeEmployees = activeEmployees;
        this.totalDepartments = totalDepartments;
        this.employeesWithPrinters = employeesWithPrinters;
    }

    public long getTotalEmployees() {
        return totalEmployees;
    }

    public void setTotalEmployees(long totalEmployees) {
        this.totalEmployees = totalEmployees;
    }

    public long getActiveEmployees() {
        return activeEmployees;
    }

    public void setActiveEmployees(long activeEmployees) {
        this.activeEmployees = activeEmployees;
    }

    public long getTotalDepartments() {
        return totalDepartments;
    }

    public void setTotalDepartments(long totalDepartments) {
        this.totalDepartments = totalDepartments;
    }

    public long getEmployeesWithPrinters() {
        return employeesWithPrinters;
    }

    public void setEmployeesWithPrinters(long employeesWithPrinters) {
        this.employeesWithPrinters = employeesWithPrinters;
    }
}
