package com.terranova.enums;

/**
 * Define a direcao e o tipo das avaliacoes no fluxo bidirecional.
 */
public enum TipoAvaliacao {
    /**
     * Comprador avalia vendedor ou produtor.
     * Usado quando o comprador avalia qualidade, prazo, comunicacao e aspectos similares.
     */
    COMPRADOR_AVALIA_PRODUTOR("Comprador avalia Produtor"),
    
    /**
     * Vendedor ou produtor avalia comprador.
     * Usado quando o vendedor avalia comunicacao, confiabilidade no pagamento e aspectos similares.
     */
    PRODUTOR_AVALIA_COMPRADOR("Produtor avalia Comprador");

    private final String descricao;

    TipoAvaliacao(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }

    /**
     * Determina o tipo de avaliacao com base nos papeis de avaliador e avaliado.
     * @param avaliadorRole papel do avaliador, como buyer ou seller
     * @param avaliadoRole papel do avaliado, como buyer ou seller
     * @return valor correspondente do enum TipoAvaliacao
     */
    public static TipoAvaliacao fromRoles(String avaliadorRole, String avaliadoRole) {
        if ("buyer".equalsIgnoreCase(avaliadorRole) && "seller".equalsIgnoreCase(avaliadoRole)) {
            return COMPRADOR_AVALIA_PRODUTOR;
        } else if ("seller".equalsIgnoreCase(avaliadorRole) && "buyer".equalsIgnoreCase(avaliadoRole)) {
            return PRODUTOR_AVALIA_COMPRADOR;
        }
        throw new IllegalArgumentException(
            "Combinacao de papeis invalida: avaliador=" + avaliadorRole + ", avaliado=" + avaliadoRole
        );
    }
}
