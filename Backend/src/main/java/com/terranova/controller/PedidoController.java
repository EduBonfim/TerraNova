package com.terranova.controller;

import com.terranova.dto.PedidoDTO;
import com.terranova.model.ItemPedido;
import com.terranova.model.Pedido;
import com.terranova.model.Produto;
import com.terranova.model.Usuario;
import com.terranova.enums.StatusPedido;
import com.terranova.repository.ProdutoRepository;
import com.terranova.repository.UsuarioRepository;
import com.terranova.service.PedidoService;
import com.terranova.service.PedidoStateService;
import com.terranova.service.AvaliacaoStateService;
import com.terranova.dto.CheckoutRequest;
import com.terranova.dto.AvaliacaoDTO;
import com.terranova.model.Avaliacao;
import com.terranova.enums.TipoAvaliacao;
import org.springframework.validation.annotation.Validated;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.security.Principal;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/pedidos")
@Tag(name = "Pedidos", description = "Endpoints para gerenciar pedidos")
@Validated
public class PedidoController {

    private final PedidoService pedidoService;
    private final PedidoStateService pedidoStateService;
    private final AvaliacaoStateService avaliacaoStateService;
    private final UsuarioRepository usuarioRepository;
    private final ProdutoRepository produtoRepository;

    public PedidoController(PedidoService pedidoService,
            PedidoStateService pedidoStateService,
            AvaliacaoStateService avaliacaoStateService,
            UsuarioRepository usuarioRepository,
            ProdutoRepository produtoRepository) {
        this.pedidoService = pedidoService;
        this.pedidoStateService = pedidoStateService;
        this.avaliacaoStateService = avaliacaoStateService;
        this.usuarioRepository = usuarioRepository;
        this.produtoRepository = produtoRepository;
    }

    private boolean isAdmin(Principal principal) {
        if (principal == null)
            return false;
        return usuarioRepository.findByUsernameIgnoreCase(principal.getName())
                .map(u -> "admin".equalsIgnoreCase(u.getRole()))
                .orElse(false);
    }

    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(@RequestBody @Validated CheckoutRequest req) {
        // Valida presença de comprador e vendedor
        if (req.getCompradorId() == null || req.getVendedorId() == null || req.getItems() == null
                || req.getItems().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("code", "INVALID_CHECKOUT", "message", "Dados do pedido incompletos."));
        }

        UUID vendedorId = Objects.requireNonNull(req.getVendedorId());
        UUID compradorId = Objects.requireNonNull(req.getCompradorId());

