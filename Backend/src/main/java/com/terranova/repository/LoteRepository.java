package com.terranova.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.terranova.model.Lote;

@Repository
public interface LoteRepository extends JpaRepository<Lote, UUID> {
    Optional<Lote> findByCodigoIgnoreCase(String codigo);
}