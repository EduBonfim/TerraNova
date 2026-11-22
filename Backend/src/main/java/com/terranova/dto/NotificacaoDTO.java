package com.terranova.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class NotificacaoDTO {
    
    private UUID id;
    private UUID usuarioId;
    private String titulo;
    private String descricao;
    private String categoria;
    private String rota;
    private Boolean lida;
    private LocalDateTime criadoEm;

    public NotificacaoDTO() {}

    public NotificacaoDTO(UUID id, UUID usuarioId, String titulo, String descricao, String categoria, String rota, Boolean lida, LocalDateTime criadoEm) {
        this.id = id;
        this.usuarioId = usuarioId;
        this.titulo = titulo;
        this.descricao = descricao;
        this.categoria = categoria;
        this.rota = rota;
        this.lida = lida;
        this.criadoEm = criadoEm;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getUsuarioId() { return usuarioId; }
    public void setUsuarioId(UUID usuarioId) { this.usuarioId = usuarioId; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }

    public String getRota() { return rota; }
    public void setRota(String rota) { this.rota = rota; }

    public Boolean getLida() { return lida; }
    public void setLida(Boolean lida) { this.lida = lida; }

    public LocalDateTime getCriadoEm() { return criadoEm; }
    public void setCriadoEm(LocalDateTime criadoEm) { this.criadoEm = criadoEm; }
}
