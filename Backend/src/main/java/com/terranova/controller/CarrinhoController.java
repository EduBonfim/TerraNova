package com.terranova.controller;

import com.terranova.dto.CarrinhoDTO;
import com.terranova.model.Carrinho;
import com.terranova.model.Produto;
import com.terranova.model.Usuario;
import com.terranova.repository.CarrinhoRepository;
import com.terranova.repository.ProdutoRepository;
import com.terranova.repository.UsuarioRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/carrinho")
@Tag(name = "Carrinho", description = "Endpoints para carrinho do comprador")
public class CarrinhoController {

    private final CarrinhoRepository carrinhoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProdutoRepository produtoRepository;

    public CarrinhoController(CarrinhoRepository carrinhoRepository,
                              UsuarioRepository usuarioRepository,
                              ProdutoRepository produtoRepository) {
        this.carrinhoRepository = carrinhoRepository;
        this.usuarioRepository = usuarioRepository;
        this.produtoRepository = produtoRepository;
    }

    @GetMapping("/comprador/{compradorId}")
    @Operation(summary = "Listar itens do carrinho por comprador")
    public ResponseEntity<List<CarrinhoDTO>> listarPorComprador(@PathVariable UUID compradorId) {
        List<CarrinhoDTO> itens = carrinhoRepository.findByCompradorId(compradorId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(itens);
    }

    @PostMapping
    @Operation(summary = "Adicionar item ao carrinho")
    public ResponseEntity<CarrinhoDTO> adicionar(@RequestBody @Valid CarrinhoDTO dto) {
        if (dto.getCompradorId() == null || dto.getProdutoId() == null || dto.getQuantidade() == null || dto.getQuantidade().compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.badRequest().build();
        }

        UUID compradorId = Objects.requireNonNull(dto.getCompradorId());
        UUID produtoId = Objects.requireNonNull(dto.getProdutoId());

        Optional<Usuario> compradorOpt = usuarioRepository.findById(compradorId)
                .filter(usuario -> usuario.getDeletedAt() == null);
        Optional<Produto> produtoOpt = produtoRepository.findById(produtoId)
                .filter(produto -> produto.getDeletedAt() == null);

        if (compradorOpt.isEmpty() || produtoOpt.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Carrinho item = carrinhoRepository.findByCompradorIdAndProdutoId(compradorId, produtoId)
                .orElseGet(Carrinho::new);

        item.setComprador(compradorOpt.get());
        item.setProduto(produtoOpt.get());
        item.setQuantidade(dto.getQuantidade());
        item.setPrecoUnitario(dto.getPrecoUnitario() != null ? dto.getPrecoUnitario() : produtoOpt.get().getPreco());
        item.setDataAdicao(LocalDateTime.now());

        Carrinho salvo = carrinhoRepository.save(item);
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(salvo));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar item do carrinho")
    public ResponseEntity<CarrinhoDTO> atualizar(@PathVariable UUID id, @RequestBody @Valid CarrinhoDTO dto) {
        UUID carrinhoId = Objects.requireNonNull(id);
        return carrinhoRepository.findById(carrinhoId)
                .map(item -> {
                    if (dto.getQuantidade() != null) {
                        item.setQuantidade(dto.getQuantidade());
                    }
                    if (dto.getPrecoUnitario() != null) {
                        item.setPrecoUnitario(dto.getPrecoUnitario());
                    }
                    item.setDataAdicao(LocalDateTime.now());
                    Carrinho salvo = carrinhoRepository.save(item);
                    return ResponseEntity.ok(convertToDTO(salvo));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remover item do carrinho")
    public ResponseEntity<Void> removerItem(@PathVariable UUID id) {
        UUID carrinhoId = Objects.requireNonNull(id);
        if (!carrinhoRepository.existsById(carrinhoId)) {
            return ResponseEntity.notFound().build();
        }
        carrinhoRepository.deleteById(carrinhoId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/comprador/{compradorId}")
    @Operation(summary = "Limpar carrinho de um comprador")
    public ResponseEntity<Void> limparCarrinho(@PathVariable UUID compradorId) {
        carrinhoRepository.deleteByCompradorId(compradorId);
        return ResponseEntity.noContent().build();
    }

    private CarrinhoDTO convertToDTO(Carrinho item) {
        CarrinhoDTO dto = new CarrinhoDTO();
        dto.setId(item.getId());
        dto.setCompradorId(item.getComprador().getId());
        dto.setCompradorNome(item.getComprador().getUsername());
        dto.setProdutoId(item.getProduto().getId());
        dto.setProdutoNome(item.getProduto().getNome());
        dto.setQuantidade(item.getQuantidade());
        dto.setPrecoUnitario(item.getPrecoUnitario());
        BigDecimal subtotal = item.getQuantidade().multiply(item.getPrecoUnitario());
        dto.setSubtotal(subtotal);
        dto.setDataAdicao(item.getDataAdicao());
        return dto;
    }
}
