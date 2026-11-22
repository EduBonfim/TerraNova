package com.terranova.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class CertificadoDTO {
    private UUID id;
    private UUID usuarioId;
    private String usuarioNome;
    private UUID tipoCertificacaoId;
    private String tipoCertificacaoNome; // 'Organico', 'Transicao', 'Convencional'
    private String titulo;
    private String emissor;
    private String numeroRegistro;
    private String dataEmissao;   // dd/MM/yyyy string
    private String dataVencimento;  // dd/MM/yyyy string
    private String urlDocumento;
    private String status;
    private String notas;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public CertificadoDTO() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getUsuarioId() { return usuarioId; }
    public void setUsuarioId(UUID usuarioId) { this.usuarioId = usuarioId; }

    public String getUsuarioNome() { return usuarioNome; }
    public void setUsuarioNome(String usuarioNome) { this.usuarioNome = usuarioNome; }

    public UUID getTipoCertificacaoId() { return tipoCertificacaoId; }
    public void setTipoCertificacaoId(UUID tipoCertificacaoId) { this.tipoCertificacaoId = tipoCertificacaoId; }

    public String getTipoCertificacaoNome() { return tipoCertificacaoNome; }
    public void setTipoCertificacaoNome(String tipoCertificacaoNome) { this.tipoCertificacaoNome = tipoCertificacaoNome; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getEmissor() { return emissor; }
    public void setEmissor(String emissor) { this.emissor = emissor; }

    public String getNumeroRegistro() { return numeroRegistro; }
    public void setNumeroRegistro(String numeroRegistro) { this.numeroRegistro = numeroRegistro; }

    public String getDataEmissao() { return dataEmissao; }
    public void setDataEmissao(String dataEmissao) { this.dataEmissao = dataEmissao; }

    public String getDataVencimento() { return dataVencimento; }
    public void setDataVencimento(String dataVencimento) { this.dataVencimento = dataVencimento; }

    public String getUrlDocumento() { return urlDocumento; }
    public void setUrlDocumento(String urlDocumento) { this.urlDocumento = urlDocumento; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNotas() { return notas; }
    public void setNotas(String notas) { this.notas = notas; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
