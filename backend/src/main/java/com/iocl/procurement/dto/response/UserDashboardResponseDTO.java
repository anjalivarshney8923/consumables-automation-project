package com.iocl.procurement.dto.response;

import java.util.ArrayList;
import java.util.List;

public class UserDashboardResponseDTO {

    private String userName;
    private String userEmail;
    private String userDepartment;
    private String employeeNumber;
    private long usageTotal;
    private long totalRecords;
    private long thisMonthCount;
    private long assetsRequiringAttention;
    private long pendingActions;
    private List<AssetUsageResponseDTO> recentUsages = new ArrayList<>();
    private List<UserActivityItemDTO> recentActivities = new ArrayList<>();

    public UserDashboardResponseDTO() {
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getUserDepartment() {
        return userDepartment;
    }

    public void setUserDepartment(String userDepartment) {
        this.userDepartment = userDepartment;
    }

    public String getEmployeeNumber() {
        return employeeNumber;
    }

    public void setEmployeeNumber(String employeeNumber) {
        this.employeeNumber = employeeNumber;
    }

    public long getUsageTotal() {
        return usageTotal;
    }

    public void setUsageTotal(long usageTotal) {
        this.usageTotal = usageTotal;
    }

    public long getTotalRecords() {
        return totalRecords;
    }

    public void setTotalRecords(long totalRecords) {
        this.totalRecords = totalRecords;
    }

    public long getThisMonthCount() {
        return thisMonthCount;
    }

    public void setThisMonthCount(long thisMonthCount) {
        this.thisMonthCount = thisMonthCount;
    }

    public long getAssetsRequiringAttention() {
        return assetsRequiringAttention;
    }

    public void setAssetsRequiringAttention(long assetsRequiringAttention) {
        this.assetsRequiringAttention = assetsRequiringAttention;
    }

    public long getPendingActions() {
        return pendingActions;
    }

    public void setPendingActions(long pendingActions) {
        this.pendingActions = pendingActions;
    }

    public List<AssetUsageResponseDTO> getRecentUsages() {
        return recentUsages;
    }

    public void setRecentUsages(List<AssetUsageResponseDTO> recentUsages) {
        this.recentUsages = recentUsages;
    }

    public List<UserActivityItemDTO> getRecentActivities() {
        return recentActivities;
    }

    public void setRecentActivities(List<UserActivityItemDTO> recentActivities) {
        this.recentActivities = recentActivities;
    }
}
