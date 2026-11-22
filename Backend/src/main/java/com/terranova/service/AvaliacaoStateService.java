package com.terranova.service;

import com.terranova.enums.TipoAvaliacao;
import com.terranova.model.Avaliacao;
import com.terranova.model.Pedido;
import com.terranova.model.Usuario;
import com.terranova.repository.AvaliacaoRepository;
import com.terranova.repository.PedidoRepository;
import com.terranova.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.lang.NonNull;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/*
 * Responsabilidades:
 * 1. Validar a elegibilidade da avaliacao, com no maximo uma por parte em cada pedido.
 * 2. Criar a avaliacao e disparar a notificacao correspondente.
 * 3. Recalcular os agregados do usuario: mediaAvaliacao, totalAvaliacoes e confiabilidade.
 * 4. Impedir duplicidade de avaliacao no mesmo sentido dentro do pedido.
 */
@Service
public class AvaliacaoStateService {

    private final AvaliacaoRepository avaliacaoRepository;
    private final PedidoRepository pedidoRepository;
    private final UsuarioRepository usuarioRepository;
    private final NotificacaoService notificacaoService;

    public AvaliacaoStateService(AvaliacaoRepository avaliacaoRepository,
                               PedidoRepository pedidoRepository,
                               UsuarioRepository usuarioRepository,
                               NotificacaoService notificacaoService) {
        this.avaliacaoRepository = avaliacaoRepository;
        this.pedidoRepository = pedidoRepository;
        this.usuarioRepository = usuarioRepository;
        this.notificacaoService = notificacaoService;
    }

    /**
     * Registra a avaliacao do comprador para o vendedor apos a conclusao do pedido.
     * @param pedidoId identificador do pedido
     * @param compradorId identificador do comprador que esta avaliando
     * @param nota nota entre 1 e 5
     * @param comentario comentario opcional da avaliacao
     * @return avaliacao criada
     * @throws IllegalArgumentException quando o pedido nao pode ser avaliado ou a avaliacao ja existe
     */
    @Transactional
    public Avaliacao avaliacaoCompradorParaProduto(@NonNull UUID pedidoId,
                                                    @NonNull UUID compradorId,
                                                    @NonNull Integer nota,
                                                    String comentario) {
        // Valida se a nota informada esta dentro do intervalo permitido.
        if (nota == null || nota < 1 || nota > 5) {
            throw new IllegalArgumentException("Nota deve estar entre 1 e 5");
        }

        // Busca o pedido que sera avaliado.
        Pedido pedido = pedidoRepository.findById(pedidoId)
            .orElseThrow(() -> new IllegalArgumentException("Pedido não encontrado"));

        // Garante que apenas pedidos finalizados possam receber avaliacao.
        if (!"finalizado".equals(pedido.getStatus().toString().toLowerCase())) {
            throw new IllegalArgumentException(
                "Pedido deve estar em FINALIZADO para ser avaliado. Status atual: " + pedido.getStatus()
            );
        }

        // Confirma que o comprador do pedido e quem esta tentando avaliar.
        if (!pedido.getComprador().getId().equals(compradorId)) {
            throw new IllegalArgumentException("Apenas o comprador pode avaliar este pedido");
        }

        // Impede que o comprador avalie o mesmo pedido mais de uma vez.
        Optional<Avaliacao> existingReview = avaliacaoRepository
            .findByPedidoIdAndAvaliadorIdAndTipoAvaliacao(pedidoId, compradorId, TipoAvaliacao.COMPRADOR_AVALIA_PRODUTOR);
        if (existingReview.isPresent()) {
            throw new IllegalArgumentException("Você já avaliou este pedido");
        }

        // Monta a avaliacao e associa os participantes corretos.
        Avaliacao avaliacao = new Avaliacao();
        avaliacao.setAvaliador(pedido.getComprador());
        avaliacao.setAvaliado(pedido.getVendedor());
        avaliacao.setPedido(pedido);
        avaliacao.setNota(nota);
        avaliacao.setComentario(comentario);
        avaliacao.setTipoAvaliacao(TipoAvaliacao.COMPRADOR_AVALIA_PRODUTOR);

        Avaliacao saved = avaliacaoRepository.save(avaliacao);

        // Atualiza os indicadores agregados do vendedor apos a nova avaliacao.
        atualizarAvaliacoesUsuario(pedido.getVendedor().getId());

        // Notifica o vendedor sobre a avaliacao recebida.
        notificacaoService.notificarVendedorAvaliacaoComprador(
            pedido.getVendedor().getId(),
            pedido.getComprador().getFullName() != null 
                ? pedido.getComprador().getFullName()
                : pedido.getComprador().getUsername()
        );

        return saved;
    }

