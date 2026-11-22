package com.terranova.model;

import jakarta.persistence.*;
import com.terranova.enums.StatusPedido;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "pedidos")
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "numero_pedido", unique = true, nullable = false, length = 50)
    private String numeroPedido;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendedor_id", nullable = false)
    private Usuario vendedor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comprador_id", nullable = false)
    private Usuario comprador;

    @Column(name = "valor_total", nullable = false)
    private BigDecimal valorTotal;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private StatusPedido status = StatusPedido.aguardando;

    @Column(name = "transportadora")
    private String transportadora;

    @Column(name = "categoria", length = 20)
    private String categoria;

    @Column(name = "tracking_numero", length = 100)
    private String trackingNumero;

    @Column(name = "endereco_entrega_cep", length = 10)
    private String enderecoEntregaCep;

    @Column(name = "endereco_entrega_street")
    private String enderecoEntregaStreet;

    @Column(name = "endereco_entrega_number", length = 10)
    private String enderecoEntregaNumber;

    @Column(name = "endereco_entrega_neighborhood", length = 100)
    private String enderecoEntregaNeighborhood;

    @Column(name = "endereco_entrega_city", length = 100)
    private String enderecoEntregaCity;

    @Column(name = "endereco_entrega_state", length = 2)
    private String enderecoEntregaState;

    @Column(name = "endereco_entrega_complement")
    private String enderecoEntregaComplement;

    @Column(name = "data_pedido")
    private LocalDateTime dataPedido = LocalDateTime.now();

    @Column(name = "data_confirmacao")
    private LocalDateTime dataConfirmacao;

    @Column(name = "data_envio")
    private LocalDateTime dataEnvio;

    @Column(name = "data_entrega")
    private LocalDateTime dataEntrega;

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<ItemPedido> itens = new ArrayList<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Pedido() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getNumeroPedido() { return numeroPedido; }
    public void setNumeroPedido(String numeroPedido) { this.numeroPedido = numeroPedido; }

    public Usuario getVendedor() { return vendedor; }
    public void setVendedor(Usuario vendedor) { this.vendedor = vendedor; }

    public Usuario getComprador() { return comprador; }
    public void setComprador(Usuario comprador) { this.comprador = comprador; }

    public BigDecimal getValorTotal() { return valorTotal; }
    public void setValorTotal(BigDecimal valorTotal) { this.valorTotal = valorTotal; }

    public StatusPedido getStatus() { return status; }
    public void setStatus(StatusPedido status) { this.status = status; }

    public String getTransportadora() { return transportadora; }
    public void setTransportadora(String transportadora) { this.transportadora = transportadora; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }

    public String getTrackingNumero() { return trackingNumero; }
    public void setTrackingNumero(String trackingNumero) { this.trackingNumero = trackingNumero; }

    public String getEnderecoEntregaCep() { return enderecoEntregaCep; }
    public void setEnderecoEntregaCep(String enderecoEntregaCep) { this.enderecoEntregaCep = enderecoEntregaCep; }

    public String getEnderecoEntregaStreet() { return enderecoEntregaStreet; }
    public void setEnderecoEntregaStreet(String enderecoEntregaStreet) { this.enderecoEntregaStreet = enderecoEntregaStreet; }

    public String getEnderecoEntregaNumber() { return enderecoEntregaNumber; }
    public void setEnderecoEntregaNumber(String enderecoEntregaNumber) { this.enderecoEntregaNumber = enderecoEntregaNumber; }

    public String getEnderecoEntregaNeighborhood() { return enderecoEntregaNeighborhood; }
    public void setEnderecoEntregaNeighborhood(String enderecoEntregaNeighborhood) { this.enderecoEntregaNeighborhood = enderecoEntregaNeighborhood; }

    public String getEnderecoEntregaCity() { return enderecoEntregaCity; }
    public void setEnderecoEntregaCity(String enderecoEntregaCity) { this.enderecoEntregaCity = enderecoEntregaCity; }

    public String getEnderecoEntregaState() { return enderecoEntregaState; }
    public void setEnderecoEntregaState(String enderecoEntregaState) { this.enderecoEntregaState = enderecoEntregaState; }

    public String getEnderecoEntregaComplement() { return enderecoEntregaComplement; }
    public void setEnderecoEntregaComplement(String enderecoEntregaComplement) { this.enderecoEntregaComplement = enderecoEntregaComplement; }

    public LocalDateTime getDataPedido() { return dataPedido; }
    public void setDataPedido(LocalDateTime dataPedido) { this.dataPedido = dataPedido; }

    public LocalDateTime getDataConfirmacao() { return dataConfirmacao; }
    public void setDataConfirmacao(LocalDateTime dataConfirmacao) { this.dataConfirmacao = dataConfirmacao; }

    public LocalDateTime getDataEnvio() { return dataEnvio; }
    public void setDataEnvio(LocalDateTime dataEnvio) { this.dataEnvio = dataEnvio; }

    public LocalDateTime getDataEntrega() { return dataEntrega; }
    public void setDataEntrega(LocalDateTime dataEntrega) { this.dataEntrega = dataEntrega; }

    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }

    public List<ItemPedido> getItens() { return itens; }
    public void setItens(List<ItemPedido> itens) { this.itens = itens; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
