package com.terranova.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "insumos_disponiveis")
public class InsumoDisponivel {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producer_id", nullable = false)
    private Usuario producer;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 100)
    private String amount;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public InsumoDisponivel() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Usuario getProducer() { return producer; }
    public void setProducer(Usuario producer) { this.producer = producer; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAmount() { return amount; }
    public void setAmount(String amount) { this.amount = amount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
