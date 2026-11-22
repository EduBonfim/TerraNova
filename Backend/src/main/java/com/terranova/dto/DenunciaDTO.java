package com.terranova.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class DenunciaDTO {
    private UUID id;
    private String reportedUser; // username
    private String reporter; // username
    private String category;
    private String reason;
    private String description;
    private String evidenceImageUri;
    private String status;
    private LocalDateTime data;
    private LocalDateTime analyzedAt;
    private String analyzedBy; // username

    private ActionDTO action;

    public static class ActionDTO {
        private String type;
        private String details;
        private Integer blockDays;

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public String getDetails() { return details; }
        public void setDetails(String details) { this.details = details; }

        public Integer getBlockDays() { return blockDays; }
        public void setBlockDays(Integer blockDays) { this.blockDays = blockDays; }
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getReportedUser() { return reportedUser; }
    public void setReportedUser(String reportedUser) { this.reportedUser = reportedUser; }

    public String getReporter() { return reporter; }
    public void setReporter(String reporter) { this.reporter = reporter; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getEvidenceImageUri() { return evidenceImageUri; }
    public void setEvidenceImageUri(String evidenceImageUri) { this.evidenceImageUri = evidenceImageUri; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getData() { return data; }
    public void setData(LocalDateTime data) { this.data = data; }

    public LocalDateTime getAnalyzedAt() { return analyzedAt; }
    public void setAnalyzedAt(LocalDateTime analyzedAt) { this.analyzedAt = analyzedAt; }

    public String getAnalyzedBy() { return analyzedBy; }
    public void setAnalyzedBy(String analyzedBy) { this.analyzedBy = analyzedBy; }

    public ActionDTO getAction() { return action; }
    public void setAction(ActionDTO action) { this.action = action; }
}
