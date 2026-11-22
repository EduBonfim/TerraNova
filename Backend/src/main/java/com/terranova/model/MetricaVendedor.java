package com.terranova.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "metricas_vendedor")
public class MetricaVendedor {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "total_pedidos")
    private Integer totalPedidos = 0;

    @Column(name = "total_vendas")
    private BigDecimal totalVendas = BigDecimal.ZERO;

    @Column(name = "media_nota")
    private BigDecimal mediaNota;

    @Column(name = "total_avaliacoes")
    private Integer totalAvaliacoes = 0;

    @Column(name = "mes_ano", nullable = false)
    private LocalDate mesAno;

    public MetricaVendedor() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public Integer getTotalPedidos() { return totalPedidos; }
    public void setTotalPedidos(Integer totalPedidos) { this.totalPedidos = totalPedidos; }

    public BigDecimal getTotalVendas() { return totalVendas; }
    public void setTotalVendas(BigDecimal totalVendas) { this.totalVendas = totalVendas; }

    public BigDecimal getMediaNota() { return mediaNota; }
    public void setMediaNota(BigDecimal mediaNota) { this.mediaNota = mediaNota; }

    public Integer getTotalAvaliacoes() { return totalAvaliacoes; }
    public void setTotalAvaliacoes(Integer totalAvaliacoes) { this.totalAvaliacoes = totalAvaliacoes; }

    public LocalDate getMesAno() { return mesAno; }
    public void setMesAno(LocalDate mesAno) { this.mesAno = mesAno; }
}
