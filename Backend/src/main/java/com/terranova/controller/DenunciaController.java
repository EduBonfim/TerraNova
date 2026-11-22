package com.terranova.controller;

import com.terranova.dto.DenunciaDTO;
import com.terranova.model.Denuncia;
import com.terranova.model.Usuario;
import com.terranova.repository.DenunciaRepository;
import com.terranova.repository.UsuarioRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/denuncias")
@Tag(name = "Denúncias", description = "Gerenciamento de denúncias (Admin)")
public class DenunciaController {

    private final DenunciaRepository denunciaRepository;
    private final UsuarioRepository usuarioRepository;

    public DenunciaController(DenunciaRepository denunciaRepository, UsuarioRepository usuarioRepository) {
        this.denunciaRepository = denunciaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    private boolean isAdmin(Principal principal) {
        if (principal == null) return false;
        return usuarioRepository.findByUsernameIgnoreCase(principal.getName())
                .map(u -> "admin".equalsIgnoreCase(u.getRole()))
                .orElse(false);
    }

    @PostMapping
    @Operation(summary = "Criar nova denúncia")
    public ResponseEntity<DenunciaDTO> criarDenuncia(@RequestBody DenunciaDTO dto, Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();

        Usuario reporter = usuarioRepository.findByUsernameIgnoreCase(principal.getName()).orElse(null);
        Usuario reported = usuarioRepository.findByUsernameIgnoreCase(dto.getReportedUser()).orElse(null);

        if (reporter == null || reported == null) {
            return ResponseEntity.badRequest().build();
        }

        Denuncia denuncia = new Denuncia();
        denuncia.setReporter(reporter);
        denuncia.setReportedUser(reported);
        denuncia.setCategory(dto.getCategory());
        denuncia.setReason(dto.getReason());
        denuncia.setDescription(dto.getDescription());
        denuncia.setEvidenceImageUri(dto.getEvidenceImageUri());
        denuncia.setStatus("pendente");

        denuncia = denunciaRepository.save(denuncia);

        return ResponseEntity.ok(convertToDTO(denuncia));
    }

    @GetMapping
    @Operation(summary = "Listar denúncias (Admin lista todas, usuário comum lista apenas as próprias)")
    public ResponseEntity<List<DenunciaDTO>> listarTodos(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        Usuario usuario = usuarioRepository.findByUsernameIgnoreCase(principal.getName()).orElse(null);
        if (usuario == null) {
            return ResponseEntity.status(401).build();
        }

        List<Denuncia> list;
        if ("admin".equalsIgnoreCase(usuario.getRole())) {
            list = denunciaRepository.findAll();
        } else {
            list = denunciaRepository.findByReporterIdOrReportedUserId(usuario.getId(), usuario.getId());
        }

        List<DenunciaDTO> dtos = list.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Atualizar status da denúncia (Apenas Admin)")
    public ResponseEntity<DenunciaDTO> atualizarStatus(@PathVariable UUID id, @RequestBody DenunciaDTO dto, Principal principal) {
        if (!isAdmin(principal)) {
            return ResponseEntity.status(403).build();
        }

        return denunciaRepository.findById(id).map(denuncia -> {
            if (dto.getStatus() != null) {
                denuncia.setStatus(dto.getStatus());
            }

            if (dto.getAction() != null) {
                denuncia.setActionType(dto.getAction().getType());
                denuncia.setActionDetails(dto.getAction().getDetails());
                denuncia.setBlockDays(dto.getAction().getBlockDays());
            }

            denuncia.setAnalyzedAt(LocalDateTime.now());
            usuarioRepository.findByUsernameIgnoreCase(principal.getName())
                    .ifPresent(denuncia::setAnalyzedBy);

            denuncia = denunciaRepository.save(denuncia);
            return ResponseEntity.ok(convertToDTO(denuncia));
        }).orElse(ResponseEntity.notFound().build());
    }

    private DenunciaDTO convertToDTO(Denuncia denuncia) {
        DenunciaDTO dto = new DenunciaDTO();
        dto.setId(denuncia.getId());
        dto.setReportedUser(denuncia.getReportedUser().getUsername());
        dto.setReporter(denuncia.getReporter().getUsername());
        dto.setCategory(denuncia.getCategory());
        dto.setReason(denuncia.getReason());
        dto.setDescription(denuncia.getDescription());
        dto.setEvidenceImageUri(denuncia.getEvidenceImageUri());
        dto.setStatus(denuncia.getStatus());
        dto.setData(denuncia.getCreatedAt());
        dto.setAnalyzedAt(denuncia.getAnalyzedAt());
        if (denuncia.getAnalyzedBy() != null) {
            dto.setAnalyzedBy(denuncia.getAnalyzedBy().getUsername());
        }

        if (denuncia.getActionType() != null) {
            DenunciaDTO.ActionDTO action = new DenunciaDTO.ActionDTO();
            action.setType(denuncia.getActionType());
            action.setDetails(denuncia.getActionDetails());
            action.setBlockDays(denuncia.getBlockDays());
            dto.setAction(action);
        }

        return dto;
    }
}
