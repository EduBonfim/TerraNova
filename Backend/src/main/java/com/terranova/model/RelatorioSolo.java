package com.terranova.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "relatorios_solo")
public class RelatorioSolo {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "data_analise", nullable = false)
    private LocalDate dataAnalise;

    @Column(name = "imagem_uri")
    private String imagemUri;

    @Column(name = "confianca")
    private BigDecimal confianca; 

    @Column(name = "ph")
    private BigDecimal ph;

    @Column(name = "materia_organica")
    private BigDecimal materiaOrganica;

    @Column(name = "fosforo")
    private BigDecimal fosforo;

    @Column(name = "potassio")
    private BigDecimal potassio;

    @Column(name = "calcio")
    private BigDecimal calcio;

    @Column(name = "magnesio")
    private BigDecimal magnesio;

    @Column(name = "aluminio")
    private BigDecimal aluminio;

    @Column(name = "ctc")
    private BigDecimal ctc;

    @Column(name = "v_base")
    private BigDecimal vBase;

    @Column(columnDefinition = "TEXT")
    private String diagnostico;

    @Column(columnDefinition = "TEXT")
    private String recomendacoes;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public RelatorioSolo() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public LocalDate getDataAnalise() { return dataAnalise; }
    public void setDataAnalise(LocalDate dataAnalise) { this.dataAnalise = dataAnalise; }

    public String getImagemUri() { return imagemUri; }
    public void setImagemUri(String imagemUri) { this.imagemUri = imagemUri; }

    public BigDecimal getConfianca() { return confianca; }
    public void setConfianca(BigDecimal confianca) { this.confianca = confianca; }

    public BigDecimal getPh() { return ph; }
    public void setPh(BigDecimal ph) { this.ph = ph; }

    public BigDecimal getMateriaOrganica() { return materiaOrganica; }
    public void setMateriaOrganica(BigDecimal materiaOrganica) { this.materiaOrganica = materiaOrganica; }

    public BigDecimal getFosforo() { return fosforo; }
    public void setFosforo(BigDecimal fosforo) { this.fosforo = fosforo; }

    public BigDecimal getPotassio() { return potassio; }
    public void setPotassio(BigDecimal potassio) { this.potassio = potassio; }

    public BigDecimal getCalcio() { return calcio; }
    public void setCalcio(BigDecimal calcio) { this.calcio = calcio; }

    public BigDecimal getMagnesio() { return magnesio; }
    public void setMagnesio(BigDecimal magnesio) { this.magnesio = magnesio; }

    public BigDecimal getAluminio() { return aluminio; }
    public void setAluminio(BigDecimal aluminio) { this.aluminio = aluminio; }

    public BigDecimal getCtc() { return ctc; }
    public void setCtc(BigDecimal ctc) { this.ctc = ctc; }

    public BigDecimal getVBase() { return vBase; }
    public void setVBase(BigDecimal vBase) { this.vBase = vBase; }

    public String getDiagnostico() { return diagnostico; }
    public void setDiagnostico(String diagnostico) { this.diagnostico = diagnostico; }

    public String getRecomendacoes() { return recomendacoes; }
    public void setRecomendacoes(String recomendacoes) { this.recomendacoes = recomendacoes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
