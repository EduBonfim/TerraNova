package com.terranova.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.terranova.model.SubCategoria;

@Repository
public interface SubCategoriaRepository extends JpaRepository<SubCategoria, UUID> {
    Optional<SubCategoria> findByNomeIgnoreCaseAndCategoria_Id(String nome, UUID categoriaId);
}