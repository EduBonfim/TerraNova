package com.terranova.repository;

import com.terranova.model.Certificacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CertificacaoRepository extends JpaRepository<Certificacao, UUID> {
    Optional<Certificacao> findByTipoIgnoreCase(String tipo);
}