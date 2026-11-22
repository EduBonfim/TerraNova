package com.terranova.service;

import com.terranova.model.Pedido;
import com.terranova.enums.StatusPedido;
import com.terranova.repository.PedidoRepository;
import org.springframework.stereotype.Service;
import org.springframework.lang.NonNull;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class PedidoService {

    private final PedidoRepository pedidoRepository;

    public PedidoService(PedidoRepository pedidoRepository) {
        this.pedidoRepository = pedidoRepository;
    }

    public List<Pedido> listarTodos() {
        return pedidoRepository.findAll();
    }

    public Optional<Pedido> obterPorId(@NonNull UUID id) {
        return pedidoRepository.findById(id);
    }

    public List<Pedido> listarPorVendedor(UUID vendedorId) {
        return pedidoRepository.findByVendedorId(vendedorId);
    }

    public List<Pedido> listarPorComprador(UUID compradorId) {
        return pedidoRepository.findByCompradorId(compradorId);
    }

    public List<Pedido> listarPorStatus(String status) {
        try {
            StatusPedido statusEnum = StatusPedido.valueOf(status.toUpperCase());
            return pedidoRepository.findByStatus(statusEnum);
        } catch (IllegalArgumentException e) {
            return List.of(); // Retorna lista vazia quando o status informado nao existe.
        }
    }

    public Pedido salvar(@NonNull Pedido pedido) {
        return pedidoRepository.save(pedido);
    }

    /**
     * Retorna os pedidos de um vendedor filtrados por status.
     */
    public List<Pedido> listarPorVendedorEStatus(UUID vendedorId, String status) {
        try {
            StatusPedido statusEnum = StatusPedido.valueOf(status.toUpperCase());
            return pedidoRepository.findByVendedorIdAndStatus(vendedorId, statusEnum);
        } catch (IllegalArgumentException e) {
            return List.of();
        }
    }

    /**
     * Retorna os pedidos de um comprador filtrados por status.
     */
    public List<Pedido> listarPorCompradorEStatus(UUID compradorId, String status) {
        try {
            StatusPedido statusEnum = StatusPedido.valueOf(status.toUpperCase());
            return pedidoRepository.findByCompradorIdAndStatus(compradorId, statusEnum);
        } catch (IllegalArgumentException e) {
            return List.of();
        }
    }
}