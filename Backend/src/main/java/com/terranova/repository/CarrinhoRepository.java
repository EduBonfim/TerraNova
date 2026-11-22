package com.terranova.repository;

import com.terranova.model.Carrinho;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CarrinhoRepository extends JpaRepository<Carrinho, UUID> {
    List<Carrinho> findByCompradorId(UUID compradorId);
    Optional<Carrinho> findByCompradorIdAndProdutoId(UUID compradorId, UUID produtoId);
    void deleteByCompradorId(UUID compradorId);
    void deleteByCompradorIdAndProdutoId(UUID compradorId, UUID produtoId);
}