    /**
     * Registra a avaliacao do vendedor para o comprador apos a entrega do pedido.
     * @param pedidoId identificador do pedido
     * @param vendedorId identificador do vendedor que esta avaliando
     * @param nota nota entre 1 e 5
     * @param comentario comentario opcional da avaliacao
     * @return avaliacao criada
     * @throws IllegalArgumentException quando o pedido nao pode ser avaliado ou a avaliacao ja existe
     */
    @Transactional
    public Avaliacao avaliacaoProdutoParaComprador(@NonNull UUID pedidoId,
                                                   @NonNull UUID vendedorId,
                                                   @NonNull Integer nota,
                                                   String comentario) {
        // Valida se a nota informada esta dentro do intervalo permitido.
        if (nota == null || nota < 1 || nota > 5) {
            throw new IllegalArgumentException("Nota deve estar entre 1 e 5");
        }

        // Busca o pedido que sera usado como base da avaliacao.
        Pedido pedido = pedidoRepository.findById(pedidoId)
            .orElseThrow(() -> new IllegalArgumentException("Pedido não encontrado"));

        // Exige que o pedido esteja finalizado antes de aceitar a avaliacao.
        if (!"finalizado".equals(pedido.getStatus().toString().toLowerCase())) {
            throw new IllegalArgumentException(
                "Pedido deve estar em FINALIZADO para ser avaliado. Status atual: " + pedido.getStatus()
            );
        }

        // Confirma que o vendedor do pedido e quem esta tentando avaliar.
        if (!pedido.getVendedor().getId().equals(vendedorId)) {
            throw new IllegalArgumentException("Apenas o vendedor pode avaliar este pedido");
        }

        // Impede duplicidade de avaliacao do vendedor no mesmo pedido.
        Optional<Avaliacao> existingReview = avaliacaoRepository
            .findByPedidoIdAndAvaliadorIdAndTipoAvaliacao(pedidoId, vendedorId, TipoAvaliacao.PRODUTOR_AVALIA_COMPRADOR);
        if (existingReview.isPresent()) {
            throw new IllegalArgumentException("Você já avaliou este comprador neste pedido");
        }

        // Monta a avaliacao vinculando pedido, avaliador e avaliado.
        Avaliacao avaliacao = new Avaliacao();
        avaliacao.setAvaliador(pedido.getVendedor());
        avaliacao.setAvaliado(pedido.getComprador());
        avaliacao.setPedido(pedido);
        avaliacao.setNota(nota);
        avaliacao.setComentario(comentario);
        avaliacao.setTipoAvaliacao(TipoAvaliacao.PRODUTOR_AVALIA_COMPRADOR);

        Avaliacao saved = avaliacaoRepository.save(avaliacao);

        // Atualiza os indicadores agregados do comprador apos a nova avaliacao.
        atualizarAvaliacoesUsuario(pedido.getComprador().getId());

        // Notifica o comprador sobre a avaliacao recebida.
        notificacaoService.notificarCompradorAvaliacaoVendedor(
            pedido.getComprador().getId(),
            pedido.getVendedor().getFullName() != null 
                ? pedido.getVendedor().getFullName()
                : pedido.getVendedor().getUsername()
        );

        return saved;
    }

