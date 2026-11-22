package com.terranova.controller;

import com.terranova.dto.AvaliacaoDTO;
import com.terranova.model.Avaliacao;
import com.terranova.repository.AvaliacaoRepository;
import com.terranova.repository.PedidoRepository;
import com.terranova.repository.ProdutoRepository;
import com.terranova.repository.UsuarioRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/avaliacoes")
@Tag(name = "Avaliações", description = "Endpoints para avaliações entre usuários")
public class AvaliacaoController {

    private final AvaliacaoRepository avaliacaoRepository;
    private final UsuarioRepository usuarioRepository;
    private final PedidoRepository pedidoRepository;
    private final ProdutoRepository produtoRepository;

    public AvaliacaoController(AvaliacaoRepository avaliacaoRepository,
                               UsuarioRepository usuarioRepository,
                               PedidoRepository pedidoRepository,
                               ProdutoRepository produtoRepository) {
        this.avaliacaoRepository = avaliacaoRepository;
        this.usuarioRepository = usuarioRepository;
        this.pedidoRepository = pedidoRepository;
        this.produtoRepository = produtoRepository;
    }

    @GetMapping("/avaliado/{avaliadoId}")
    @Operation(summary = "Listar avaliações recebidas por um usuário")
    public ResponseEntity<List<AvaliacaoDTO>> listarPorAvaliado(@PathVariable UUID avaliadoId) {
        List<AvaliacaoDTO> avaliacoes = avaliacaoRepository.findByAvaliadoId(avaliadoId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(avaliacoes);
    }

    @GetMapping("/avaliador/{avaliadorId}")
    @Operation(summary = "Listar avaliações feitas por um usuário")
    public ResponseEntity<List<AvaliacaoDTO>> listarPorAvaliador(@PathVariable UUID avaliadorId) {
        List<AvaliacaoDTO> avaliacoes = avaliacaoRepository.findByAvaliadorId(avaliadorId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(avaliacoes);
    }

    @PostMapping
    @Operation(summary = "Criar nova avaliação")
    public ResponseEntity<AvaliacaoDTO> criar(@RequestBody AvaliacaoDTO dto) {
        if (dto.getAvaliadorId() == null || dto.getAvaliadoId() == null || dto.getNota() == null || dto.getNota() < 1 || dto.getNota() > 5) {
            return ResponseEntity.badRequest().build();
        }

        UUID avaliadorId = Objects.requireNonNull(dto.getAvaliadorId());
        UUID avaliadoId = Objects.requireNonNull(dto.getAvaliadoId());

        // Validação de Auto-interação: Avaliador não pode ser igual ao Avaliado
        if (avaliadorId.equals(avaliadoId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return usuarioRepository.findById(avaliadorId)
                .filter(avaliador -> avaliador.getDeletedAt() == null)
            .flatMap(avaliador -> usuarioRepository.findById(avaliadoId)
                        .filter(avaliado -> avaliado.getDeletedAt() == null)
                        .map(avaliado -> {
                            Avaliacao avaliacao = new Avaliacao();
                            avaliacao.setAvaliador(avaliador);
                            avaliacao.setAvaliado(avaliado);
                            avaliacao.setNota(dto.getNota());
                            avaliacao.setComentario(trimToNull(dto.getComentario()));
                            avaliacao.setCreatedAt(LocalDateTime.now());
                            UUID pedidoId = dto.getPedidoId();
                            if (pedidoId != null) {
                                pedidoRepository.findById(pedidoId).ifPresent(avaliacao::setPedido);
                            }
                            UUID produtoId = dto.getProdutoId();
                            if (produtoId != null) {
                                produtoRepository.findById(produtoId).ifPresent(avaliacao::setProduto);
                            }

                            Avaliacao salva = avaliacaoRepository.save(avaliacao);
                            return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(salva));
                        }))
                .orElse(ResponseEntity.badRequest().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir avaliação")
    public ResponseEntity<Void> excluir(@PathVariable UUID id) {
        UUID avaliacaoId = Objects.requireNonNull(id);
        if (!avaliacaoRepository.existsById(avaliacaoId)) {
            return ResponseEntity.notFound().build();
        }
        avaliacaoRepository.deleteById(avaliacaoId);
        return ResponseEntity.noContent().build();
    }

    private AvaliacaoDTO convertToDTO(Avaliacao avaliacao) {
        AvaliacaoDTO dto = new AvaliacaoDTO();
        dto.setId(avaliacao.getId());
        dto.setAvaliadorId(avaliacao.getAvaliador().getId());
        dto.setAvaliadorNome(avaliacao.getAvaliador().getUsername());
        dto.setAvaliadoId(avaliacao.getAvaliado().getId());
        dto.setAvaliadoNome(avaliacao.getAvaliado().getUsername());
        dto.setPedidoId(avaliacao.getPedido() != null ? avaliacao.getPedido().getId() : null);
        dto.setProdutoId(avaliacao.getProduto() != null ? avaliacao.getProduto().getId() : null);
        dto.setProdutoNome(avaliacao.getProduto() != null ? avaliacao.getProduto().getNome() : null);
        dto.setNota(avaliacao.getNota());
        dto.setComentario(avaliacao.getComentario());
        dto.setCreatedAt(avaliacao.getCreatedAt());
        return dto;
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
