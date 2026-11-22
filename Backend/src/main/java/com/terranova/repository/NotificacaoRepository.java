package com.terranova.repository;

import com.terranova.model.Notificacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificacaoRepository extends JpaRepository<Notificacao, UUID> {
    List<Notificacao> findByUsuarioIdOrderByCreatedAtDesc(UUID usuarioId);
    List<Notificacao> findByUsuarioIdAndLidaFalseOrderByCreatedAtDesc(UUID usuarioId);
    long countByUsuarioIdAndLidaFalse(UUID usuarioId);
}
