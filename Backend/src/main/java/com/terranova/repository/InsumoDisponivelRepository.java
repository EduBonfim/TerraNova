package com.terranova.repository;

import com.terranova.model.InsumoDisponivel;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface InsumoDisponivelRepository extends JpaRepository<InsumoDisponivel, UUID> {
    List<InsumoDisponivel> findByProducerId(UUID producerId);
}
