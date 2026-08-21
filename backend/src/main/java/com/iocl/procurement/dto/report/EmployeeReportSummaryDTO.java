package com.iocl.procurement.dto.report;

public class EmployeeReportSummaryDTO {

    private long totalEmployees;
    private long activeEmployees;
    private long inactiveEmployees;
    private long totalDepartments;
    private long employeesWithPrinters;

    public EmployeeReportSummaryDTO() {
    }

    public EmployeeReportSummaryDTO(long totalEmployees, long activeEmployees, long inactiveEmployees, long totalDepartments, long employeesWithPrinters) {
        this.totalEmployees = totalEmployees;
        this.activeEmployees = activeEmployees;
        this.inactiveEmployees = inactiveEmployees;
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

    public long getInactiveEmployees() {
        return inactiveEmployees;
    }

    public void setInactiveEmployees(long inactiveEmployees) {
        this.inactiveEmployees = inactiveEmployees;
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
