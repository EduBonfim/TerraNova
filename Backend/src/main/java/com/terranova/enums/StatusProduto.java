package com.terranova.enums;

public enum StatusProduto {
    ATIVO("Ativo"),
    INATIVO("Inativo"),
    ESGOTADO("Esgotado"),
    DESCONTINUADO("Descontinuado");

    private final String descricao;

    StatusProduto(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
