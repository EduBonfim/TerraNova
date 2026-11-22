package com.terranova.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "itens_pedido")
public class ItemPedido {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pedido_id", nullable = false)
    private Pedido pedido;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produto_id", nullable = true)
    private Produto produto;

    @Column(name = "produto_nome_avulso")
    private String produtoNomeAvulso;

    @Column(nullable = false)
    private BigDecimal quantidade;

    @Column(name = "preco_unitario", nullable = false)
    private BigDecimal precoUnitario;

    @Column(nullable = false)
    private BigDecimal subtotal;

    public ItemPedido() {
    }

    public ItemPedido(Pedido pedido, Produto produto, BigDecimal quantidade, BigDecimal precoUnitario) {
        this.pedido = pedido;
        this.produto = produto;
        this.quantidade = quantidade;
        this.precoUnitario = precoUnitario;
        this.subtotal = quantidade.multiply(precoUnitario);
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Pedido getPedido() {
        return pedido;
    }

    public void setPedido(Pedido pedido) {
        this.pedido = pedido;
    }

    public Produto getProduto() {
        return produto;
    }

    public void setProduto(Produto produto) {
        this.produto = produto;
    }

    public String getProdutoNomeAvulso() {
        return produtoNomeAvulso;
    }

    public void setProdutoNomeAvulso(String produtoNomeAvulso) {
        this.produtoNomeAvulso = produtoNomeAvulso;
    }

    public String getNomeEfetivo() {
        return produto != null ? produto.getNome() : produtoNomeAvulso;
    }

    public BigDecimal getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(BigDecimal quantidade) {
        this.quantidade = quantidade;
    }

    public BigDecimal getPrecoUnitario() {
        return precoUnitario;
    }

    public void setPrecoUnitario(BigDecimal precoUnitario) {
        this.precoUnitario = precoUnitario;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public static Builder builder() {
        return new Builder();
    }

    @Override
    public String toString() {
        return "ItemPedido{" +
                "id=" + id +
                ", quantidade=" + quantidade +
                ", precoUnitario=" + precoUnitario +
                ", subtotal=" + subtotal +
                '}';
    }

    public static class Builder {
        private UUID id;
        private Pedido pedido;
        private Produto produto;
        private String produtoNomeAvulso;
        private BigDecimal quantidade;
        private BigDecimal precoUnitario;
        private BigDecimal subtotal;

        public Builder id(UUID id) {
            this.id = id;
            return this;
        }

        public Builder pedido(Pedido pedido) {
            this.pedido = pedido;
            return this;
        }

        public Builder produto(Produto produto) {
            this.produto = produto;
            return this;
        }

        public Builder produtoNomeAvulso(String produtoNomeAvulso) {
            this.produtoNomeAvulso = produtoNomeAvulso;
            return this;
        }

        public Builder quantidade(BigDecimal quantidade) {
            this.quantidade = quantidade;
            return this;
        }

        public Builder precoUnitario(BigDecimal precoUnitario) {
            this.precoUnitario = precoUnitario;
            return this;
        }

        public Builder subtotal(BigDecimal subtotal) {
            this.subtotal = subtotal;
            return this;
        }

        public ItemPedido build() {
            ItemPedido itemPedido = new ItemPedido();
            itemPedido.id = this.id;
            itemPedido.pedido = this.pedido;
            itemPedido.produto = this.produto;
            itemPedido.produtoNomeAvulso = this.produtoNomeAvulso;
            itemPedido.quantidade = this.quantidade;
            itemPedido.precoUnitario = this.precoUnitario;
            itemPedido.subtotal = this.subtotal != null ? this.subtotal : 
                                   this.quantidade.multiply(this.precoUnitario);
            return itemPedido;
        }
    }
}