package com.terranova.service;

import com.terranova.model.Produto;
import com.terranova.enums.StatusProduto;
import com.terranova.repository.ProdutoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ProdutoService {

    private static final Logger log = LoggerFactory.getLogger(ProdutoService.class);

    private final ProdutoRepository produtoRepository;

    public ProdutoService(ProdutoRepository produtoRepository) {
        this.produtoRepository = produtoRepository;
    }

    /**
     * Lista apenas produtos que nao foram removidos logicamente.
     */
    public List<Produto> listarTodosAtivos() {
        return produtoRepository.findAll().stream()
                .filter(produto -> produto.getDeletedAt() == null)
                .toList();
    }

    /**
     * Busca um produto por id, desconsiderando registros removidos logicamente.
     */
    public Optional<Produto> obterPorId(UUID id) {
        return produtoRepository.findById(id)
                .filter(produto -> produto.getDeletedAt() == null);
    }

    /**
     * Lista os produtos de um vendedor e aplica o filtro de exclusao logica.
     */
    public List<Produto> listarPorVendedor(UUID vendedorId) {
        log.debug("Buscando produtos para vendedor {}", vendedorId);
        List<Produto> todosDoVendedor = produtoRepository.findByVendedorId(vendedorId);
        log.debug("Total de produtos encontrados no banco: {}", todosDoVendedor.size());
        
        List<Produto> ativos = todosDoVendedor.stream()
                .filter(produto -> produto.getDeletedAt() == null)
                .toList();
        log.debug("Total de produtos apos filtro de exclusao logica: {}", ativos.size());
        return ativos;
    }

    /**
     * Lista produtos de uma categoria, mantendo apenas os ativos logicamente.
     */
    public List<Produto> listarPorCategoria(UUID categoriaId) {
        return produtoRepository.findByCategoriaId(categoriaId).stream()
                .filter(produto -> produto.getDeletedAt() == null)
                .toList();
    }

    /**
     * Filtra produtos por status textual, retornando lista vazia quando o status e invalido.
     */
    public List<Produto> listarPorStatus(String status) {
        try {
            StatusProduto statusEnum = StatusProduto.valueOf(status.toUpperCase());
            return produtoRepository.findByStatusOrderByCreatedAtDesc(statusEnum).stream()
                    .filter(produto -> produto.getDeletedAt() == null)
                    .toList();
        } catch (IllegalArgumentException e) {
            return List.of(); 
        }
    }

    public Produto salvar(Produto produto) {
        return produtoRepository.save(produto);
    }

    /**
     * Aplica exclusao logica ao produto e o torna inativo.
     */
    public void remover(UUID id) {
        produtoRepository.findById(id)
                .filter(produto -> produto.getDeletedAt() == null)
                .ifPresent(produto -> {
                    produto.setDeletedAt(java.time.LocalDateTime.now());
                    produto.setUpdatedAt(java.time.LocalDateTime.now());
                    produto.setStatus(StatusProduto.INATIVO);
                    produtoRepository.save(produto);
                });
    }
}