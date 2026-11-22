package com.terranova.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public class CheckoutRequest {

    @NotNull
    private UUID compradorId;

    @NotNull
    private UUID vendedorId;

    @NotEmpty
    private List<Item> items;

    public static class Item {
        // produtoId é opcional: null quando o item vem de um listing local (sem cadastro no banco)
        private UUID produtoId;

        // Nome do produto — obrigatório quando produtoId for null
        private String produtoNome;

        private String categoria; // 'alimentos', 'insumos', 'sementes', 'cultivo'

        @NotNull
        @Positive
        private BigDecimal quantidade;

        @NotNull
        @Positive
        private BigDecimal valorUnitario;

        public UUID getProdutoId() { return produtoId; }
        public void setProdutoId(UUID produtoId) { this.produtoId = produtoId; }

        public String getProdutoNome() { return produtoNome; }
        public void setProdutoNome(String produtoNome) { this.produtoNome = produtoNome; }

        public String getCategoria() { return categoria; }
        public void setCategoria(String categoria) { this.categoria = categoria; }

        public BigDecimal getQuantidade() { return quantidade; }
        public void setQuantidade(BigDecimal quantidade) { this.quantidade = quantidade; }

        public BigDecimal getValorUnitario() { return valorUnitario; }
        public void setValorUnitario(BigDecimal valorUnitario) { this.valorUnitario = valorUnitario; }
    }

    public UUID getCompradorId() { return compradorId; }
    public void setCompradorId(UUID compradorId) { this.compradorId = compradorId; }

    public UUID getVendedorId() { return vendedorId; }
    public void setVendedorId(UUID vendedorId) { this.vendedorId = vendedorId; }

    public List<Item> getItems() { return items; }
    public void setItems(List<Item> items) { this.items = items; }
}
