package com.iocl.procurement.dto.response;

public class UserActivityItemDTO {

    private Long id;
    private String type; // e.g. "USAGE_RECORDED"
    private String title;
    private String description;
    private String timestamp;
    private String status;

    public UserActivityItemDTO() {
    }

    public UserActivityItemDTO(Long id, String type, String title, String description, String timestamp, String status) {
        this.id = id;
        this.type = type;
        this.title = title;
        this.description = description;
        this.timestamp = timestamp;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
