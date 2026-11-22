package com.terranova.service;

import com.terranova.enums.StatusPedido;
import com.terranova.model.OrderStateHistory;
import com.terranova.model.Pedido;
import com.terranova.repository.OrderStateHistoryRepository;
import com.terranova.repository.PedidoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.lang.NonNull;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Implementa a maquina de estados dos pedidos do Terra Nova.
 * Cada transicao valida a mudanca, atualiza datas, grava historico e dispara notificacoes.
 */
@Service
public class PedidoStateService {

    private static final Logger log = LoggerFactory.getLogger(PedidoStateService.class);
    private static final String PEDIDO_NAO_ENCONTRADO_PREFIX = "Pedido não encontrado: ";

    private final PedidoRepository pedidoRepository;
    private final OrderStateHistoryRepository stateHistoryRepository;
    private final NotificacaoService notificacaoService;

    public PedidoStateService(PedidoRepository pedidoRepository,
                             OrderStateHistoryRepository stateHistoryRepository,
                             NotificacaoService notificacaoService) {
        this.pedidoRepository = pedidoRepository;
        this.stateHistoryRepository = stateHistoryRepository;
        this.notificacaoService = notificacaoService;
    }

    /**
     * Confirma o envio do pedido e muda o status de aguardando para transporte.
     * @param pedidoId identificador do pedido
     * @param vendedorId identificador do vendedor que esta confirmando o envio
     * @return pedido atualizado
     * @throws IllegalArgumentException quando o pedido nao existe, o vendedor nao e autorizado ou a transicao e invalida
     */
    @Transactional
    public Pedido confirmarEnvio(@NonNull UUID pedidoId, @NonNull UUID vendedorId) {
        // Carrega o pedido que tera o status alterado.
        Pedido pedido = pedidoRepository.findById(pedidoId)
            .orElseThrow(() -> new IllegalArgumentException(PEDIDO_NAO_ENCONTRADO_PREFIX + pedidoId));

        // Garante que apenas o vendedor do pedido possa confirmar o envio.
        if (!pedido.getVendedor().getId().equals(vendedorId)) {
            throw new IllegalArgumentException("Vendedor não autorizado para confirmar este pedido");
        }

        // Valida a transicao permitida de aguardando para transporte.
        if (!pedido.getStatus().isValidTransitionTo(StatusPedido.transporte)) {
            throw new IllegalArgumentException(
                "Transição inválida: " + pedido.getStatus() + " → TRANSPORTE. " +
                "Pedido deve estar em AGUARDANDO."
            );
        }

        // Guarda o status anterior para gravar no historico.
        StatusPedido statusAnterior = pedido.getStatus();

        // Atualiza status e datas relacionadas ao envio.
        pedido.setStatus(StatusPedido.transporte);
        if (pedido.getDataConfirmacao() == null) {
            pedido.setDataConfirmacao(LocalDateTime.now());
        }
        if (pedido.getDataEnvio() == null) {
            pedido.setDataEnvio(LocalDateTime.now());
        }

        // Persiste o pedido com o novo estado.
        Pedido pedidoAtualizado = pedidoRepository.save(pedido);

        // Registra a transicao no historico de estados do pedido.
        OrderStateHistory history = new OrderStateHistory(
            pedidoId,
            statusAnterior,
            StatusPedido.transporte,
            vendedorId,
            "Vendedor confirmou o envio do pedido"
        );
        stateHistoryRepository.save(history);

        // Notifica o comprador que o pedido foi enviado.
        try {
            notificacaoService.notificarCompradorPedidoEmTransito(
                pedido.getComprador().getId(),
                pedidoId.toString()
            );
        } catch (Exception e) {
            // Mantem a transacao principal mesmo se a notificacao falhar.
            log.warn("Falha ao enviar notificacao ao comprador para o pedido {}", pedidoId, e);
        }

        return pedidoAtualizado;
    }

