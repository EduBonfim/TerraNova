package com.terranova.repository;

import com.terranova.model.Pedido;
import com.terranova.enums.StatusPedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, UUID> {
    List<Pedido> findByVendedorId(UUID vendedorId);
    List<Pedido> findByCompradorId(UUID compradorId);
    List<Pedido> findByStatus(StatusPedido status);
    Optional<Pedido> findByNumeroPedido(String numeroPedido);
    List<Pedido> findByVendedorIdAndStatus(UUID vendedorId, StatusPedido status);
    List<Pedido> findByCompradorIdAndStatus(UUID compradorId, StatusPedido status);
}
