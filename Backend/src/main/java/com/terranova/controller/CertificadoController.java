package com.terranova.controller;

import com.terranova.dto.CertificadoDTO;
import com.terranova.model.Certificacao;
import com.terranova.model.Certificado;
import com.terranova.model.Usuario;
import com.terranova.repository.CertificacaoRepository;
import com.terranova.repository.CertificadoRepository;
import com.terranova.repository.UsuarioRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/certificados")
@Tag(name = "Certificados", description = "Endpoints para gerenciamento de certificados de produtores")
public class CertificadoController {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final CertificadoRepository certificadoRepository;
    private final UsuarioRepository usuarioRepository;
    private final CertificacaoRepository certificacaoRepository;

    public CertificadoController(CertificadoRepository certificadoRepository,
                                 UsuarioRepository usuarioRepository,
                                 CertificacaoRepository certificacaoRepository) {
        this.certificadoRepository = certificadoRepository;
        this.usuarioRepository = usuarioRepository;
        this.certificacaoRepository = certificacaoRepository;
    }

    @GetMapping("/usuario/{usuarioId}")
    @Operation(summary = "Listar certificados por usuário")
    public ResponseEntity<List<CertificadoDTO>> listarPorUsuario(@PathVariable @NonNull UUID usuarioId) {
        List<CertificadoDTO> certificados = certificadoRepository.findByUsuarioIdOrderByCreatedAtDesc(usuarioId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(certificados);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar certificado por ID")
    public ResponseEntity<CertificadoDTO> obterPorId(@PathVariable @NonNull UUID id) {
        return certificadoRepository.findById(id)
                .map(certificado -> ResponseEntity.ok(convertToDTO(certificado)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Adicionar um novo certificado")
    public ResponseEntity<?> criar(@RequestBody CertificadoDTO dto) {
        if (dto.getUsuarioId() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "usuarioId é obrigatório"));
        }

        Optional<Usuario> usuarioOpt = usuarioRepository.findById(dto.getUsuarioId())
                .filter(u -> u.getDeletedAt() == null);
        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Usuário não encontrado ou inativo"));
        }

        Certificacao certificacao = null;
        if (dto.getTipoCertificacaoId() != null) {
            certificacao = certificacaoRepository.findById(dto.getTipoCertificacaoId()).orElse(null);
        }
        if (certificacao == null && dto.getTipoCertificacaoNome() != null && !dto.getTipoCertificacaoNome().isBlank()) {
            certificacao = certificacaoRepository.findByTipoIgnoreCase(dto.getTipoCertificacaoNome().trim()).orElse(null);
        }
        if (certificacao == null) {
            // Fallback padrão para Orgânico
            certificacao = certificacaoRepository.findByTipoIgnoreCase("Organico")
                    .orElseGet(() -> {
                        Certificacao nova = new Certificacao();
                        nova.setTipo("Organico");
                        nova.setDescricao("Certificação orgânica padrão");
                        nova.setRequisitos("Documento oficial");
                        return certificacaoRepository.save(nova);
                    });
        }

        Certificado certificado = new Certificado();
        certificado.setUsuario(usuarioOpt.get());
        certificado.setTipoCertificacao(certificacao);
        certificado.setTitulo(dto.getTitulo() != null ? dto.getTitulo().trim() : "Certificado MAPA");
        certificado.setEmissor(dto.getEmissor() != null ? dto.getEmissor().trim() : "Ministério da Agricultura");
        certificado.setNumeroRegistro(dto.getNumeroRegistro() != null ? dto.getNumeroRegistro().trim() : "");
        certificado.setUrlDocumento(dto.getUrlDocumento() != null ? dto.getUrlDocumento().trim() : "");
        certificado.setStatus(dto.getStatus() != null && !dto.getStatus().isBlank() ? dto.getStatus().trim() : "em_analise");
        certificado.setNotas(dto.getNotas() != null ? dto.getNotas().trim() : "");

        try {
            if (dto.getDataEmissao() != null && !dto.getDataEmissao().isBlank()) {
                certificado.setDataEmissao(LocalDate.parse(dto.getDataEmissao().trim(), DATE_FORMATTER));
            }
            if (dto.getDataVencimento() != null && !dto.getDataVencimento().isBlank()) {
                certificado.setDataVencimento(LocalDate.parse(dto.getDataVencimento().trim(), DATE_FORMATTER));
            }
        } catch (DateTimeParseException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Data inválida. Use o formato dd/MM/yyyy"));
        }

        certificado.setCreatedAt(LocalDateTime.now());
        certificado.setUpdatedAt(LocalDateTime.now());

        Certificado salvo = certificadoRepository.save(certificado);
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(salvo));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Atualizar status do certificado (Aprovação Admin)")
    public ResponseEntity<?> atualizarStatus(@PathVariable @NonNull UUID id, @RequestBody Map<String, String> body) {
        String novoStatus = body.get("status");
        if (novoStatus == null || novoStatus.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "status é obrigatório"));
        }

        return certificadoRepository.findById(id)
                .map(certificado -> {
                    certificado.setStatus(novoStatus.trim().toLowerCase());
                    certificado.setUpdatedAt(LocalDateTime.now());

                    // Auto-Aprovação Orgânica: Se o certificado de Orgânico for validado
                    if ("valido".equalsIgnoreCase(certificado.getStatus()) &&
                        "organico".equalsIgnoreCase(certificado.getTipoCertificacao().getTipo())) {
                        Usuario usuario = certificado.getUsuario();
                        usuario.setIsOrganicCertified(true);
                        usuario.setMapaRegistrationNumber(certificado.getNumeroRegistro());
                        usuarioRepository.save(usuario);
                    }

                    Certificado salvo = certificadoRepository.save(certificado);
                    return ResponseEntity.ok(convertToDTO(salvo));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remover certificado")
    public ResponseEntity<Void> deletar(@PathVariable @NonNull UUID id) {
        if (!certificadoRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        certificadoRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private CertificadoDTO convertToDTO(Certificado certificado) {
        CertificadoDTO dto = new CertificadoDTO();
        dto.setId(certificado.getId());
        dto.setUsuarioId(certificado.getUsuario().getId());
        dto.setUsuarioNome(certificado.getUsuario().getUsername());
        dto.setTipoCertificacaoId(certificado.getTipoCertificacao().getId());
        dto.setTipoCertificacaoNome(certificado.getTipoCertificacao().getTipo());
        dto.setTitulo(certificado.getTitulo());
        dto.setEmissor(certificado.getEmissor());
        dto.setNumeroRegistro(certificado.getNumeroRegistro());
        dto.setDataEmissao(certificado.getDataEmissao() != null ? certificado.getDataEmissao().format(DATE_FORMATTER) : "");
        dto.setDataVencimento(certificado.getDataVencimento() != null ? certificado.getDataVencimento().format(DATE_FORMATTER) : "");
        dto.setUrlDocumento(certificado.getUrlDocumento());
        dto.setStatus(certificado.getStatus());
        dto.setNotas(certificado.getNotas());
        dto.setCreatedAt(certificado.getCreatedAt());
        dto.setUpdatedAt(certificado.getUpdatedAt());
        return dto;
    }
}
