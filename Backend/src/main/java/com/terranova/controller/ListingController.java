package com.terranova.controller;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.terranova.dto.ListingDTO;
import com.terranova.enums.StatusProduto;
import com.terranova.enums.UnidadeMedida;
import com.terranova.model.Categoria;
import com.terranova.model.Certificacao;
import com.terranova.model.Lote;
import com.terranova.model.Produto;
import com.terranova.model.SubCategoria;
import com.terranova.model.Usuario;
import com.terranova.repository.CategoriaRepository;
import com.terranova.repository.CertificacaoRepository;
import com.terranova.repository.LoteRepository;
import com.terranova.repository.SubCategoriaRepository;
import com.terranova.repository.UsuarioRepository;
import com.terranova.service.ProdutoService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.security.Principal;

@RestController
@RequestMapping({ "/api/listings", "/api/v1/listings" })
@Tag(name = "Listings", description = "Compatibilidade com o contrato do app React Native")
public class ListingController {

    private final ProdutoService produtoService;
    private final UsuarioRepository usuarioRepository;
    private final CategoriaRepository categoriaRepository;
    private final SubCategoriaRepository subCategoriaRepository;
    private final CertificacaoRepository certificacaoRepository;
    private final LoteRepository loteRepository;

    public ListingController(ProdutoService produtoService,
            UsuarioRepository usuarioRepository,
            CategoriaRepository categoriaRepository,
            SubCategoriaRepository subCategoriaRepository,
            CertificacaoRepository certificacaoRepository,
            LoteRepository loteRepository) {
        this.produtoService = produtoService;
        this.usuarioRepository = usuarioRepository;
        this.categoriaRepository = categoriaRepository;
        this.subCategoriaRepository = subCategoriaRepository;
        this.certificacaoRepository = certificacaoRepository;
        this.loteRepository = loteRepository;
    }

    @GetMapping
    @Operation(summary = "Listar anúncios compatíveis com o app")
    public ResponseEntity<List<ListingDTO>> listarTodos() {
        return ResponseEntity.ok(
                produtoService.listarTodosAtivos().stream()
                        .map(this::convertToDTO)
                        .collect(Collectors.toList()));
    }

