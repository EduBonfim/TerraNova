package com.terranova.model;

import jakarta.persistence.*;
import com.terranova.enums.StatusPedido;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "order_state_history", indexes = {
    @Index(name = "idx_pedido_id", columnList = "pedido_id"),
    @Index(name = "idx_mudado_em", columnList = "mudado_em"),
    @Index(name = "idx_status_novo", columnList = "status_novo")
})
public class OrderStateHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "pedido_id", nullable = false)
    private UUID pedidoId;

    @Column(name = "status_anterior", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private StatusPedido statusAnterior;

    @Column(name = "status_novo", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private StatusPedido statusNovo;

    @Column(name = "mudado_em", nullable = false, updatable = false)
    private LocalDateTime mudadoEm;

    @Column(name = "mudado_por", nullable = false)
    private UUID mudadoPor;

    @Column(name = "motivo", length = 255)
    private String motivo;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public OrderStateHistory(UUID pedidoId, StatusPedido statusAnterior, StatusPedido statusNovo,
                            UUID mudadoPor, String motivo) {
        this.pedidoId = pedidoId;
        this.statusAnterior = statusAnterior;
        this.statusNovo = statusNovo;
        this.mudadoPor = mudadoPor;
        this.motivo = motivo;
        this.mudadoEm = LocalDateTime.now();
        this.createdAt = LocalDateTime.now();
    }

    public OrderStateHistory() {
        this.mudadoEm = LocalDateTime.now();
        this.createdAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (this.mudadoEm == null) {
            this.mudadoEm = LocalDateTime.now();
        }
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getPedidoId() {
        return pedidoId;
    }

    public void setPedidoId(UUID pedidoId) {
        this.pedidoId = pedidoId;
    }

    public StatusPedido getStatusAnterior() {
        return statusAnterior;
    }

    public void setStatusAnterior(StatusPedido statusAnterior) {
        this.statusAnterior = statusAnterior;
    }

    public StatusPedido getStatusNovo() {
        return statusNovo;
    }

    public void setStatusNovo(StatusPedido statusNovo) {
        this.statusNovo = statusNovo;
    }

    public LocalDateTime getMudadoEm() {
        return mudadoEm;
    }

    public void setMudadoEm(LocalDateTime mudadoEm) {
        this.mudadoEm = mudadoEm;
    }

    public UUID getMudadoPor() {
        return mudadoPor;
    }

    public void setMudadoPor(UUID mudadoPor) {
        this.mudadoPor = mudadoPor;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public String toString() {
        return "OrderStateHistory{" +
                "id=" + id +
                ", pedidoId=" + pedidoId +
                ", statusAnterior=" + statusAnterior +
                ", statusNovo=" + statusNovo +
                ", mudadoEm=" + mudadoEm +
                ", mudadoPor=" + mudadoPor +
                ", motivo='" + motivo + '\'' +
                '}';
    }
}
