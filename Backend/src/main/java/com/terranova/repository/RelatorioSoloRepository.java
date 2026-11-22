package com.terranova.repository;

import com.terranova.model.RelatorioSolo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RelatorioSoloRepository extends JpaRepository<RelatorioSolo, UUID> {
    List<RelatorioSolo> findByUsuarioIdOrderByDataAnaliseDesc(UUID usuarioId);
}