    /**
     * Confirma o recebimento do pedido e muda o status de transporte para finalizado.
     * @param pedidoId identificador do pedido
     * @param compradorId identificador do comprador que esta confirmando o recebimento
     * @return pedido atualizado
     * @throws IllegalArgumentException quando o pedido nao existe, o comprador nao e autorizado ou a transicao e invalida
     */
    @Transactional
    public Pedido confirmarRecebimento(@NonNull UUID pedidoId, @NonNull UUID compradorId) {
        // Carrega o pedido que tera o recebimento confirmado.
        Pedido pedido = pedidoRepository.findById(pedidoId)
            .orElseThrow(() -> new IllegalArgumentException(PEDIDO_NAO_ENCONTRADO_PREFIX + pedidoId));

        // Garante que apenas o comprador do pedido possa confirmar o recebimento.
        if (!pedido.getComprador().getId().equals(compradorId)) {
            throw new IllegalArgumentException("Comprador não autorizado para confirmar este pedido");
        }

        // Valida a transicao permitida de transporte para finalizado.
        if (!pedido.getStatus().isValidTransitionTo(StatusPedido.finalizado)) {
            throw new IllegalArgumentException(
                "Transição inválida: " + pedido.getStatus() + " → FINALIZADO. " +
                "Pedido deve estar em TRANSPORTE."
            );
        }

        // Guarda o status anterior para compor o historico.
        StatusPedido statusAnterior = pedido.getStatus();

        // Atualiza o status e a data de entrega.
        pedido.setStatus(StatusPedido.finalizado);
        if (pedido.getDataEntrega() == null) {
            pedido.setDataEntrega(LocalDateTime.now());
        }

        // Persiste o pedido com o novo estado.
        Pedido pedidoAtualizado = pedidoRepository.save(pedido);

        // Registra a mudanca no historico de estados.
        OrderStateHistory history = new OrderStateHistory(
            pedidoId,
            statusAnterior,
            StatusPedido.finalizado,
            compradorId,
            "Comprador confirmou o recebimento do pedido"
        );
        stateHistoryRepository.save(history);

        // Dispara a notificacao para lembrar o comprador de avaliar o pedido.
        try {
            notificacaoService.notificarCompradorParaAvaliar(
                compradorId,
                pedidoId.toString(),
                pedido.getVendedor().getFullName()
            );
        } catch (Exception e) {
            log.warn("Falha ao enviar notificacao de avaliacao para o pedido {}", pedidoId, e);
        }

        return pedidoAtualizado;
    }

    /**
     * Cancela o pedido quando ele ainda esta aguardando processamento.
     * @param pedidoId identificador do pedido
     * @param compradorId identificador do comprador que esta solicitando o cancelamento
     * @param motivo motivo informado para o cancelamento
     * @return pedido atualizado com status cancelado
     * @throws IllegalArgumentException quando o pedido nao existe, o comprador nao e autorizado ou o status nao permite cancelamento
     */
    @Transactional
    public Pedido cancelarPedido(@NonNull UUID pedidoId, @NonNull UUID compradorId, String motivo) {
        // Carrega o pedido que sera cancelado.
        Pedido pedido = pedidoRepository.findById(pedidoId)
            .orElseThrow(() -> new IllegalArgumentException(PEDIDO_NAO_ENCONTRADO_PREFIX + pedidoId));

        // Garante que apenas o comprador do pedido possa cancela-lo.
        if (!pedido.getComprador().getId().equals(compradorId)) {
            throw new IllegalArgumentException("Comprador não autorizado para cancelar este pedido");
        }

        // Valida que apenas pedidos em aguardando podem ser cancelados.
        if (!pedido.getStatus().isValidTransitionTo(StatusPedido.cancelado)) {
            throw new IllegalArgumentException(
                "Não é possível cancelar o pedido no status " + pedido.getStatus() + ". " +
                "Apenas pedidos em AGUARDANDO podem ser cancelados."
            );
        }

        // Guarda o status anterior para o historico.
        StatusPedido statusAnterior = pedido.getStatus();

        // Atualiza o pedido para o estado cancelado.
        pedido.setStatus(StatusPedido.cancelado);

        // Persiste o pedido com o novo estado.
        Pedido pedidoAtualizado = pedidoRepository.save(pedido);

        // Registra a transicao e o motivo do cancelamento.
        String motivoCompleto = motivo != null && !motivo.isBlank() ? motivo : "Comprador cancelou o pedido";
        OrderStateHistory history = new OrderStateHistory(
            pedidoId,
            statusAnterior,
            StatusPedido.cancelado,
            compradorId,
            motivoCompleto
        );
        stateHistoryRepository.save(history);

        // Notifica o vendedor sobre o cancelamento do pedido.
        try {
            notificacaoService.notificarVendedorPedidoCancelado(
                pedido.getVendedor().getId(),
                pedidoId.toString(),
                motivoCompleto
            );
        } catch (Exception e) {
            log.warn("Falha ao notificar vendedor sobre cancelamento do pedido {}", pedidoId, e);
        }

        return pedidoAtualizado;
    }

    /**
     * Retorna o historico completo de transicoes de estado de um pedido.
     * @param pedidoId identificador do pedido
     * @return lista ordenada cronologicamente com as transicoes do pedido
     */
    public java.util.List<OrderStateHistory> obterHistorico(@NonNull UUID pedidoId) {
        return stateHistoryRepository.findByPedidoIdOrderByMudadoEmAsc(pedidoId);
    }
}
