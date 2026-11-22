package com.terranova.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class ListingDTO {

    private UUID id;
    private String titulo;
    private String descricao;
    private String categoria;
    private String subcategoria;
    private BigDecimal quantidade;
    private BigDecimal preco;
    private Boolean isDoacao;
    private String vendedorUsername;
    private String vendedorNome;
    private String loteCodigo;
    private String tipoCertificacao;
    private String numeroRegistro;
    private String fotoUrl;
    private String unidade;
    private LocalDateTime criadoEm;
    private LocalDateTime atualizadoEm;
    private String status;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }

    public String getSubcategoria() { return subcategoria; }
    public void setSubcategoria(String subcategoria) { this.subcategoria = subcategoria; }

    public BigDecimal getQuantidade() { return quantidade; }
    public void setQuantidade(BigDecimal quantidade) { this.quantidade = quantidade; }

    public BigDecimal getPreco() { return preco; }
    public void setPreco(BigDecimal preco) { this.preco = preco; }

    public Boolean getIsDoacao() { return isDoacao; }
    public void setIsDoacao(Boolean doacao) { isDoacao = doacao; }

    public String getVendedorUsername() { return vendedorUsername; }
    public void setVendedorUsername(String vendedorUsername) { this.vendedorUsername = vendedorUsername; }

    public String getVendedorNome() { return vendedorNome; }
    public void setVendedorNome(String vendedorNome) { this.vendedorNome = vendedorNome; }

    public String getLoteCodigo() { return loteCodigo; }
    public void setLoteCodigo(String loteCodigo) { this.loteCodigo = loteCodigo; }

    public String getTipoCertificacao() { return tipoCertificacao; }
    public void setTipoCertificacao(String tipoCertificacao) { this.tipoCertificacao = tipoCertificacao; }

    public String getNumeroRegistro() { return numeroRegistro; }
    public void setNumeroRegistro(String numeroRegistro) { this.numeroRegistro = numeroRegistro; }

    public String getFotoUrl() { return fotoUrl; }
    public void setFotoUrl(String fotoUrl) { this.fotoUrl = fotoUrl; }

    public String getUnidade() { return unidade; }
    public void setUnidade(String unidade) { this.unidade = unidade; }

    public LocalDateTime getCriadoEm() { return criadoEm; }
    public void setCriadoEm(LocalDateTime criadoEm) { this.criadoEm = criadoEm; }

    public LocalDateTime getAtualizadoEm() { return atualizadoEm; }
    public void setAtualizadoEm(LocalDateTime atualizadoEm) { this.atualizadoEm = atualizadoEm; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}