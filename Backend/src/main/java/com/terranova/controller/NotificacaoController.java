package com.terranova.controller;

import com.terranova.dto.NotificacaoDTO;
import com.terranova.model.Notificacao;
import com.terranova.repository.NotificacaoRepository;
import com.terranova.repository.UsuarioRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/notificacoes")
@Tag(name = "Notificações", description = "Endpoints para gerenciar notificações")
public class NotificacaoController {

    private final NotificacaoRepository notificacaoRepository;
    private final UsuarioRepository usuarioRepository;

    public NotificacaoController(NotificacaoRepository notificacaoRepository,
                                 UsuarioRepository usuarioRepository) {
        this.notificacaoRepository = notificacaoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping("/usuario/{usuarioId}")
    @Operation(summary = "Listar notificações de um usuário")
    public ResponseEntity<List<NotificacaoDTO>> listarPorUsuario(@PathVariable UUID usuarioId) {
        return ResponseEntity.ok(
            notificacaoRepository.findByUsuarioIdOrderByCreatedAtDesc(usuarioId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList())
        );
    }

    @GetMapping("/usuario/{usuarioId}/nao-lidas")
    @Operation(summary = "Listar notificações não lidas de um usuário")
    public ResponseEntity<List<NotificacaoDTO>> listarNaoLidas(@PathVariable UUID usuarioId) {
        return ResponseEntity.ok(
            notificacaoRepository.findByUsuarioIdAndLidaFalseOrderByCreatedAtDesc(usuarioId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList())
        );
    }

    @GetMapping("/usuario/{usuarioId}/nao-lidas-count")
    @Operation(summary = "Contar notificações não lidas")
    public ResponseEntity<Long> contarNaoLidas(@PathVariable UUID usuarioId) {
        return ResponseEntity.ok(notificacaoRepository.countByUsuarioIdAndLidaFalse(usuarioId));
    }

    @PostMapping
    @Operation(summary = "Criar nova notificação")
    public ResponseEntity<NotificacaoDTO> criar(@RequestBody NotificacaoDTO dto) {
        UUID usuarioId = dto.getUsuarioId();
        if (usuarioId == null || dto.getTitulo() == null || dto.getTitulo().isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        return usuarioRepository.findById(usuarioId)
            .filter(usuario -> usuario.getDeletedAt() == null)
            .map(usuario -> {
                Notificacao notificacao = new Notificacao();
                notificacao.setUsuario(usuario);
                notificacao.setTitulo(dto.getTitulo().trim());
                notificacao.setDescricao(trimToNull(dto.getDescricao()));
                notificacao.setCategoria(trimToNull(dto.getCategoria()));
                notificacao.setRota(trimToNull(dto.getRota()));
                notificacao.setLida(dto.getLida() != null ? dto.getLida() : Boolean.FALSE);
                notificacao.setCreatedAt(LocalDateTime.now());
                if (Boolean.TRUE.equals(notificacao.getLida())) {
                    notificacao.setLidaEm(LocalDateTime.now());
                }

                Notificacao salva = notificacaoRepository.save(notificacao);
                return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(salva));
            })
            .orElse(ResponseEntity.badRequest().build());
    }

    @PutMapping("/{id}/marcar-como-lida")
    @Operation(summary = "Marcar notificação como lida")
    public ResponseEntity<NotificacaoDTO> marcarComoLida(@PathVariable @NonNull UUID id) {
        return notificacaoRepository.findById(id)
            .map(notificacao -> {
                notificacao.setLida(true);
                notificacao.setLidaEm(LocalDateTime.now());
                Notificacao salva = notificacaoRepository.save(notificacao);
                return ResponseEntity.ok(convertToDTO(salva));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deletar notificação")
    public ResponseEntity<Void> deletar(@PathVariable @NonNull UUID id) {
        if (!notificacaoRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        notificacaoRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private NotificacaoDTO convertToDTO(Notificacao notificacao) {
        NotificacaoDTO dto = new NotificacaoDTO();
        dto.setId(notificacao.getId());
        dto.setUsuarioId(notificacao.getUsuario().getId());
        dto.setTitulo(notificacao.getTitulo());
        dto.setDescricao(notificacao.getDescricao());
        dto.setCategoria(notificacao.getCategoria());
        dto.setRota(notificacao.getRota());
        dto.setLida(notificacao.getLida());
        dto.setCriadoEm(notificacao.getCreatedAt());
        return dto;
    }

}