    @GetMapping("/meus")
    @Operation(summary = "Listar apenas meus anúncios (do usuário autenticado)")
    public ResponseEntity<List<ListingDTO>> listarMeus(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String principalName = principal.getName();
        System.out.println("🔍 [DEBUG] Principal.getName() = " + principalName);

        Optional<Usuario> usuarioOpt = usuarioRepository.findByUsernameIgnoreCase(principalName)
                .filter(usuario -> usuario.getDeletedAt() == null);

        if (usuarioOpt.isEmpty()) {
            System.out.println("❌ [DEBUG] Usuário não encontrado ou deletado: " + principalName);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Usuario usuario = usuarioOpt.get();
        System.out.println("✓ [DEBUG] Usuário encontrado: " + usuario.getUsername() + " (ID: " + usuario.getId() + ")");

        List<Produto> produtos = produtoService.listarPorVendedor(usuario.getId());
        System.out.println("📦 [DEBUG] Anúncios encontrados: " + produtos.size());
        produtos.forEach(p -> System.out.println("  - " + p.getNome() + " (deleted_at: " + p.getDeletedAt() + ")"));

        return ResponseEntity.ok(
                produtos.stream()
                        .map(this::convertToDTO)
                        .collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar anúncio por ID")
    public ResponseEntity<ListingDTO> obterPorId(@PathVariable @NonNull UUID id) {
        return produtoService.obterPorId(id)
                .map(produto -> ResponseEntity.ok(convertToDTO(produto)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/vendedor/{username}")
    @Operation(summary = "Listar anúncios de um vendedor")
    public ResponseEntity<List<ListingDTO>> listarPorVendedor(@PathVariable String username) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByUsernameIgnoreCase(username)
                .filter(usuario -> usuario.getDeletedAt() == null);

        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(
                produtoService.listarPorVendedor(usuarioOpt.get().getId()).stream()
                        .map(this::convertToDTO)
                        .collect(Collectors.toList()));
    }

    @PostMapping
    @Operation(summary = "Criar anúncio compatível com React Native")
    public ResponseEntity<ListingDTO> criar(@RequestBody ListingDTO dto, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (isBlank(dto.getTitulo()) || isBlank(dto.getCategoria()) || dto.getQuantidade() == null) {
            return ResponseEntity.badRequest().build();
        }

        // Usar o usuário autenticado, não o que vem do DTO
        Usuario vendedor = usuarioRepository.findByUsernameIgnoreCase(principal.getName())
                .filter(usuario -> usuario.getDeletedAt() == null)
                .orElse(null);

        if (vendedor == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (dto.getTipoCertificacao() != null && "Organico".equalsIgnoreCase(dto.getTipoCertificacao().trim())) {
            if (vendedor.getIsOrganicCertified() == null || !vendedor.getIsOrganicCertified()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }

        Categoria categoria = resolveOrCreateCategoria(dto.getCategoria());
        SubCategoria subCategoria = resolveOrCreateSubCategoria(categoria, dto.getSubcategoria());
        Certificacao certificacao = resolveOrCreateCertificacao(dto.getTipoCertificacao());
        Lote lote = resolveOrCreateLote(dto.getLoteCodigo(), vendedor, dto.getTitulo(), categoria, dto.getQuantidade(),
                dto.getUnidade());

        Produto produto = new Produto();
        produto.setNome(dto.getTitulo().trim());
        produto.setDescricao(trimToNull(dto.getDescricao()));
        produto.setVendedor(vendedor);
        produto.setCategoria(categoria);
        produto.setSubCategoria(subCategoria);
        produto.setLote(lote);
        produto.setCertificacao(certificacao);
        produto.setNumeroRegistro(trimToNull(dto.getNumeroRegistro()));
        produto.setPreco(Boolean.TRUE.equals(dto.getIsDoacao()) ? BigDecimal.ZERO : defaultIfNull(dto.getPreco()));
        produto.setEstoque(dto.getQuantidade());
        produto.setUnidade(resolveUnidade(dto.getUnidade()));
        produto.setFotoUri(trimToNull(dto.getFotoUrl()));
        produto.setStatus(resolveStatus(produto.getEstoque()));
        produto.setDataEsgotado(produto.getEstoque().compareTo(BigDecimal.ZERO) <= 0 ? LocalDateTime.now() : null);
        produto.setCreatedAt(dto.getCriadoEm() != null ? dto.getCriadoEm() : LocalDateTime.now());
        produto.setUpdatedAt(dto.getAtualizadoEm() != null ? dto.getAtualizadoEm() : LocalDateTime.now());

        Produto salvo = produtoService.salvar(produto);
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(salvo));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar anúncio compatível com React Native")
    public ResponseEntity<ListingDTO> atualizar(@PathVariable @NonNull UUID id, @RequestBody ListingDTO dto) {
        Optional<Produto> produtoOpt = produtoService.obterPorId(id);
        if (produtoOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Produto produto = produtoOpt.get();

        if (dto.getTipoCertificacao() != null && "Organico".equalsIgnoreCase(dto.getTipoCertificacao().trim())) {
            if (produto.getVendedor() == null || produto.getVendedor().getIsOrganicCertified() == null
                    || !produto.getVendedor().getIsOrganicCertified()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }

        if (!isBlank(dto.getTitulo())) {
            produto.setNome(dto.getTitulo().trim());
        }
        if (dto.getDescricao() != null) {
            produto.setDescricao(trimToNull(dto.getDescricao()));
        }
        if (!isBlank(dto.getCategoria())) {
            produto.setCategoria(resolveOrCreateCategoria(dto.getCategoria()));
        }
        if (dto.getSubcategoria() != null) {
            produto.setSubCategoria(resolveOrCreateSubCategoria(produto.getCategoria(), dto.getSubcategoria()));
        }
        if (dto.getTipoCertificacao() != null) {
            produto.setCertificacao(resolveOrCreateCertificacao(dto.getTipoCertificacao()));
        }
        if (dto.getLoteCodigo() != null) {
            produto.setLote(resolveOrCreateLote(dto.getLoteCodigo(), produto.getVendedor(), produto.getNome(),
                    produto.getCategoria(), dto.getQuantidade() != null ? dto.getQuantidade() : produto.getEstoque(),
                    dto.getUnidade()));
        }
        if (dto.getQuantidade() != null) {
            produto.setEstoque(dto.getQuantidade());
        }
        if (dto.getPreco() != null) {
            produto.setPreco(Boolean.TRUE.equals(dto.getIsDoacao()) ? BigDecimal.ZERO : dto.getPreco());
        }
        if (dto.getUnidade() != null) {
            produto.setUnidade(resolveUnidade(dto.getUnidade()));
        }
        if (dto.getFotoUrl() != null) {
            produto.setFotoUri(trimToNull(dto.getFotoUrl()));
        }
        if (dto.getNumeroRegistro() != null) {
            produto.setNumeroRegistro(trimToNull(dto.getNumeroRegistro()));
        }
        if (dto.getCriadoEm() != null) {
            produto.setCreatedAt(dto.getCriadoEm());
        }
        if (dto.getAtualizadoEm() != null) {
            produto.setUpdatedAt(dto.getAtualizadoEm());
        } else {
            produto.setUpdatedAt(LocalDateTime.now());
        }
        produto.setStatus(resolveStatus(produto.getEstoque()));
        produto.setDataEsgotado(produto.getEstoque().compareTo(BigDecimal.ZERO) <= 0 ? LocalDateTime.now() : null);

        Produto salvo = produtoService.salvar(produto);
        return ResponseEntity.ok(convertToDTO(salvo));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remover anúncio compatível com React Native")
    public ResponseEntity<Void> deletar(@PathVariable @NonNull UUID id) {
        if (produtoService.obterPorId(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        produtoService.remover(id);
        return ResponseEntity.noContent().build();
    }

    private Categoria resolveOrCreateCategoria(String categoria) {
        String nome = normalizeCategoria(categoria);
        return categoriaRepository.findByNomeIgnoreCase(nome)
                .orElseGet(() -> {
                    Categoria nova = new Categoria();
                    nova.setNome(nome);
                    nova.setDescricao("Categoria criada para integração com o app React Native");
                    return categoriaRepository.save(nova);
                });
    }

    private SubCategoria resolveOrCreateSubCategoria(Categoria categoria, String subcategoria) {
        if (categoria == null || isBlank(subcategoria)) {
            return null;
        }

        return subCategoriaRepository.findByNomeIgnoreCaseAndCategoria_Id(subcategoria.trim(), categoria.getId())
                .orElseGet(() -> {
                    SubCategoria nova = new SubCategoria();
                    nova.setCategoria(categoria);
                    nova.setNome(subcategoria.trim());
                    nova.setDescricao("Subcategoria criada para integração com o app React Native");
                    return subCategoriaRepository.save(nova);
                });
    }

    private Certificacao resolveOrCreateCertificacao(String tipoCertificacao) {
        if (isBlank(tipoCertificacao)) {
            return null;
        }

        String tipo = tipoCertificacao.trim();
        return certificacaoRepository.findByTipoIgnoreCase(tipo)
                .orElseGet(() -> {
                    Certificacao nova = new Certificacao();
                    nova.setTipo(tipo);
                    nova.setDescricao("Certificação criada automaticamente para integração com o app React Native");
                    nova.setRequisitos("Integracao inicial");
                    return certificacaoRepository.save(nova);
                });
    }

    private Lote resolveOrCreateLote(String codigo, Usuario vendedor, String produtoNome, Categoria categoria,
            BigDecimal quantidade, String unidade) {
        if (isBlank(codigo)) {
            return null;
        }

        return loteRepository.findByCodigoIgnoreCase(codigo.trim())
                .map(lote -> updateLote(lote, vendedor, produtoNome, categoria, quantidade, unidade))
                .orElseGet(() -> {
                    Lote lote = new Lote();
                    lote.setCodigo(codigo.trim());
                    lote.setUsuario(vendedor);
                    lote.setProdutoNome(produtoNome);
                    lote.setCategoria(categoria);
                    lote.setQuantidadeTotal(quantidade);
                    lote.setUnidade(unidade);
                    lote.setStatus("ativo");
                    lote.setUpdatedAt(LocalDateTime.now());
                    return loteRepository.save(lote);
                });
    }

    private Lote updateLote(Lote lote, Usuario vendedor, String produtoNome, Categoria categoria, BigDecimal quantidade,
            String unidade) {
        lote.setUsuario(vendedor);
        lote.setProdutoNome(produtoNome);
        lote.setCategoria(categoria);
        lote.setQuantidadeTotal(quantidade);
        lote.setUnidade(unidade);
        lote.setUpdatedAt(LocalDateTime.now());
        return loteRepository.save(lote);
    }

    private ListingDTO convertToDTO(Produto produto) {
        ListingDTO dto = new ListingDTO();
        dto.setId(produto.getId());
        dto.setTitulo(produto.getNome());
        dto.setDescricao(produto.getDescricao());
        dto.setCategoria(productCategoryToListingCategory(produto.getCategoria()));
        dto.setSubcategoria(produto.getSubCategoria() != null ? produto.getSubCategoria().getNome() : null);
        dto.setQuantidade(produto.getEstoque());
        dto.setPreco(produto.getPreco());
        dto.setIsDoacao(produto.getPreco() != null && produto.getPreco().compareTo(BigDecimal.ZERO) == 0);
        dto.setVendedorUsername(produto.getVendedor() != null ? produto.getVendedor().getUsername() : null);
        dto.setVendedorNome(resolveSellerDisplayName(produto.getVendedor()));
        dto.setLoteCodigo(produto.getLote() != null ? produto.getLote().getCodigo() : null);
        dto.setTipoCertificacao(produto.getCertificacao() != null ? produto.getCertificacao().getTipo() : null);
        dto.setNumeroRegistro(produto.getNumeroRegistro());
        dto.setFotoUrl(produto.getFotoUri());
        dto.setUnidade(produto.getUnidade() != null ? produto.getUnidade().getSimbolo() : null);
        dto.setCriadoEm(produto.getCreatedAt());
        dto.setAtualizadoEm(produto.getUpdatedAt());
        dto.setStatus(produto.getStatus() != null ? produto.getStatus().name().toLowerCase(Locale.ROOT) : null);
        return dto;
    }

    private String productCategoryToListingCategory(Categoria categoria) {
        if (categoria == null || isBlank(categoria.getNome())) {
            return null;
        }

        String normalized = categoria.getNome().trim().toLowerCase(Locale.ROOT);
        if (normalized.contains("insumo")) {
            return "insumo";
        }
        if (normalized.contains("colhe")) {
            return "colheita";
        }
        return "mercado";
    }

    private String normalizeCategoria(String categoria) {
        String normalized = categoria.trim().toLowerCase(Locale.ROOT);
        if (normalized.contains("insumo")) {
            return "Insumos";
        }
        if (normalized.contains("colhe")) {
            return "Colheita";
        }
        return "Mercado";
    }

    private UnidadeMedida resolveUnidade(String unidade) {
        if (isBlank(unidade)) {
            return null;
        }

        String value = unidade.trim();
        for (UnidadeMedida medida : UnidadeMedida.values()) {
            if (medida.getSimbolo().equalsIgnoreCase(value) || medida.name().equalsIgnoreCase(value)) {
                return medida;
            }
        }

        try {
            return UnidadeMedida.valueOf(value.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ignored) {
            return null;
        }
    }

    private StatusProduto resolveStatus(BigDecimal estoque) {
        return estoque != null && estoque.compareTo(BigDecimal.ZERO) <= 0 ? StatusProduto.ESGOTADO
                : StatusProduto.ATIVO;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private String resolveSellerDisplayName(Usuario vendedor) {
        if (vendedor == null) {
            return null;
        }

        if (!isBlank(vendedor.getFarmName())) {
            return vendedor.getFarmName().trim();
        }

        if (!isBlank(vendedor.getFullName())) {
            return vendedor.getFullName().trim();
        }

        return vendedor.getUsername();
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private BigDecimal defaultIfNull(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }
}