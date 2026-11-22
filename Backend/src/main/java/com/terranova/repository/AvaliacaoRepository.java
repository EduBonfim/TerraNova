package com.terranova.repository;

import com.terranova.model.Avaliacao;
import com.terranova.enums.TipoAvaliacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AvaliacaoRepository extends JpaRepository<Avaliacao, UUID> {
    List<Avaliacao> findByAvaliadoId(UUID avaliadoId);
    List<Avaliacao> findByAvaliadorId(UUID avaliadorId);
    List<Avaliacao> findByPedidoId(UUID pedidoId);
    Optional<Avaliacao> findByPedidoIdAndAvaliadorIdAndTipoAvaliacao(UUID pedidoId, UUID avaliadorId, TipoAvaliacao tipoAvaliacao);
}
