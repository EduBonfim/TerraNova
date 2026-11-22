package com.terranova.dto;

import com.terranova.enums.TipoAvaliacao;
import java.time.LocalDateTime;
import java.util.UUID;

public class AvaliacaoDTO {

    // Identificador unico da avaliacao.
    private UUID id;
    // Identificador de quem fez a avaliacao.
    private UUID avaliadorId;
    // Nome de quem fez a avaliacao.
    private String avaliadorNome;
    // Identificador de quem recebeu a avaliacao.
    private UUID avaliadoId;
    // Nome de quem recebeu a avaliacao.
    private String avaliadoNome;
    // Pedido ligado a essa avaliacao.
    private UUID pedidoId;
    // Produto relacionado a avaliacao, quando existir.
    private UUID produtoId;
    // Nome do produto avaliado.
    private String produtoNome;
    // Nota dada na avaliacao.
    private Integer nota;
    // Comentario escrito pelo usuario.
    private String comentario;
    // Tipo de avaliacao: COMPRADOR_AVALIA_PRODUTOR ou PRODUTOR_AVALIA_COMPRADOR
    private TipoAvaliacao tipoAvaliacao;
    // Data e hora em que a avaliacao foi criada.
    private LocalDateTime createdAt;

    // Construtor vazio para facilitar serializacao e desserializacao.
    public AvaliacaoDTO() {
    }

    // Retorna o identificador da avaliacao.
    public UUID getId() {
        return id;
    }

    // Atualiza o identificador da avaliacao.
    public void setId(UUID id) {
        this.id = id;
    }

    // Retorna o id de quem fez a avaliacao.
    public UUID getAvaliadorId() {
        return avaliadorId;
    }

    // Atualiza o id de quem fez a avaliacao.
    public void setAvaliadorId(UUID avaliadorId) {
        this.avaliadorId = avaliadorId;
    }

    // Retorna o nome de quem fez a avaliacao.
    public String getAvaliadorNome() {
        return avaliadorNome;
    }

    // Atualiza o nome de quem fez a avaliacao.
    public void setAvaliadorNome(String avaliadorNome) {
        this.avaliadorNome = avaliadorNome;
    }

    // Retorna o id de quem recebeu a avaliacao.
    public UUID getAvaliadoId() {
        return avaliadoId;
    }

    // Atualiza o id de quem recebeu a avaliacao.
    public void setAvaliadoId(UUID avaliadoId) {
        this.avaliadoId = avaliadoId;
    }

    // Retorna o nome de quem recebeu a avaliacao.
    public String getAvaliadoNome() {
        return avaliadoNome;
    }

    // Atualiza o nome de quem recebeu a avaliacao.
    public void setAvaliadoNome(String avaliadoNome) {
        this.avaliadoNome = avaliadoNome;
    }

    // Retorna o pedido associado a avaliacao.
    public UUID getPedidoId() {
        return pedidoId;
    }

    // Atualiza o pedido associado a avaliacao.
    public void setPedidoId(UUID pedidoId) {
        this.pedidoId = pedidoId;
    }

    // Retorna o produto vinculado a avaliacao.
    public UUID getProdutoId() {
        return produtoId;
    }

    // Atualiza o produto vinculado a avaliacao.
    public void setProdutoId(UUID produtoId) {
        this.produtoId = produtoId;
    }

    // Retorna o nome do produto avaliado.
    public String getProdutoNome() {
        return produtoNome;
    }

    // Atualiza o nome do produto avaliado.
    public void setProdutoNome(String produtoNome) {
        this.produtoNome = produtoNome;
    }

    // Retorna a nota informada.
    public Integer getNota() {
        return nota;
    }

    // Atualiza a nota informada.
    public void setNota(Integer nota) {
        this.nota = nota;
    }

    // Retorna o comentario da avaliacao.
    public String getComentario() {
        return comentario;
    }

    // Atualiza o comentario da avaliacao.
    public void setComentario(String comentario) {
        this.comentario = comentario;
    }

    // Retorna o tipo de avaliacao.
    public TipoAvaliacao getTipoAvaliacao() {
        return tipoAvaliacao;
    }

    // Atualiza o tipo de avaliacao.
    public void setTipoAvaliacao(TipoAvaliacao tipoAvaliacao) {
        this.tipoAvaliacao = tipoAvaliacao;
    }

    // Retorna a data e hora de criacao.
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    // Atualiza a data e hora de criacao.
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
