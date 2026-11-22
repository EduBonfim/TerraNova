package com.terranova.data;

import java.io.Serializable;
import java.util.List;

public class InitialDataSet implements Serializable {

    private static final long serialVersionUID = 1L; // Correção do warning aqui

    private List<UsuarioData> usuarios;
    private List<CategoriaData> categorias;
    private List<ProdutoData> produtos;
    private List<PedidoData> pedidos;
    private List<NotificacaoData> notificacoes;
    private List<RelatorioSoloData> relatorisSolo;
    private List<AvaliacaoData> avaliacoes;

    // Getters and Setters
    public List<UsuarioData> getUsuarios() { return usuarios; }
    public void setUsuarios(List<UsuarioData> usuarios) { this.usuarios = usuarios; }

    public List<CategoriaData> getCategorias() { return categorias; }
    public void setCategorias(List<CategoriaData> categorias) { this.categorias = categorias; }

    public List<ProdutoData> getProdutos() { return produtos; }
    public void setProdutos(List<ProdutoData> produtos) { this.produtos = produtos; }

    public List<PedidoData> getPedidos() { return pedidos; }
    public void setPedidos(List<PedidoData> pedidos) { this.pedidos = pedidos; }

    public List<NotificacaoData> getNotificacoes() { return notificacoes; }
    public void setNotificacoes(List<NotificacaoData> notificacoes) { this.notificacoes = notificacoes; }

    public List<RelatorioSoloData> getRelatorisSolo() { return relatorisSolo; }
    public void setRelatorisSolo(List<RelatorioSoloData> relatorisSolo) { this.relatorisSolo = relatorisSolo; }

    public List<AvaliacaoData> getAvaliacoes() { return avaliacoes; }
    public void setAvaliacoes(List<AvaliacaoData> avaliacoes) { this.avaliacoes = avaliacoes; }


    public static class UsuarioData {
        public String username;
        public String password;
        public String role; 
        public String fullName;
        public String email;
        public String phone;
        public String cpf;
        public String farmName;
        public String farmDocumentType;
        public AddressData address;

        public static class AddressData {
            public String cep;
            public String street;
            public String number;
            public String neighborhood;
            public String city;
            public String state;
            public String complement;
        }
    }

    public static class CategoriaData {
        public String nome;
        public String descricao;
    }

    public static class ProdutoData {
        public String nome;
        public String descricao;
        public String vendedorUsername;
        public String categoriaNome;
        public String preco;
        public String estoque;
        public String unidade;
        public String fotoUri;
        public String status;
        public String certificacao;
    }

    public static class PedidoData {
        public String numeroPedido;
        public String vendedorUsername;
        public String compradorUsername;
        public String produtoNome;
        public String quantidade;
        public String valorUnitario;
        public String valorTotal;
        public String status;
        public String transportadora;
        public String dataPedido;
    }

    public static class NotificacaoData {
        public String usuarioUsername;
        public String titulo;
        public String descricao;
        public String categoria;
        public String rota;
        public Boolean lida;
    }

    public static class RelatorioSoloData {
        public String usuarioUsername;
        public String dataAnalise;
        public String confianca;
        public MetricasData metricas;

        public static class MetricasData {
            public String ph;
            public String materiaOrganica;
            public String fosforo;
            public String potassio;
            public String calcio;
            public String magnesio;
            public String aluminio;
            public String ctc;
            public String vBase;
        }
    }

    public static class AvaliacaoData {
        public String avaliadorUsername;
        public String avaliadoUsername;
        public Integer nota;
        public String comentario;
    }

}