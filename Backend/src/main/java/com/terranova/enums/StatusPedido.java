package com.terranova.enums;

/**
 * Enum de status do pedido.
 * Define todos os estados possiveis dos pedidos no Terra Nova.
 */
public enum StatusPedido {
    /**
     * Aguardando confirmacao do vendedor.
     * Estado inicial quando o pedido e criado.
     * Proximos estados validos: TRANSPORTE, CANCELADO.
     */
    aguardando("Aguardando Confirmação"),
    
    /**
     * Pedido em transporte.
     * Definido quando o vendedor confirma e envia o pedido.
     * Proximo estado valido: FINALIZADO.
     */
    transporte("Em Transporte"),
    
    /**
     * Pedido entregue e concluido.
     * Definido quando o comprador confirma o recebimento.
     * Proximos estados validos: nenhum, estado terminal.
     */
    finalizado("Finalizado"),
    
    /**
     * Pedido cancelado.
     * So pode ser alcancado a partir de AGUARDANDO.
     * Proximos estados validos: nenhum, estado terminal.
     */
    cancelado("Cancelado");

    private final String descricao;

    StatusPedido(String descricao) {
        this.descricao = descricao;
    }

    /**
     * Retorna a descricao exibida para este status.
     */
    public String getDescricao() {
        return descricao;
    }

    /**
     * Verifica se a transicao deste status para outro e valida.
     * @param toStatus status de destino
     * @return true quando a transicao e permitida
     */
    public boolean isValidTransitionTo(StatusPedido toStatus) {
        switch (this) {
            case aguardando:
                return toStatus == StatusPedido.transporte || toStatus == StatusPedido.cancelado;
            case transporte:
                return toStatus == StatusPedido.finalizado;
            case finalizado:
            case cancelado:
                return false;  // Estados terminais nao permitem novas transicoes.
            default:
                return false;
        }
    }

    /**
     * Converte uma string para o enum StatusPedido com validacao.
     * @param value valor textual, por exemplo "aguardando"
     * @return StatusPedido correspondente ou lanca IllegalArgumentException se for invalido
     */
    public static StatusPedido fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException("Status nao pode ser nulo ou vazio");
        }
        try {
            return StatusPedido.valueOf(value.toLowerCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                "Status invalido: '" + value + "'. Valores validos: aguardando, transporte, finalizado, cancelado",
                e
            );
        }
    }
}
