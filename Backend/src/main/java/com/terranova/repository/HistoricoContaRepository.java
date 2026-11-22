package com.terranova.repository;

import com.terranova.model.HistoricoConta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface HistoricoContaRepository extends JpaRepository<HistoricoConta, UUID> {
    Optional<HistoricoConta> findByCpf(String cpf);
    Optional<HistoricoConta> findByEmail(String email);
}
