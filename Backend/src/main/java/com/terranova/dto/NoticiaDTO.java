package com.terranova.dto;

public class NoticiaDTO {
    private String id;
    private String titulo;
    private String fonte;
    private String link;
    private String imagemUrl;
    private String dataPublicacao;

    public NoticiaDTO() {}

    public NoticiaDTO(String id, String titulo, String fonte, String link, String imagemUrl, String dataPublicacao) {
        this.id = id;
        this.titulo = titulo;
        this.fonte = fonte;
        this.link = link;
        this.imagemUrl = imagemUrl;
        this.dataPublicacao = dataPublicacao;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getFonte() { return fonte; }
    public void setFonte(String fonte) { this.fonte = fonte; }

    public String getLink() { return link; }
    public void setLink(String link) { this.link = link; }

    public String getImagemUrl() { return imagemUrl; }
    public void setImagemUrl(String imagemUrl) { this.imagemUrl = imagemUrl; }

    public String getDataPublicacao() { return dataPublicacao; }
    public void setDataPublicacao(String dataPublicacao) { this.dataPublicacao = dataPublicacao; }
}