        var vendedorOpt = usuarioRepository.findById(vendedorId).filter(u -> u.getDeletedAt() == null);
        var compradorOpt = usuarioRepository.findById(compradorId).filter(u -> u.getDeletedAt() == null);
        if (vendedorOpt.isEmpty() || compradorOpt.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("code", "USER_NOT_FOUND", "message", "Comprador ou produtor não encontrado."));
        }

        // Validação de Auto-interação: Comprador não pode ser igual ao Vendedor
        if (vendedorId.equals(compradorId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("code", "SELF_PURCHASE", "message", "O produtor não pode comprar o próprio produto."));
        }

        // validar que todos os produtos existem e pertencem ao vendedor
        BigDecimal pedidoTotal = BigDecimal.ZERO;
        Pedido pedido = new Pedido();
        pedido.setNumeroPedido("VND" + System.currentTimeMillis());
        pedido.setVendedor(vendedorOpt.get());
        pedido.setComprador(compradorOpt.get());
        pedido.setCreatedAt(java.time.LocalDateTime.now());
        pedido.setUpdatedAt(java.time.LocalDateTime.now());

        for (CheckoutRequest.Item it : req.getItems()) {
            // produtoId é opcional: null indica produto avulso (listing local)
            if (it.getProdutoId() == null) {
                // Produto avulso: precisa ao menos do nome
                String nomeAvulso = it.getProdutoNome() != null ? it.getProdutoNome().trim() : "Produto Avulso";
                BigDecimal qtd = it.getQuantidade();
                BigDecimal vu = it.getValorUnitario();
                BigDecimal subtotal = qtd.multiply(vu);
                ItemPedido item = ItemPedido.builder()
                        .pedido(pedido)
                        .produto(null)
                        .produtoNomeAvulso(nomeAvulso)
                        .quantidade(qtd)
                        .precoUnitario(vu)
                        .subtotal(subtotal)
                        .build();
                pedido.getItens().add(item);
                pedidoTotal = pedidoTotal.add(subtotal);
                continue;
            }
            UUID produtoId = it.getProdutoId();
            var prodOpt = produtoRepository.findById(produtoId).filter(p -> p.getDeletedAt() == null);
            if (prodOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("code", "PRODUCT_NOT_FOUND", "message", "Um dos produtos do carrinho não está mais disponível."));
            }
            var prod = prodOpt.get();
            // garante que produto pertence ao vendedor informado
            if (prod.getVendedor() == null || !prod.getVendedor().getId().equals(vendedorId)) {
                return ResponseEntity.status(422)
                        .body(Map.of("code", "SELLER_MISMATCH", "message", "O produto \"" + prod.getNome() + "\" não pertence ao produtor selecionado."));
            }

            // Valida e reduz o estoque
            BigDecimal qtdSolicitada = it.getQuantidade();
            if (prod.getEstoque().compareTo(qtdSolicitada) < 0) {
                String disponivel = prod.getEstoque().stripTrailingZeros().toPlainString();
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of(
                                "code", "INSUFFICIENT_STOCK",
                                "message", "Estoque insuficiente para \"" + prod.getNome() + "\". Disponível no estoque: " + disponivel + "."
                        ));
            }

            prod.setEstoque(prod.getEstoque().subtract(qtdSolicitada));
            if (prod.getEstoque().compareTo(BigDecimal.ZERO) == 0) {
                prod.setStatus(com.terranova.enums.StatusProduto.ESGOTADO);
                prod.setDataEsgotado(java.time.LocalDateTime.now());
            }
            produtoRepository.save(prod);

            ItemPedido item = ItemPedido.builder()
                    .pedido(pedido)
                    .produto(prod)
                    .quantidade(qtdSolicitada)
                    .precoUnitario(it.getValorUnitario())
                    .build();
            pedido.getItens().add(item);
            pedidoTotal = pedidoTotal.add(item.getSubtotal());
        }

        pedido.setValorTotal(pedidoTotal);
        // Usar categoria do primeiro item (todos devem ter a mesma)
        if (!req.getItems().isEmpty()) {
            pedido.setCategoria(req.getItems().get(0).getCategoria());
        }
        pedido.setStatus(StatusPedido.aguardando);
        pedido.setDataPedido(java.time.LocalDateTime.now());

        aplicarDatasPorStatus(pedido);

        Pedido salvo = pedidoService.salvar(pedido);
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(salvo));
    }

    @GetMapping
    @Operation(summary = "Listar todos os pedidos (Apenas Admin)")
    public ResponseEntity<List<PedidoDTO>> listarTodos(java.security.Principal principal) {
        if (!isAdmin(principal)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(
                pedidoService.listarTodos().stream()
                        .flatMap(p -> convertToDTOList(p).stream())
                        .collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar pedido por ID")
    public ResponseEntity<PedidoDTO> obterPorId(@PathVariable UUID id) {
        UUID pedidoId = Objects.requireNonNull(id);
        return pedidoService.obterPorId(pedidoId)
                .map(pedido -> ResponseEntity.ok(convertToDTO(pedido)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/vendedor/{vendedorId}")
    @Operation(summary = "Listar pedidos de um vendedor")
    public ResponseEntity<List<PedidoDTO>> listarPorVendedor(@PathVariable UUID vendedorId) {
        return ResponseEntity.ok(
                pedidoService.listarPorVendedor(vendedorId).stream()
                        .flatMap(p -> convertToDTOList(p).stream())
                        .collect(Collectors.toList()));
    }

    @GetMapping("/comprador/{compradorId}")
    @Operation(summary = "Listar pedidos de um comprador")
    public ResponseEntity<List<PedidoDTO>> listarPorComprador(@PathVariable UUID compradorId) {
        return ResponseEntity.ok(
                pedidoService.listarPorComprador(compradorId).stream()
                        .flatMap(p -> convertToDTOList(p).stream())
                        .collect(Collectors.toList()));
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Listar pedidos por status")
    public ResponseEntity<List<PedidoDTO>> listarPorStatus(@PathVariable String status) {
        return ResponseEntity.ok(
                pedidoService.listarPorStatus(status).stream()
                        .flatMap(p -> convertToDTOList(p).stream())
                        .collect(Collectors.toList()));
    }

    @PostMapping
    @Operation(summary = "Criar novo pedido")
    public ResponseEntity<PedidoDTO> criar(@RequestBody @Valid PedidoDTO dto) {
        if (dto.getVendedorId() == null || dto.getCompradorId() == null || dto.getProdutoId() == null
                || dto.getQuantidade() == null || dto.getValorUnitario() == null) {
            return ResponseEntity.badRequest().build();
        }

        UUID vendedorId = Objects.requireNonNull(dto.getVendedorId());
        UUID compradorId = Objects.requireNonNull(dto.getCompradorId());

        Optional<Usuario> vendedorOpt = usuarioRepository.findById(vendedorId)
                .filter(usuario -> usuario.getDeletedAt() == null);
        Optional<Usuario> compradorOpt = usuarioRepository.findById(compradorId)
                .filter(usuario -> usuario.getDeletedAt() == null);
        UUID produtoId = dto.getProdutoId();
        Optional<Produto> produtoOpt = produtoId != null ? produtoRepository.findById(produtoId) : Optional.empty();

        if (vendedorOpt.isEmpty() || compradorOpt.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        // Validação de Auto-interação: Comprador não pode ser igual ao Vendedor
        if (vendedorId.equals(compradorId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Pedido pedido = new Pedido();
        pedido.setNumeroPedido(dto.getNumeroPedido() != null && !dto.getNumeroPedido().isBlank()
                ? dto.getNumeroPedido().trim()
                : "VND" + System.currentTimeMillis());
        pedido.setVendedor(vendedorOpt.get());
        pedido.setComprador(compradorOpt.get());

        // Sempre calcule o valor total no servidor: quantidade * valorUnitario
        BigDecimal valorTotal = dto.getQuantidade().multiply(dto.getValorUnitario());
        pedido.setValorTotal(valorTotal);

        // Converter status de String para Enum
        StatusPedido status = StatusPedido.aguardando;
        if (dto.getStatus() != null && !dto.getStatus().isBlank()) {
            try {
                status = StatusPedido.valueOf(dto.getStatus().trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                status = StatusPedido.aguardando;
            }
        }
        pedido.setStatus(status);
        pedido.setTransportadora(trimToNull(dto.getTransportadora()));
        pedido.setTrackingNumero(trimToNull(dto.getTrackingNumero()));
        pedido.setEnderecoEntregaCep(trimToNull(dto.getEnderecoEntregaCep()));
        pedido.setEnderecoEntregaStreet(trimToNull(dto.getEnderecoEntregaStreet()));
        pedido.setEnderecoEntregaNumber(trimToNull(dto.getEnderecoEntregaNumber()));
        pedido.setEnderecoEntregaNeighborhood(trimToNull(dto.getEnderecoEntregaNeighborhood()));
        pedido.setEnderecoEntregaCity(trimToNull(dto.getEnderecoEntregaCity()));
        pedido.setEnderecoEntregaState(trimToNull(dto.getEnderecoEntregaState()));
        pedido.setEnderecoEntregaComplement(trimToNull(dto.getEnderecoEntregaComplement()));
        pedido.setObservacoes(trimToNull(dto.getObservacoes()));
        pedido.setDataPedido(dto.getDataPedido() != null ? dto.getDataPedido() : LocalDateTime.now());
        pedido.setDataConfirmacao(dto.getDataConfirmacao());
        pedido.setDataEnvio(dto.getDataEnvio());
        pedido.setDataEntrega(dto.getDataEntrega());
        pedido.setUpdatedAt(LocalDateTime.now());

        ItemPedido item = buildItemPedido(pedido, produtoOpt.get(), dto.getQuantidade(), dto.getValorUnitario(),
                valorTotal);
        pedido.getItens().add(item);

        aplicarDatasPorStatus(pedido);

        Pedido salvo = pedidoService.salvar(pedido);
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(salvo));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar pedido")
    public ResponseEntity<PedidoDTO> atualizar(@PathVariable UUID id, @RequestBody @Valid PedidoDTO dto) {
        UUID pedidoId = Objects.requireNonNull(id);
        return pedidoService.obterPorId(pedidoId)
                .map(pedido -> {
                    if (dto.getNumeroPedido() != null && !dto.getNumeroPedido().isBlank()) {
                        pedido.setNumeroPedido(dto.getNumeroPedido().trim());
                    }
                    if (dto.getVendedorId() != null) {
                        UUID vendedorId = Objects.requireNonNull(dto.getVendedorId());
                        usuarioRepository.findById(vendedorId)
                                .filter(usuario -> usuario.getDeletedAt() == null)
                                .ifPresent(pedido::setVendedor);
                    }
                    if (dto.getCompradorId() != null) {
                        UUID compradorId = Objects.requireNonNull(dto.getCompradorId());
                        usuarioRepository.findById(compradorId)
                                .filter(usuario -> usuario.getDeletedAt() == null)
                                .ifPresent(pedido::setComprador);
                    }
                    if (dto.getProdutoId() != null) {
                        UUID produtoId = Objects.requireNonNull(dto.getProdutoId());
                        produtoRepository.findById(produtoId)
                                .ifPresent(produto -> ensurePrimaryItem(pedido).setProduto(produto));
                    }
                    if (dto.getQuantidade() != null) {
                        ensurePrimaryItem(pedido).setQuantidade(dto.getQuantidade());
                    }
                    if (dto.getValorUnitario() != null) {
                        ensurePrimaryItem(pedido).setPrecoUnitario(dto.getValorUnitario());
                    }
                    // Recalcula sempre o valor total a partir do item principal (quantidade * precoUnitario)
                    if (!pedido.getItens().isEmpty() && pedido.getItens().get(0).getQuantidade() != null
                            && pedido.getItens().get(0).getPrecoUnitario() != null) {
                        pedido.setValorTotal(pedido.getItens().get(0).getQuantidade()
                                .multiply(pedido.getItens().get(0).getPrecoUnitario()));
                    }
                    if (dto.getStatus() != null && !dto.getStatus().isBlank()) {
                        try {
                            pedido.setStatus(StatusPedido.valueOf(dto.getStatus().trim().toUpperCase()));
                        } catch (IllegalArgumentException e) {
                            // Manter status atual se conversão falhar
                        }
                    }
                    if (dto.getTransportadora() != null) {
                        pedido.setTransportadora(trimToNull(dto.getTransportadora()));
                    }
                    if (dto.getTrackingNumero() != null) {
                        pedido.setTrackingNumero(trimToNull(dto.getTrackingNumero()));
                    }
                    if (dto.getEnderecoEntregaCep() != null) {
                        pedido.setEnderecoEntregaCep(trimToNull(dto.getEnderecoEntregaCep()));
                    }
                    if (dto.getEnderecoEntregaStreet() != null) {
                        pedido.setEnderecoEntregaStreet(trimToNull(dto.getEnderecoEntregaStreet()));
                    }
                    if (dto.getEnderecoEntregaNumber() != null) {
                        pedido.setEnderecoEntregaNumber(trimToNull(dto.getEnderecoEntregaNumber()));
                    }
                    if (dto.getEnderecoEntregaNeighborhood() != null) {
                        pedido.setEnderecoEntregaNeighborhood(trimToNull(dto.getEnderecoEntregaNeighborhood()));
                    }
                    if (dto.getEnderecoEntregaCity() != null) {
                        pedido.setEnderecoEntregaCity(trimToNull(dto.getEnderecoEntregaCity()));
                    }
                    if (dto.getEnderecoEntregaState() != null) {
                        pedido.setEnderecoEntregaState(trimToNull(dto.getEnderecoEntregaState()));
                    }
                    if (dto.getEnderecoEntregaComplement() != null) {
                        pedido.setEnderecoEntregaComplement(trimToNull(dto.getEnderecoEntregaComplement()));
                    }
                    if (dto.getObservacoes() != null) {
                        pedido.setObservacoes(trimToNull(dto.getObservacoes()));
                    }
                    if (dto.getDataPedido() != null) {
                        pedido.setDataPedido(dto.getDataPedido());
                    }
                    if (dto.getDataConfirmacao() != null) {
                        pedido.setDataConfirmacao(dto.getDataConfirmacao());
                    }
                    if (dto.getDataEnvio() != null) {
                        pedido.setDataEnvio(dto.getDataEnvio());
                    }
                    if (dto.getDataEntrega() != null) {
                        pedido.setDataEntrega(dto.getDataEntrega());
                    }

                    aplicarDatasPorStatus(pedido);
                    pedido.setUpdatedAt(LocalDateTime.now());
                    Pedido salvo = pedidoService.salvar(pedido);
                    return ResponseEntity.ok(convertToDTO(salvo));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/confirmar-envio")
    @Operation(summary = "Confirmar envio do pedido (Vendedor)")
    public ResponseEntity<?> confirmarEnvio(@PathVariable UUID id, Principal principal) {
        try {
            UUID vendedorId = usuarioRepository.findByUsernameIgnoreCase(principal.getName())
                    .map(Usuario::getId)
                    .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

            Pedido pedidoAtualizado = pedidoStateService.confirmarEnvio(id, vendedorId);
            return ResponseEntity.ok(convertToDTO(pedidoAtualizado));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("erro", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("erro", "Erro ao atualizar status: " + e.getMessage()));
        }
    }

    @PostMapping("/{id}/confirmar-recebimento")
    @Operation(summary = "Confirmar recebimento do pedido (Comprador)")
    public ResponseEntity<?> confirmarRecebimento(@PathVariable UUID id, Principal principal) {
        try {
            UUID compradorId = usuarioRepository.findByUsernameIgnoreCase(principal.getName())
                    .map(Usuario::getId)
                    .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

            Pedido pedidoAtualizado = pedidoStateService.confirmarRecebimento(id, compradorId);
            return ResponseEntity.ok(convertToDTO(pedidoAtualizado));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("erro", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("erro", "Erro ao atualizar status: " + e.getMessage()));
        }
    }

    @PostMapping("/{id}/cancelar")
    @Operation(summary = "Cancelar pedido (Comprador)")
    public ResponseEntity<?> cancelarPedido(@PathVariable UUID id, Principal principal,
            @RequestParam(required = false) String motivo) {
        try {
            UUID compradorId = usuarioRepository.findByUsernameIgnoreCase(principal.getName())
                    .map(Usuario::getId)
                    .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

            Pedido pedidoAtualizado = pedidoStateService.cancelarPedido(id, compradorId, motivo);
            return ResponseEntity.ok(convertToDTO(pedidoAtualizado));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("erro", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("erro", "Erro ao cancelar pedido: " + e.getMessage()));
        }
    }

    @PostMapping("/{id}/avaliacoes/comprador")
    @Operation(summary = "Comprador avalia Produtor (Vendedor)")
    public ResponseEntity<?> criarAvaliacaoComprador(@PathVariable UUID id, Principal principal,
            @RequestBody Map<String, Object> body) {
        try {
            UUID compradorId = usuarioRepository.findByUsernameIgnoreCase(principal.getName())
                    .map(Usuario::getId)
                    .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

            Integer nota = ((Number) body.get("nota")).intValue();
            String comentario = (String) body.get("comentario");

            var avaliacao = avaliacaoStateService.avaliacaoCompradorParaProduto(id, compradorId, nota, comentario);
            return ResponseEntity.ok(convertToDTO(avaliacao));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("erro", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("erro", "Erro ao criar avaliação: " + e.getMessage()));
        }
    }

    @PostMapping("/{id}/avaliacoes/produtor")
    @Operation(summary = "Produtor (Vendedor) avalia Comprador")
    public ResponseEntity<?> criarAvaliacaoProdutor(@PathVariable UUID id, Principal principal,
            @RequestBody Map<String, Object> body) {
        try {
            UUID vendedorId = usuarioRepository.findByUsernameIgnoreCase(principal.getName())
                    .map(Usuario::getId)
                    .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

            Integer nota = ((Number) body.get("nota")).intValue();
            String comentario = (String) body.get("comentario");

            var avaliacao = avaliacaoStateService.avaliacaoProdutoParaComprador(id, vendedorId, nota, comentario);
            return ResponseEntity.ok(convertToDTO(avaliacao));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("erro", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("erro", "Erro ao criar avaliação: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}/avaliacoes")
    @Operation(summary = "Obter avaliações do pedido")
    public ResponseEntity<?> obterAvaliacoesPedido(@PathVariable UUID id) {
        try {
            var avaliacoes = avaliacaoStateService.obterAvaliacoesDoPedido(id);
            List<AvaliacaoDTO> dtos = avaliacoes.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("erro", "Erro ao obter avaliações: " + e.getMessage()));
        }
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private PedidoDTO convertToDTO(Pedido pedido) {
        ItemPedido item = pedido.getItens().isEmpty() ? null : pedido.getItens().get(0);
        return buildDTO(pedido, item);
    }

    private List<PedidoDTO> convertToDTOList(Pedido pedido) {
        if (pedido.getItens().isEmpty()) {
            return Collections.singletonList(buildDTO(pedido, null));
        }
        return pedido.getItens().stream()
                .map(item -> buildDTO(pedido, item))
                .collect(Collectors.toList());
    }

    private PedidoDTO buildDTO(Pedido pedido, ItemPedido item) {
        PedidoDTO dto = new PedidoDTO();
        dto.setId(pedido.getId());
        dto.setNumeroPedido(pedido.getNumeroPedido());
        dto.setVendedorId(pedido.getVendedor().getId());
        dto.setVendedorNome(pedido.getVendedor().getUsername());
        dto.setCompradorId(pedido.getComprador().getId());
        dto.setCompradorNome(pedido.getComprador().getUsername());
        dto.setProdutoId(item != null && item.getProduto() != null ? item.getProduto().getId() : null);
        dto.setProdutoNome(item != null ? item.getNomeEfetivo() : null);
        dto.setQuantidade(item != null ? item.getQuantidade() : null);
        dto.setValorUnitario(item != null ? item.getPrecoUnitario() : null);
        dto.setValorTotal(item != null && item.getQuantidade() != null && item.getPrecoUnitario() != null
                ? item.getQuantidade().multiply(item.getPrecoUnitario())
                : pedido.getValorTotal());
        dto.setStatus(pedido.getStatus() != null ? pedido.getStatus().name() : null);
        
        String categoriaNome = null;
        if (item != null && item.getProduto() != null && item.getProduto().getCategoria() != null) {
            categoriaNome = item.getProduto().getCategoria().getNome();
        } else {
            categoriaNome = pedido.getCategoria();
        }
        dto.setCategoria(categoriaNome);
        dto.setTransportadora(pedido.getTransportadora());
        dto.setTrackingNumero(pedido.getTrackingNumero());
        dto.setEnderecoEntregaCep(pedido.getEnderecoEntregaCep());
        dto.setEnderecoEntregaStreet(pedido.getEnderecoEntregaStreet());
        dto.setEnderecoEntregaNumber(pedido.getEnderecoEntregaNumber());
        dto.setEnderecoEntregaNeighborhood(pedido.getEnderecoEntregaNeighborhood());
        dto.setEnderecoEntregaCity(pedido.getEnderecoEntregaCity());
        dto.setEnderecoEntregaState(pedido.getEnderecoEntregaState());
        dto.setEnderecoEntregaComplement(pedido.getEnderecoEntregaComplement());
        dto.setObservacoes(pedido.getObservacoes());
        dto.setDataPedido(pedido.getDataPedido());
        dto.setDataEnvio(pedido.getDataEnvio());
        dto.setDataEntrega(pedido.getDataEntrega());

        List<Avaliacao> avaliacoes = avaliacaoStateService.obterAvaliacoesDoPedido(pedido.getId());
        boolean compradorAvaliou = false;
        boolean vendedorAvaliou = false;
        if (avaliacoes != null) {
            for (Avaliacao av : avaliacoes) {
                if (av.getTipoAvaliacao() == TipoAvaliacao.COMPRADOR_AVALIA_PRODUTOR) {
                    compradorAvaliou = true;
                } else if (av.getTipoAvaliacao() == TipoAvaliacao.PRODUTOR_AVALIA_COMPRADOR) {
                    vendedorAvaliou = true;
                }
            }
        }
        dto.setCompradorAvaliou(compradorAvaliou);
        dto.setVendedorAvaliou(vendedorAvaliou);

        return dto;
    }

    private ItemPedido buildItemPedido(Pedido pedido, Produto produto, BigDecimal quantidade, BigDecimal precoUnitario,
            BigDecimal subtotal) {
        ItemPedido item = new ItemPedido();
        item.setPedido(pedido);
        item.setProduto(produto);
        item.setQuantidade(quantidade);
        item.setPrecoUnitario(precoUnitario);
        item.setSubtotal(subtotal);
        return item;
    }

    private ItemPedido ensurePrimaryItem(Pedido pedido) {
        if (pedido.getItens().isEmpty()) {
            ItemPedido item = new ItemPedido();
            item.setPedido(pedido);
            pedido.getItens().add(item);
            return item;
        }
        return pedido.getItens().get(0);
    }

    private AvaliacaoDTO convertToDTO(Avaliacao avaliacao) {
        if (avaliacao == null) return null;
        AvaliacaoDTO dto = new AvaliacaoDTO();
        dto.setId(avaliacao.getId());
        dto.setAvaliadorId(avaliacao.getAvaliador() != null ? avaliacao.getAvaliador().getId() : null);
        dto.setAvaliadorNome(avaliacao.getAvaliador() != null ? avaliacao.getAvaliador().getUsername() : null);
        dto.setAvaliadoId(avaliacao.getAvaliado() != null ? avaliacao.getAvaliado().getId() : null);
        dto.setAvaliadoNome(avaliacao.getAvaliado() != null ? avaliacao.getAvaliado().getUsername() : null);
        dto.setPedidoId(avaliacao.getPedido() != null ? avaliacao.getPedido().getId() : null);
        dto.setProdutoId(avaliacao.getProduto() != null ? avaliacao.getProduto().getId() : null);
        dto.setProdutoNome(avaliacao.getProduto() != null ? avaliacao.getProduto().getNome() : null);
        dto.setNota(avaliacao.getNota());
        dto.setComentario(avaliacao.getComentario());
        dto.setTipoAvaliacao(avaliacao.getTipoAvaliacao());
        dto.setCreatedAt(avaliacao.getCreatedAt());
        return dto;
    }

    private void aplicarDatasPorStatus(Pedido pedido) {
        StatusPedido status = pedido.getStatus();
        LocalDateTime agora = LocalDateTime.now();

        if (status == StatusPedido.aguardando) {
            if (pedido.getDataPedido() == null) {
                pedido.setDataPedido(agora);
            }
        } else if (status == StatusPedido.transporte) {
            if (pedido.getDataConfirmacao() == null) {
                pedido.setDataConfirmacao(agora);
            }
            if (pedido.getDataEnvio() == null) {
                pedido.setDataEnvio(agora);
            }
        } else if (status == StatusPedido.finalizado) {
            if (pedido.getDataConfirmacao() == null) {
                pedido.setDataConfirmacao(agora);
            }
            if (pedido.getDataEnvio() == null) {
                pedido.setDataEnvio(agora);
            }
            if (pedido.getDataEntrega() == null) {
                pedido.setDataEntrega(agora);
            }
        }
    }
}