    /**
     * Recalcula e persiste os indicadores agregados de avaliacao de um usuario.
     * @param usuarioId identificador do usuario que sera atualizado
     */
    @Transactional
    public void atualizarAvaliacoesUsuario(@NonNull UUID usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
            .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

        // Carrega todas as avaliacoes em que o usuario aparece como avaliado.
        List<Avaliacao> todasAvaliacoes = avaliacaoRepository.findByAvaliadoId(usuarioId);

        if (todasAvaliacoes.isEmpty()) {
            // Mantem os agregados zerados quando ainda nao existem avaliacoes.
            usuario.setMediaAvaliacao(0.0);
            usuario.setTotalAvaliacoes(0);
            usuario.setConfiabilidade(0.0);
        } else {
            // Calcula a media simples das notas recebidas.
            Double somaNotas = todasAvaliacoes.stream()
                .mapToDouble(a -> a.getNota().doubleValue())
                .sum();
            Double media = somaNotas / todasAvaliacoes.size();

            // Recalcula a confiabilidade com base no conjunto atual de avaliacoes.
            Double confiabilidade = calcularConfiabilidade(todasAvaliacoes);

            usuario.setMediaAvaliacao(Math.round(media * 100.0) / 100.0); // Arredonda a media para duas casas decimais.
            usuario.setTotalAvaliacoes(todasAvaliacoes.size());
            usuario.setConfiabilidade(confiabilidade);
        }

        usuarioRepository.save(usuario);
    }

    /**
     * Calcula a confiabilidade com base nas avaliacoes recebidas.
     * @param avaliacoes lista completa de avaliacoes do usuario
     * @return indice de confiabilidade no intervalo de 0.0 a 5.0
     */
    private Double calcularConfiabilidade(List<Avaliacao> avaliacoes) {
        if (avaliacoes.isEmpty()) {
            return 0.0;
        }

        // Calcula a media base das notas.
        Double media = avaliacoes.stream()
            .mapToDouble(a -> a.getNota().doubleValue())
            .average()
            .orElse(0.0);

        // Mede a variacao das notas para compor o fator de consistencia.
        Double variancia = avaliacoes.stream()
            .mapToDouble(a -> Math.pow(a.getNota().doubleValue() - media, 2))
            .average()
            .orElse(0.0);
        Double desvio = Math.sqrt(variancia);

        // Quanto menor o desvio, maior o fator de consistencia, dentro do intervalo esperado.
        Double consistencyFactor = 1.0 - (desvio / 10.0); // Normaliza o desvio para compor o fator.
        consistencyFactor = Math.max(0.8, Math.min(1.0, consistencyFactor));

        // Mais avaliacoes aumentam o peso da confiabilidade, com teto de 1.0.
        Double volumeFactor = Math.min(1.0, avaliacoes.size() / 10.0);

        // Combina media, consistencia e volume em um unico indice final.
        Double confiabilidade = media * 0.6 + (consistencyFactor * 5.0) * 0.2 + (volumeFactor * 5.0) * 0.2;

        return Math.round(confiabilidade * 100.0) / 100.0;
    }

    /**
     * Retorna as avaliacoes recebidas por um usuario.
     * @param usuarioId identificador do usuario avaliado
     * @return lista de avaliacoes recebidas
     */
    public List<Avaliacao> obterAvaliacoes(@NonNull UUID usuarioId) {
        return avaliacaoRepository.findByAvaliadoId(usuarioId);
    }

    /**
     * Retorna as avaliacoes feitas por um usuario.
     * @param usuarioId identificador do usuario avaliador
     * @return lista de avaliacoes realizadas
     */
    public List<Avaliacao> obterAvaliacoesPor(@NonNull UUID usuarioId) {
        return avaliacaoRepository.findByAvaliadorId(usuarioId);
    }

    /**
     * Retorna as avaliacoes vinculadas a um pedido especifico.
     * @param pedidoId identificador do pedido
     * @return lista de avaliacoes associadas ao pedido
     */
    public List<Avaliacao> obterAvaliacoesDoPedido(@NonNull UUID pedidoId) {
        return avaliacaoRepository.findByPedidoId(pedidoId);
    }
}
