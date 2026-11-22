package com.terranova.repository;

import com.terranova.model.Certificado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CertificadoRepository extends JpaRepository<Certificado, UUID> {
    List<Certificado> findByUsuarioIdOrderByCreatedAtDesc(UUID usuarioId);
    List<Certificado> findByStatusOrderByCreatedAtDesc(String status);
}
