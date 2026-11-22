package com.terranova.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class PedidoDTO {
    
    private UUID id;
    private String numeroPedido;
    private UUID vendedorId;
    private String vendedorNome;
    @NotNull
    private UUID compradorId;
    private String compradorNome;
    // produtoId é nullable para produtos avulsos (listings locais)
    private UUID produtoId;
    private String produtoNome;
    @NotNull
    @Positive
    private BigDecimal quantidade;
    @NotNull
    @DecimalMin("0")
    private BigDecimal valorUnitario;
    private BigDecimal valorTotal;
    private String status;
    private String categoria;
    private String transportadora;
    private String trackingNumero;
    private String enderecoEntregaCep;
    private String enderecoEntregaStreet;
    private String enderecoEntregaNumber;
    private String enderecoEntregaNeighborhood;
    private String enderecoEntregaCity;
    private String enderecoEntregaState;
    private String enderecoEntregaComplement;
    private String observacoes;
    private LocalDateTime dataPedido;
    private LocalDateTime dataConfirmacao;
    private LocalDateTime dataEnvio;
    private LocalDateTime dataEntrega;

    public PedidoDTO() {}

    public PedidoDTO(UUID id, String numeroPedido, UUID vendedorId, String vendedorNome, UUID compradorId, String compradorNome, UUID produtoId, String produtoNome, BigDecimal quantidade, BigDecimal valorUnitario, BigDecimal valorTotal, String status, String categoria, String transportadora, String trackingNumero, String enderecoEntregaCep, String enderecoEntregaStreet, String enderecoEntregaNumber, String enderecoEntregaNeighborhood, String enderecoEntregaCity, String enderecoEntregaState, String enderecoEntregaComplement, String observacoes, LocalDateTime dataPedido, LocalDateTime dataConfirmacao, LocalDateTime dataEnvio, LocalDateTime dataEntrega) {
        this.id = id;
        this.numeroPedido = numeroPedido;
        this.vendedorId = vendedorId;
        this.vendedorNome = vendedorNome;
        this.compradorId = compradorId;
        this.compradorNome = compradorNome;
        this.produtoId = produtoId;
        this.produtoNome = produtoNome;
        this.quantidade = quantidade;
        this.valorUnitario = valorUnitario;
        this.valorTotal = valorTotal;
        this.status = status;
        this.categoria = categoria;
        this.transportadora = transportadora;
        this.trackingNumero = trackingNumero;
        this.enderecoEntregaCep = enderecoEntregaCep;
        this.enderecoEntregaStreet = enderecoEntregaStreet;
        this.enderecoEntregaNumber = enderecoEntregaNumber;
        this.enderecoEntregaNeighborhood = enderecoEntregaNeighborhood;
        this.enderecoEntregaCity = enderecoEntregaCity;
        this.enderecoEntregaState = enderecoEntregaState;
        this.enderecoEntregaComplement = enderecoEntregaComplement;
        this.observacoes = observacoes;
        this.dataPedido = dataPedido;
        this.dataConfirmacao = dataConfirmacao;
        this.dataEnvio = dataEnvio;
        this.dataEntrega = dataEntrega;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getNumeroPedido() { return numeroPedido; }
    public void setNumeroPedido(String numeroPedido) { this.numeroPedido = numeroPedido; }

    public UUID getVendedorId() { return vendedorId; }
    public void setVendedorId(UUID vendedorId) { this.vendedorId = vendedorId; }

    public String getVendedorNome() { return vendedorNome; }
    public void setVendedorNome(String vendedorNome) { this.vendedorNome = vendedorNome; }

    public UUID getCompradorId() { return compradorId; }
    public void setCompradorId(UUID compradorId) { this.compradorId = compradorId; }

    public String getCompradorNome() { return compradorNome; }
    public void setCompradorNome(String compradorNome) { this.compradorNome = compradorNome; }

    public UUID getProdutoId() { return produtoId; }
    public void setProdutoId(UUID produtoId) { this.produtoId = produtoId; }

    public String getProdutoNome() { return produtoNome; }
    public void setProdutoNome(String produtoNome) { this.produtoNome = produtoNome; }

    public BigDecimal getQuantidade() { return quantidade; }
    public void setQuantidade(BigDecimal quantidade) { this.quantidade = quantidade; }

    public BigDecimal getValorUnitario() { return valorUnitario; }
    public void setValorUnitario(BigDecimal valorUnitario) { this.valorUnitario = valorUnitario; }

    public BigDecimal getValorTotal() { return valorTotal; }
    public void setValorTotal(BigDecimal valorTotal) { this.valorTotal = valorTotal; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }

    public String getTransportadora() { return transportadora; }
    public void setTransportadora(String transportadora) { this.transportadora = transportadora; }

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

    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }

    public LocalDateTime getDataPedido() { return dataPedido; }
    public void setDataPedido(LocalDateTime dataPedido) { this.dataPedido = dataPedido; }

    public LocalDateTime getDataConfirmacao() { return dataConfirmacao; }
    public void setDataConfirmacao(LocalDateTime dataConfirmacao) { this.dataConfirmacao = dataConfirmacao; }

    public LocalDateTime getDataEnvio() { return dataEnvio; }
    public void setDataEnvio(LocalDateTime dataEnvio) { this.dataEnvio = dataEnvio; }

    public LocalDateTime getDataEntrega() { return dataEntrega; }
    public void setDataEntrega(LocalDateTime dataEntrega) { this.dataEntrega = dataEntrega; }

    private boolean compradorAvaliou;
    private boolean vendedorAvaliou;

    public boolean isCompradorAvaliou() { return compradorAvaliou; }
    public void setCompradorAvaliou(boolean compradorAvaliou) { this.compradorAvaliou = compradorAvaliou; }

    public boolean isVendedorAvaliou() { return vendedorAvaliou; }
    public void setVendedorAvaliou(boolean vendedorAvaliou) { this.vendedorAvaliou = vendedorAvaliou; }
}
