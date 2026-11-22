package com.terranova.repository;

import com.terranova.model.Mensagem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface MensagemRepository extends JpaRepository<Mensagem, UUID> {
    List<Mensagem> findByRemetenteIdOrDestinatarioIdOrderByCreatedAtDesc(UUID remetente, UUID destinatario);
    List<Mensagem> findByDestinatarioIdAndLidaFalseOrderByCreatedAtDesc(UUID destinatarioId);
    long countByDestinatarioIdAndLidaFalse(UUID destinatarioId);
    
    void deleteByCreatedAtBefore(LocalDateTime dataLimite);
}
