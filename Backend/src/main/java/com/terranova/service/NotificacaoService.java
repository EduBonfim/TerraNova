package com.terranova.service;

import com.terranova.model.Notificacao;
import com.terranova.model.Usuario;
import com.terranova.repository.NotificacaoRepository;
import com.terranova.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.lang.NonNull;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Centraliza a criacao e a consulta de notificacoes do sistema.
 * Evita duplicidade de logica entre controladores e outros servicos.
 */
@Service
public class NotificacaoService {

    private static final String CATEGORIA_PEDIDOS = "PEDIDOS";

    private final NotificacaoRepository notificacaoRepository;
    private final UsuarioRepository usuarioRepository;

    public NotificacaoService(NotificacaoRepository notificacaoRepository,
                            UsuarioRepository usuarioRepository) {
        this.notificacaoRepository = notificacaoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    /**
     * Cria uma notificacao generica para um usuario.
     * @param usuarioId identificador do destinatario
     * @param titulo titulo exibido na notificacao
     * @param descricao descricao detalhada da notificacao
     * @param categoria categoria usada para organizacao
     * @param rota rota de navegacao associada
     * @param itemAlvoId identificador opcional do item relacionado
     */
    public Notificacao criarNotificacao(@NonNull UUID usuarioId,
                                       @NonNull String titulo,
                                       @NonNull String descricao,
                                       @NonNull String categoria,
                                       String rota,
                                       String itemAlvoId) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findById(usuarioId);
        if (usuarioOpt.isEmpty()) {
            throw new IllegalArgumentException("Usuário não encontrado: " + usuarioId);
        }

        Notificacao notificacao = new Notificacao();
        notificacao.setUsuario(usuarioOpt.get());
        notificacao.setTitulo(titulo);
        notificacao.setDescricao(descricao);
        notificacao.setCategoria(categoria);
        notificacao.setRota(rota);
        notificacao.setItemAlvoId(itemAlvoId);
        notificacao.setLida(false);

        return notificacaoRepository.save(notificacao);
    }

    /**
     * Notifica o comprador quando o pedido entra em transito.
     */
    public Notificacao notificarCompradorPedidoEmTransito(@NonNull UUID compradorId,
                                                          @NonNull String pedidoId) {
        return criarNotificacao(
            compradorId,
            "Seu pedido está a caminho!",
            "O vendedor confirmou o envio do seu pedido. Acompanhe o status de entrega.",
            CATEGORIA_PEDIDOS,
            "/orders/" + pedidoId,
            pedidoId
        );
    }

    /**
     * Notifica o vendedor quando um novo pedido e criado.
     */
    public Notificacao notificarVendedorNovoPedido(@NonNull UUID vendedorId,
                                                   @NonNull String pedidoId,
                                                   String nomeProduto) {
        String descricao = "Um novo pedido foi criado";
        if (nomeProduto != null && !nomeProduto.isBlank()) {
            descricao += ": " + nomeProduto;
        }

        return criarNotificacao(
            vendedorId,
            "Novo pedido recebido!",
            descricao,
            CATEGORIA_PEDIDOS,
            "/sales/" + pedidoId,
            pedidoId
        );
    }

    /**
     * Notifica o comprador para avaliar o pedido apos a entrega.
     */
    public Notificacao notificarCompradorParaAvaliar(@NonNull UUID compradorId,
                                                     @NonNull String pedidoId,
                                                     String nomeVendedor) {
        String descricao = "Seu pedido foi entregue! Avalie o vendedor e compartilhe sua experiência.";
        if (nomeVendedor != null && !nomeVendedor.isBlank()) {
            descricao = "Seu pedido de " + nomeVendedor + " foi entregue! Avalie e compartilhe sua experiência.";
        }

        return criarNotificacao(
            compradorId,
            "Avaliar pedido",
            descricao,
            CATEGORIA_PEDIDOS,
            "/orders/" + pedidoId + "/review",
            pedidoId
        );
    }

    /**
     * Notifica o vendedor quando o comprador cancela o pedido.
     */
    public Notificacao notificarVendedorPedidoCancelado(@NonNull UUID vendedorId,
                                                        @NonNull String pedidoId,
                                                        String motivo) {
        String descricao = "Um pedido foi cancelado";
        if (motivo != null && !motivo.isBlank()) {
            descricao += ": " + motivo;
        }

        return criarNotificacao(
            vendedorId,
            "Pedido cancelado",
            descricao,
            CATEGORIA_PEDIDOS,
            "/sales/" + pedidoId,
            pedidoId
        );
    }

    /**
     * Notifica o comprador quando recebe uma avaliacao do vendedor.
     */
    public Notificacao notificarCompradorAvaliacaoVendedor(@NonNull UUID compradorId,
                                                           String nomeVendedor) {
        String descricao = "Um vendedor deixou uma avaliação sobre você";
        if (nomeVendedor != null && !nomeVendedor.isBlank()) {
            descricao = nomeVendedor + " deixou uma avaliação sobre você";
        }

        return criarNotificacao(
            compradorId,
            "Nova avaliação recebida",
            descricao,
            "AVALIACOES",
            "/profile",
            null
        );
    }

    /**
     * Notifica o vendedor quando recebe uma avaliacao do comprador.
     */
    public Notificacao notificarVendedorAvaliacaoComprador(@NonNull UUID vendedorId,
                                                           String nomeComprador) {
        String descricao = "Um comprador deixou uma avaliação sobre você";
        if (nomeComprador != null && !nomeComprador.isBlank()) {
            descricao = nomeComprador + " deixou uma avaliação sobre você";
        }

        return criarNotificacao(
            vendedorId,
            "Nova avaliação recebida",
            descricao,
            "AVALIACOES",
            "/profile",
            null
        );
    }

    /**
     * Marca uma notificacao como lida.
     */
    public Notificacao marcarComoLida(@NonNull UUID notificacaoId) {
        Optional<Notificacao> notificacaoOpt = notificacaoRepository.findById(notificacaoId);
        if (notificacaoOpt.isEmpty()) {
            throw new IllegalArgumentException("Notificação não encontrada: " + notificacaoId);
        }

        Notificacao notificacao = notificacaoOpt.get();
        notificacao.setLida(true);
        return notificacaoRepository.save(notificacao);
    }

    /**
     * Retorna a quantidade de notificacoes nao lidas de um usuario.
     */
    public long contarNaoLidas(@NonNull UUID usuarioId) {
        return notificacaoRepository.countByUsuarioIdAndLidaFalse(usuarioId);
    }

    /**
     * Retorna todas as notificacoes de um usuario em ordem decrescente de criacao.
     */
    public List<Notificacao> obterNotificacoes(@NonNull UUID usuarioId) {
        return notificacaoRepository.findByUsuarioIdOrderByCreatedAtDesc(usuarioId);
    }

    /**
     * Retorna apenas as notificacoes nao lidas de um usuario.
     */
    public List<Notificacao> obterNaoLidas(@NonNull UUID usuarioId) {
        return notificacaoRepository.findByUsuarioIdAndLidaFalseOrderByCreatedAtDesc(usuarioId);
    }
}
