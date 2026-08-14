package com.iocl.procurement.dto.response;

public class AlertCountResponse {

    private long unreadCount;
    private long totalCount;

    public AlertCountResponse() {
    }

    public AlertCountResponse(long unreadCount, long totalCount) {
        this.unreadCount = unreadCount;
        this.totalCount = totalCount;
    }

    public long getUnreadCount() {
        return unreadCount;
    }

    public void setUnreadCount(long unreadCount) {
        this.unreadCount = unreadCount;
    }

    public long getTotalCount() {
        return totalCount;
    }

    public void setTotalCount(long totalCount) {
        this.totalCount = totalCount;
    }
}
