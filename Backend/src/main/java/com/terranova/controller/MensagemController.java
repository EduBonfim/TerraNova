package com.terranova.controller;

import com.terranova.dto.MensagemDTO;
import com.terranova.model.Mensagem;
import com.terranova.model.Usuario;
import com.terranova.repository.MensagemRepository;
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
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/mensagens")
@Tag(name = "Mensagens", description = "Endpoints para chat e mensagens")
public class MensagemController {

    private final MensagemRepository mensagemRepository;
    private final UsuarioRepository usuarioRepository;
    private final PedidoRepository pedidoRepository;
    private final ProdutoRepository produtoRepository;

    public MensagemController(MensagemRepository mensagemRepository,
                              UsuarioRepository usuarioRepository,
                              PedidoRepository pedidoRepository,
                              ProdutoRepository produtoRepository) {
        this.mensagemRepository = mensagemRepository;
        this.usuarioRepository = usuarioRepository;
        this.pedidoRepository = pedidoRepository;
        this.produtoRepository = produtoRepository;
    }

    @GetMapping("/conversa")
    @Operation(summary = "Listar conversa entre dois usuários")
    public ResponseEntity<List<MensagemDTO>> listarConversa(@RequestParam UUID usuarioId,
                                                            @RequestParam UUID contatoId) {
        List<MensagemDTO> mensagens = mensagemRepository
                .findByRemetenteIdOrDestinatarioIdOrderByCreatedAtDesc(usuarioId, usuarioId)
                .stream()
                .filter(msg -> pertenceConversa(msg, usuarioId, contatoId))
                .filter(msg -> {
                    if (msg.getRemetente().getId().equals(usuarioId)) {
                        return !Boolean.TRUE.equals(msg.getOcultaPorRemetente());
                    } else {
                        return !Boolean.TRUE.equals(msg.getOcultaPorDestinatario());
                    }
                })
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(mensagens);
    }

    @GetMapping("/usuario/{usuarioId}")
    @Operation(summary = "Listar todas as mensagens não ocultas de um usuário")
    public ResponseEntity<List<MensagemDTO>> listarTodasMensagens(@PathVariable UUID usuarioId) {
        List<MensagemDTO> mensagens = mensagemRepository
                .findByRemetenteIdOrDestinatarioIdOrderByCreatedAtDesc(usuarioId, usuarioId)
                .stream()
                .filter(msg -> {
                    if (msg.getRemetente().getId().equals(usuarioId)) {
                        return !Boolean.TRUE.equals(msg.getOcultaPorRemetente());
                    } else {
                        return !Boolean.TRUE.equals(msg.getOcultaPorDestinatario());
                    }
                })
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(mensagens);
    }

