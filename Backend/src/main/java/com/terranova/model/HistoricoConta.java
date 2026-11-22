package com.terranova.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "historico_contas")
public class HistoricoConta {

    @Id
    private UUID id;
    
    private UUID originalUserId;
    private String username;
    private String email;
    private String cpf;

    private String status;
    
    private LocalDateTime deletedAt;

    public HistoricoConta() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    
    public UUID getOriginalUserId() { return originalUserId; }
    public void setOriginalUserId(UUID originalUserId) { this.originalUserId = originalUserId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getCpf() { return cpf; }
    public void setCpf(String cpf) { this.cpf = cpf; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getDeletedAt() { return deletedAt; }
    public void setDeletedAt(LocalDateTime deletedAt) { this.deletedAt = deletedAt; }
}
