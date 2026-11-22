package com.terranova.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public class ProdutoDTO {
    
    private UUID id;
    @NotBlank
    private String nome;
    private String descricao;
    @NotNull
    private UUID vendedorId;
    private String vendedorNome;
    @NotNull
    private UUID categoriaId;
    private String categoriaNome;
    @NotNull
    @DecimalMin("0")
    private BigDecimal preco;
    @NotNull
    @PositiveOrZero
    private BigDecimal estoque;
    private String unidade;
    private String fotoUri;
    private String status;
    private LocalDateTime createdAt;

    public ProdutoDTO() {}

    public ProdutoDTO(UUID id, String nome, String descricao, UUID vendedorId, String vendedorNome, UUID categoriaId, String categoriaNome, BigDecimal preco, BigDecimal estoque, String unidade, String fotoUri, String status, LocalDateTime createdAt) {
        this.id = id;
        this.nome = nome;
        this.descricao = descricao;
        this.vendedorId = vendedorId;
        this.vendedorNome = vendedorNome;
        this.categoriaId = categoriaId;
        this.categoriaNome = categoriaNome;
        this.preco = preco;
        this.estoque = estoque;
        this.unidade = unidade;
        this.fotoUri = fotoUri;
        this.status = status;
        this.createdAt = createdAt;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public UUID getVendedorId() { return vendedorId; }
    public void setVendedorId(UUID vendedorId) { this.vendedorId = vendedorId; }

    public String getVendedorNome() { return vendedorNome; }
    public void setVendedorNome(String vendedorNome) { this.vendedorNome = vendedorNome; }

    public UUID getCategoriaId() { return categoriaId; }
    public void setCategoriaId(UUID categoriaId) { this.categoriaId = categoriaId; }

    public String getCategoriaNome() { return categoriaNome; }
    public void setCategoriaNome(String categoriaNome) { this.categoriaNome = categoriaNome; }

    public BigDecimal getPreco() { return preco; }
    public void setPreco(BigDecimal preco) { this.preco = preco; }

    public BigDecimal getEstoque() { return estoque; }
    public void setEstoque(BigDecimal estoque) { this.estoque = estoque; }

    public String getUnidade() { return unidade; }
    public void setUnidade(String unidade) { this.unidade = unidade; }

    public String getFotoUri() { return fotoUri; }
    public void setFotoUri(String fotoUri) { this.fotoUri = fotoUri; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
