package com.terranova.controller;

import com.terranova.dto.ProdutoDTO;
import com.terranova.model.Categoria;
import com.terranova.model.Produto;
import com.terranova.model.Usuario;
import com.terranova.enums.StatusProduto;
import com.terranova.enums.UnidadeMedida;
import com.terranova.repository.CategoriaRepository;
import com.terranova.repository.UsuarioRepository;
import com.terranova.service.ProdutoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/produtos")
@Tag(name = "Produtos", description = "Endpoints para gerenciar produtos")
public class ProdutoController {

    private final ProdutoService produtoService;
    private final UsuarioRepository usuarioRepository;
    private final CategoriaRepository categoriaRepository;

    public ProdutoController(ProdutoService produtoService,
                             UsuarioRepository usuarioRepository,
                             CategoriaRepository categoriaRepository) {
        this.produtoService = produtoService;
        this.usuarioRepository = usuarioRepository;
        this.categoriaRepository = categoriaRepository;
    }

    @GetMapping
    @Operation(summary = "Listar todos os produtos")
    public ResponseEntity<List<ProdutoDTO>> listarTodos() {
        return ResponseEntity.ok(
            produtoService.listarTodosAtivos().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList())
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar produto por ID")
    public ResponseEntity<ProdutoDTO> obterPorId(@PathVariable @NonNull UUID id) {
        return produtoService.obterPorId(id)
            .map(produto -> ResponseEntity.ok(convertToDTO(produto)))
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/vendedor/{vendedorId}")
    @Operation(summary = "Listar produtos de um vendedor")
    public ResponseEntity<List<ProdutoDTO>> listarPorVendedor(@PathVariable @NonNull UUID vendedorId) {
        return ResponseEntity.ok(
            produtoService.listarPorVendedor(vendedorId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList())
        );
    }

    @GetMapping("/categoria/{categoriaId}")
    @Operation(summary = "Listar produtos por categoria")
    public ResponseEntity<List<ProdutoDTO>> listarPorCategoria(@PathVariable @NonNull UUID categoriaId) {
        return ResponseEntity.ok(
            produtoService.listarPorCategoria(categoriaId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList())
        );
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Listar produtos por status")
    public ResponseEntity<List<ProdutoDTO>> listarPorStatus(@PathVariable String status) {
        return ResponseEntity.ok(
            produtoService.listarPorStatus(status).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList())
        );
    }

    @PostMapping
    @Operation(summary = "Criar novo produto")
    public ResponseEntity<ProdutoDTO> criar(@RequestBody @Valid ProdutoDTO dto) {
        if (dto.getVendedorId() == null || dto.getCategoriaId() == null || dto.getNome() == null || dto.getNome().isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        UUID vendedorId = Objects.requireNonNull(dto.getVendedorId());
        UUID categoriaId = Objects.requireNonNull(dto.getCategoriaId());

        Optional<Usuario> vendedorOpt = usuarioRepository.findById(vendedorId)
                .filter(usuario -> usuario.getDeletedAt() == null);
        Optional<Categoria> categoriaOpt = categoriaRepository.findById(categoriaId);

        if (vendedorOpt.isEmpty() || categoriaOpt.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        // Validação de Certificação Orgânica (Opcional por enquanto na v1 sem DTO forte, mas prevenida se houver campo correspondente futuro).
        // NOTA: Como ProdutoDTO nao tem getTipoCertificacao explicitamente, essa validação atua na entidade Produto via DTO estendido no futuro.

        Produto produto = new Produto();
        produto.setNome(dto.getNome().trim());
        produto.setDescricao(trimToNull(dto.getDescricao()));
        produto.setVendedor(vendedorOpt.get());
        produto.setCategoria(categoriaOpt.get());
        produto.setPreco(dto.getPreco() != null ? dto.getPreco() : java.math.BigDecimal.ZERO);
        produto.setEstoque(dto.getEstoque() != null ? dto.getEstoque() : java.math.BigDecimal.ZERO);
        produto.setUnidade(detectUnidade(dto.getUnidade(), dto.getNome()));
        produto.setFotoUri(trimToNull(dto.getFotoUri()));
        produto.setStatus(resolveStatus(dto.getStatus(), produto.getEstoque()));
        produto.setDataEsgotado(produto.getEstoque().compareTo(java.math.BigDecimal.ZERO) <= 0 ? LocalDateTime.now() : null);
        produto.setCreatedAt(LocalDateTime.now());
        produto.setUpdatedAt(LocalDateTime.now());

        Produto salvo = produtoService.salvar(produto);
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(salvo));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar produto")
    public ResponseEntity<ProdutoDTO> atualizar(@PathVariable @NonNull UUID id, @RequestBody @Valid ProdutoDTO dto) {
        return produtoService.obterPorId(id)
            .map(produto -> {
                if (dto.getNome() != null && !dto.getNome().isBlank()) {
                    produto.setNome(dto.getNome().trim());
                }
                if (dto.getDescricao() != null) {
                    produto.setDescricao(trimToNull(dto.getDescricao()));
                }
                if (dto.getVendedorId() != null) {
                    UUID vendedorId = Objects.requireNonNull(dto.getVendedorId());
                    usuarioRepository.findById(vendedorId)
                            .filter(usuario -> usuario.getDeletedAt() == null)
                            .ifPresent(produto::setVendedor);
                }
                if (dto.getCategoriaId() != null) {
                    UUID categoriaId = Objects.requireNonNull(dto.getCategoriaId());
                    categoriaRepository.findById(categoriaId).ifPresent(produto::setCategoria);
                }
                if (dto.getPreco() != null) {
                    produto.setPreco(dto.getPreco());
                }
                if (dto.getEstoque() != null) {
                    produto.setEstoque(dto.getEstoque());
                    if (dto.getEstoque().compareTo(java.math.BigDecimal.ZERO) <= 0) {
                        produto.setDataEsgotado(LocalDateTime.now());
                        if (dto.getStatus() == null || dto.getStatus().isBlank()) {
                            produto.setStatus(StatusProduto.ESGOTADO);
                        }
                    }
                }
                if (dto.getUnidade() != null || dto.getNome() != null) {
                    produto.setUnidade(detectUnidade(dto.getUnidade(), dto.getNome()));
                }
                if (dto.getFotoUri() != null) {
                    produto.setFotoUri(trimToNull(dto.getFotoUri()));
                }
                if (dto.getStatus() != null && !dto.getStatus().isBlank()) {
                    produto.setStatus(resolveStatus(dto.getStatus(), produto.getEstoque()));
                }

                produto.setUpdatedAt(LocalDateTime.now());
                Produto salvo = produtoService.salvar(produto);
                return ResponseEntity.ok(convertToDTO(salvo));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deletar produto (soft delete)")
    public ResponseEntity<Void> deletar(@PathVariable @NonNull UUID id) {
        if (produtoService.obterPorId(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        produtoService.remover(id);
        return ResponseEntity.noContent().build();
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private StatusProduto resolveStatus(String status, java.math.BigDecimal estoque) {
        if (status != null && !status.isBlank()) {
            try {
                return StatusProduto.valueOf(status.trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                // Se inválido, continua com lógica padrão
            }
        }
        if (estoque != null && estoque.compareTo(java.math.BigDecimal.ZERO) <= 0) {
            return StatusProduto.ESGOTADO;
        }
        return StatusProduto.ATIVO;
    }

    /**
     * Detecta a unidade a partir do campo `unidade` (se fornecido) ou do texto do título/nome.
     * Aceita tanto o nome do enum (QUILOGRAMA, UNIDADE, etc.) quanto símbolos como "kg", "L", "un", "cx".
     */
    private UnidadeMedida detectUnidade(String unidade, String nome) {
        // 1) tentativa por campo explícito
        if (unidade != null && !unidade.isBlank()) {
            String u = unidade.trim();
            // aceita símbolo ou nome do enum
            for (UnidadeMedida um : UnidadeMedida.values()) {
                if (um.getSimbolo().equalsIgnoreCase(u) || um.name().equalsIgnoreCase(u)) {
                    return um;
                }
            }
            try {
                return UnidadeMedida.valueOf(u.toUpperCase());
            } catch (IllegalArgumentException ignored) {
            }
        }

        // 2) tentativa por título/nome (procura padrões comuns: "12unid", "caix"12 unid", a", "kg", "L", "dz"...)
        if (nome != null && !nome.isBlank()) {
            String lower = nome.toLowerCase();
            // símbolos e palavras-chave
            if (lower.matches(".*\\b(kg|quilograma|quilograma)\\b.*")) return UnidadeMedida.QUILOGRAMA;
            if (lower.matches(".*\\b(g|grama)\\b.*")) return UnidadeMedida.GRAMA;
            if (lower.matches(".*\\b(l|litro)\\b.*")) return UnidadeMedida.LITRO;
            if (lower.matches(".*\\b(ml|mililitro)\\b.*")) return UnidadeMedida.MILILITRO;
            if (lower.matches(".*\\b(caixa|cx)\\b.*")) return UnidadeMedida.CAIXA;
            if (lower.matches(".*\\b(dz|duzia|dúzia)\\b.*")) return UnidadeMedida.DUZIA;
            if (lower.matches(".*\\b(saco|sc)\\b.*")) return UnidadeMedida.SACO;
            // procura por "un", "unid", "unidades"
            if (lower.matches(".*\\b(unid|unidades|un)\\b.*")) return UnidadeMedida.UNIDADE;

            // procura por padrões como "12unid" ou "12 unid" para inferir UNIDADE
            if (lower.matches(".*\\b\\d+\\s*(unid|un|unidades)\\b.*")) return UnidadeMedida.UNIDADE;
            // padrão: se tiver número seguido por "kg"/"g"/"l" etc.
            if (lower.matches(".*\\b\\d+\\s*(kg|g|l|ml|cx|dz|un)\\b.*")) {
                if (lower.contains("kg")) return UnidadeMedida.QUILOGRAMA;
                if (lower.contains(" g") || lower.contains("g")) return UnidadeMedida.GRAMA;
                if (lower.contains(" l") || lower.contains("l")) return UnidadeMedida.LITRO;
                if (lower.contains("ml")) return UnidadeMedida.MILILITRO;
                if (lower.contains("cx") || lower.contains("caixa")) return UnidadeMedida.CAIXA;
                if (lower.contains("dz") || lower.contains("duzia")) return UnidadeMedida.DUZIA;
                if (lower.contains("un") || lower.contains("unid")) return UnidadeMedida.UNIDADE;
            }
        }

        // fallback padrão
        return UnidadeMedida.UNIDADE;
    }

    private ProdutoDTO convertToDTO(Produto produto) {
        ProdutoDTO dto = new ProdutoDTO();
        dto.setId(produto.getId());
        dto.setNome(produto.getNome());
        dto.setDescricao(produto.getDescricao());
        dto.setVendedorId(produto.getVendedor().getId());
        dto.setVendedorNome(produto.getVendedor().getUsername());
        dto.setCategoriaId(produto.getCategoria().getId());
        dto.setCategoriaNome(produto.getCategoria().getNome());
        dto.setPreco(produto.getPreco());
        dto.setEstoque(produto.getEstoque());
        dto.setUnidade(produto.getUnidade() != null ? produto.getUnidade().getSimbolo() : null);
        dto.setFotoUri(produto.getFotoUri());
        dto.setStatus(produto.getStatus() != null ? produto.getStatus().name().toLowerCase() : null);
        dto.setCreatedAt(produto.getCreatedAt());
        return dto;
    }

}