    @DeleteMapping("/conversa/{contatoId}")
    @Operation(summary = "Ocultar todas as mensagens de uma conversa para um usuário")
    public ResponseEntity<Void> ocultarConversa(@PathVariable UUID contatoId, @RequestParam UUID usuarioId) {
        List<Mensagem> mensagens = mensagemRepository
                .findByRemetenteIdOrDestinatarioIdOrderByCreatedAtDesc(usuarioId, usuarioId)
                .stream()
                .filter(msg -> pertenceConversa(msg, usuarioId, contatoId))
                .collect(Collectors.toList());

        for (Mensagem msg : mensagens) {
            if (msg.getRemetente().getId().equals(usuarioId)) {
                msg.setOcultaPorRemetente(true);
            } else {
                msg.setOcultaPorDestinatario(true);
            }
        }
        
        mensagemRepository.saveAll(mensagens);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/usuario/{usuarioId}/nao-lidas")
    @Operation(summary = "Listar mensagens não lidas de um usuário")
    public ResponseEntity<List<MensagemDTO>> listarNaoLidas(@PathVariable UUID usuarioId) {
        List<MensagemDTO> mensagens = mensagemRepository.findByDestinatarioIdAndLidaFalseOrderByCreatedAtDesc(usuarioId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(mensagens);
    }

    @GetMapping("/usuario/{usuarioId}/nao-lidas-count")
    @Operation(summary = "Contar mensagens não lidas")
    public ResponseEntity<Long> contarNaoLidas(@PathVariable UUID usuarioId) {
        return ResponseEntity.ok(mensagemRepository.countByDestinatarioIdAndLidaFalse(usuarioId));
    }

    @PostMapping
    @Operation(summary = "Enviar mensagem")
    public ResponseEntity<MensagemDTO> enviar(@RequestBody MensagemDTO dto) {
        if (dto.getRemetenteId() == null || dto.getDestinatarioId() == null || dto.getConteudo() == null || dto.getConteudo().isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        UUID remetenteId = Objects.requireNonNull(dto.getRemetenteId());
        UUID destinatarioId = Objects.requireNonNull(dto.getDestinatarioId());

        Optional<Usuario> remetenteOpt = usuarioRepository.findById(remetenteId)
                .filter(usuario -> usuario.getDeletedAt() == null);
        Optional<Usuario> destinatarioOpt = usuarioRepository.findById(destinatarioId)
                .filter(usuario -> usuario.getDeletedAt() == null);

        if (remetenteOpt.isEmpty() || destinatarioOpt.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        // Validação de Auto-interação: Remetente não pode ser igual ao Destinatário
        if (remetenteId.equals(destinatarioId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Mensagem mensagem = new Mensagem();
        mensagem.setRemetente(remetenteOpt.get());
        mensagem.setDestinatario(destinatarioOpt.get());
        mensagem.setAssunto(trimToNull(dto.getAssunto()));
        mensagem.setConteudo(dto.getConteudo().trim());
        mensagem.setLida(Boolean.FALSE);
        mensagem.setCreatedAt(LocalDateTime.now());

        UUID pedidoId = dto.getPedidoId();
        if (pedidoId != null) {
            pedidoRepository.findById(pedidoId).ifPresent(mensagem::setPedido);
        }
        UUID produtoId = dto.getProdutoId();
        if (produtoId != null) {
            produtoRepository.findById(produtoId).ifPresent(mensagem::setProduto);
        }

        Mensagem salva = mensagemRepository.save(mensagem);
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(salva));
    }

    @PutMapping("/{id}/marcar-como-lida")
    @Operation(summary = "Marcar mensagem como lida")
    public ResponseEntity<MensagemDTO> marcarComoLida(@PathVariable UUID id) {
        UUID mensagemId = Objects.requireNonNull(id);
        return mensagemRepository.findById(mensagemId)
                .map(mensagem -> {
                    mensagem.setLida(true);
                    mensagem.setLidaEm(LocalDateTime.now());
                    Mensagem salva = mensagemRepository.save(mensagem);
                    return ResponseEntity.ok(convertToDTO(salva));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir mensagem")
    public ResponseEntity<Void> excluir(@PathVariable UUID id) {
        UUID mensagemId = Objects.requireNonNull(id);
        if (!mensagemRepository.existsById(mensagemId)) {
            return ResponseEntity.notFound().build();
        }
        mensagemRepository.deleteById(mensagemId);
        return ResponseEntity.noContent().build();
    }

    private boolean pertenceConversa(Mensagem msg, UUID usuarioId, UUID contatoId) {
        UUID remetenteId = msg.getRemetente().getId();
        UUID destinatarioId = msg.getDestinatario().getId();

        return (remetenteId.equals(usuarioId) && destinatarioId.equals(contatoId))
                || (remetenteId.equals(contatoId) && destinatarioId.equals(usuarioId));
    }

    private MensagemDTO convertToDTO(Mensagem mensagem) {
        MensagemDTO dto = new MensagemDTO();
        dto.setId(mensagem.getId());
        dto.setRemetenteId(mensagem.getRemetente().getId());
        dto.setRemetenteNome(mensagem.getRemetente().getUsername());
        dto.setDestinatarioId(mensagem.getDestinatario().getId());
        dto.setDestinatarioNome(mensagem.getDestinatario().getUsername());
        dto.setAssunto(mensagem.getAssunto());
        dto.setConteudo(mensagem.getConteudo());
        dto.setLida(mensagem.getLida());
        dto.setLidaEm(mensagem.getLidaEm());
        dto.setPedidoId(mensagem.getPedido() != null ? mensagem.getPedido().getId() : null);
        dto.setProdutoId(mensagem.getProduto() != null ? mensagem.getProduto().getId() : null);
        dto.setCreatedAt(mensagem.getCreatedAt());
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
