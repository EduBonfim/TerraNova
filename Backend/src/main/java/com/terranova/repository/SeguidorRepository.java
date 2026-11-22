package com.terranova.repository;

import com.terranova.model.Seguidor;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SeguidorRepository extends JpaRepository<Seguidor, UUID> {
    long countByProducerId(UUID producerId);
    List<Seguidor> findByProducerId(UUID producerId);
    List<Seguidor> findByFollowerId(UUID followerId);
    Optional<Seguidor> findByFollowerIdAndProducerId(UUID followerId, UUID producerId);
    boolean existsByFollowerIdAndProducerId(UUID followerId, UUID producerId);
}
