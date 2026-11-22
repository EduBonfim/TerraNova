package com.terranova.repository;

import com.terranova.model.MetricaVendedor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MetricaVendedorRepository extends JpaRepository<MetricaVendedor, UUID> {
    Optional<MetricaVendedor> findByUsuarioIdAndMesAno(UUID usuarioId, LocalDate mesAno);
    List<MetricaVendedor> findByUsuarioIdOrderByMesAnoDesc(UUID usuarioId);
}
