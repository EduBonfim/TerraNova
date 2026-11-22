package com.terranova.repository;

import com.terranova.model.Produto;
import com.terranova.enums.StatusProduto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, UUID> {
    List<Produto> findByVendedorId(UUID vendedorId);
    List<Produto> findByCategoriaId(UUID categoriaId);
    List<Produto> findByStatusOrderByCreatedAtDesc(StatusProduto status);
    List<Produto> findByVendedorIdAndStatus(UUID vendedorId, StatusProduto status);
}
