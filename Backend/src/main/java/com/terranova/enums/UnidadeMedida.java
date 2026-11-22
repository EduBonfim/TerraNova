package com.terranova.enums;

public enum UnidadeMedida {
    QUILOGRAMA("kg", "Quilograma"),
    GRAMA("g", "Grama"),
    LITRO("L", "Litro"),
    MILILITRO("mL", "Mililitro"),
    UNIDADE("un", "Unidade"),
    DUZIA("dz", "Dúzia"),
    CAIXA("cx", "Caixa"),
    SACO("sc", "Saco");

    private final String simbolo;
    private final String descricao;

    UnidadeMedida(String simbolo, String descricao) {
        this.simbolo = simbolo;
        this.descricao = descricao;
    }

    public String getSimbolo() {
        return simbolo;
    }

    public String getDescricao() {
        return descricao;
    }
}
