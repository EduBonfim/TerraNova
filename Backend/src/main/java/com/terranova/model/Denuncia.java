package com.terranova.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "denuncias")
public class Denuncia {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_user_id", nullable = false)
    private Usuario reportedUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", nullable = false)
    private Usuario reporter;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(nullable = false)
    private String reason;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "evidence_image_uri")
    private String evidenceImageUri;

    @Column(nullable = false, length = 30)
    private String status;

    @Column(name = "analyzed_at")
    private LocalDateTime analyzedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "analyzed_by_id")
    private Usuario analyzedBy;

    @Column(name = "action_type", length = 50)
    private String actionType;

    @Column(name = "action_details", columnDefinition = "TEXT")
    private String actionDetails;

    @Column(name = "block_days")
    private Integer blockDays;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = "pendente";
        }
    }

    public Denuncia() {
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Usuario getReportedUser() { return reportedUser; }
    public void setReportedUser(Usuario reportedUser) { this.reportedUser = reportedUser; }

    public Usuario getReporter() { return reporter; }
    public void setReporter(Usuario reporter) { this.reporter = reporter; }

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

    public LocalDateTime getAnalyzedAt() { return analyzedAt; }
    public void setAnalyzedAt(LocalDateTime analyzedAt) { this.analyzedAt = analyzedAt; }

    public Usuario getAnalyzedBy() { return analyzedBy; }
    public void setAnalyzedBy(Usuario analyzedBy) { this.analyzedBy = analyzedBy; }

    public String getActionType() { return actionType; }
    public void setActionType(String actionType) { this.actionType = actionType; }

    public String getActionDetails() { return actionDetails; }
    public void setActionDetails(String actionDetails) { this.actionDetails = actionDetails; }

    public Integer getBlockDays() { return blockDays; }
    public void setBlockDays(Integer blockDays) { this.blockDays = blockDays; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}