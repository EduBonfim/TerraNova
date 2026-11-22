package com.terranova.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class RelatorioSoloDTO {

    private UUID id;
    private UUID usuarioId;
    private String usuarioNome;
    private LocalDate dataAnalise;
    private String imagemUri;
    private BigDecimal confianca;
    private BigDecimal ph;
    private BigDecimal materiaOrganica;
    private BigDecimal fosforo;
    private BigDecimal potassio;
    private BigDecimal calcio;
    private BigDecimal magnesio;
    private BigDecimal aluminio;
    private BigDecimal ctc;
    private BigDecimal vBase;
    private String diagnostico;
    private String recomendacoes;
    private LocalDateTime createdAt;

    public RelatorioSoloDTO() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(UUID usuarioId) {
        this.usuarioId = usuarioId;
    }

    public String getUsuarioNome() {
        return usuarioNome;
    }

    public void setUsuarioNome(String usuarioNome) {
        this.usuarioNome = usuarioNome;
    }

    public LocalDate getDataAnalise() {
        return dataAnalise;
    }

    public void setDataAnalise(LocalDate dataAnalise) {
        this.dataAnalise = dataAnalise;
    }

    public String getImagemUri() {
        return imagemUri;
    }

    public void setImagemUri(String imagemUri) {
        this.imagemUri = imagemUri;
    }

    public BigDecimal getConfianca() {
        return confianca;
    }

    public void setConfianca(BigDecimal confianca) {
        this.confianca = confianca;
    }

    public BigDecimal getPh() {
        return ph;
    }

    public void setPh(BigDecimal ph) {
        this.ph = ph;
    }

    public BigDecimal getMateriaOrganica() {
        return materiaOrganica;
    }

    public void setMateriaOrganica(BigDecimal materiaOrganica) {
        this.materiaOrganica = materiaOrganica;
    }

    public BigDecimal getFosforo() {
        return fosforo;
    }

    public void setFosforo(BigDecimal fosforo) {
        this.fosforo = fosforo;
    }

    public BigDecimal getPotassio() {
        return potassio;
    }

    public void setPotassio(BigDecimal potassio) {
        this.potassio = potassio;
    }

    public BigDecimal getCalcio() {
        return calcio;
    }

    public void setCalcio(BigDecimal calcio) {
        this.calcio = calcio;
    }

    public BigDecimal getMagnesio() {
        return magnesio;
    }

    public void setMagnesio(BigDecimal magnesio) {
        this.magnesio = magnesio;
    }

    public BigDecimal getAluminio() {
        return aluminio;
    }

    public void setAluminio(BigDecimal aluminio) {
        this.aluminio = aluminio;
    }

    public BigDecimal getCtc() {
        return ctc;
    }

    public void setCtc(BigDecimal ctc) {
        this.ctc = ctc;
    }

    public BigDecimal getVBase() {
        return vBase;
    }

    public void setVBase(BigDecimal vBase) {
        this.vBase = vBase;
    }

    public String getDiagnostico() {
        return diagnostico;
    }

    public void setDiagnostico(String diagnostico) {
        this.diagnostico = diagnostico;
    }

    public String getRecomendacoes() {
        return recomendacoes;
    }

    public void setRecomendacoes(String recomendacoes) {
        this.recomendacoes = recomendacoes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
