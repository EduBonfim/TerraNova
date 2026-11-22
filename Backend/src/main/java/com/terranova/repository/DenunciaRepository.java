package com.terranova.repository;

import com.terranova.model.Denuncia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DenunciaRepository extends JpaRepository<Denuncia, UUID> {
    List<Denuncia> findByStatus(String status);
    List<Denuncia> findByReportedUserId(UUID reportedUserId);
    List<Denuncia> findByReporterId(UUID reporterId);
    List<Denuncia> findByReporterIdOrReportedUserId(UUID reporterId, UUID reportedUserId);
}
