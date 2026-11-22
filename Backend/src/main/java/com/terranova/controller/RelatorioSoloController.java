package com.terranova.controller;

import com.terranova.dto.RelatorioSoloDTO;
import com.terranova.model.RelatorioSolo;
import com.terranova.model.Usuario;
import com.terranova.repository.RelatorioSoloRepository;
import com.terranova.repository.UsuarioRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/relatorios-solo")
@Tag(name = "Relatórios de Solo", description = "Endpoints para laudos e análises de solo")
public class RelatorioSoloController {

    private final RelatorioSoloRepository relatorioSoloRepository;
    private final UsuarioRepository usuarioRepository;

    public RelatorioSoloController(RelatorioSoloRepository relatorioSoloRepository,
                                   UsuarioRepository usuarioRepository) {
        this.relatorioSoloRepository = relatorioSoloRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping("/usuario/{usuarioId}")
    @Operation(summary = "Listar relatórios de solo por usuário")
    public ResponseEntity<List<RelatorioSoloDTO>> listarPorUsuario(@PathVariable @NonNull UUID usuarioId) {
        List<RelatorioSoloDTO> relatorios = relatorioSoloRepository.findByUsuarioIdOrderByDataAnaliseDesc(usuarioId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(relatorios);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar relatório de solo por ID")
    public ResponseEntity<RelatorioSoloDTO> obterPorId(@PathVariable @NonNull UUID id) {
        return relatorioSoloRepository.findById(id)
                .map((@NonNull RelatorioSolo relatorio) -> ResponseEntity.ok(convertToDTO(relatorio)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Criar relatório de solo")
    public ResponseEntity<RelatorioSoloDTO> criar(@RequestBody RelatorioSoloDTO dto) {
        UUID usuarioId = dto.getUsuarioId();
        if (usuarioId == null) {
            return ResponseEntity.badRequest().build();
        }

        Optional<Usuario> usuarioOpt = usuarioRepository.findById(usuarioId)
                .filter(usuario -> usuario.getDeletedAt() == null);
        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        RelatorioSolo relatorio = new RelatorioSolo();
        relatorio.setUsuario(usuarioOpt.get());
        relatorio.setDataAnalise(dto.getDataAnalise() != null ? dto.getDataAnalise() : LocalDate.now());
        relatorio.setImagemUri(trimToNull(dto.getImagemUri()));
        relatorio.setConfianca(dto.getConfianca());
        relatorio.setPh(dto.getPh());
        relatorio.setMateriaOrganica(dto.getMateriaOrganica());
        relatorio.setFosforo(dto.getFosforo());
        relatorio.setPotassio(dto.getPotassio());
        relatorio.setCalcio(dto.getCalcio());
        relatorio.setMagnesio(dto.getMagnesio());
        relatorio.setAluminio(dto.getAluminio());
        relatorio.setCtc(dto.getCtc());
        relatorio.setVBase(dto.getVBase());
        relatorio.setDiagnostico(trimToNull(dto.getDiagnostico()));
        relatorio.setRecomendacoes(trimToNull(dto.getRecomendacoes()));
        relatorio.setCreatedAt(LocalDateTime.now());

        RelatorioSolo salvo = relatorioSoloRepository.save(relatorio);
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(salvo));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar relatório de solo")
    public ResponseEntity<RelatorioSoloDTO> atualizar(@PathVariable @NonNull UUID id, @RequestBody RelatorioSoloDTO dto) {
        return relatorioSoloRepository.findById(id)
                .map((@NonNull RelatorioSolo relatorio) -> {
                    UUID usuarioId = dto.getUsuarioId();
                    if (usuarioId != null) {
                        usuarioRepository.findById(usuarioId)
                                .filter(usuario -> usuario.getDeletedAt() == null)
                                .ifPresent(relatorio::setUsuario);
                    }
                    if (dto.getDataAnalise() != null) {
                        relatorio.setDataAnalise(dto.getDataAnalise());
                    }
                    if (dto.getImagemUri() != null) {
                        relatorio.setImagemUri(trimToNull(dto.getImagemUri()));
                    }
                    if (dto.getConfianca() != null) {
                        relatorio.setConfianca(dto.getConfianca());
                    }
                    if (dto.getPh() != null) {
                        relatorio.setPh(dto.getPh());
                    }
                    if (dto.getMateriaOrganica() != null) {
                        relatorio.setMateriaOrganica(dto.getMateriaOrganica());
                    }
                    if (dto.getFosforo() != null) {
                        relatorio.setFosforo(dto.getFosforo());
                    }
                    if (dto.getPotassio() != null) {
                        relatorio.setPotassio(dto.getPotassio());
                    }
                    if (dto.getCalcio() != null) {
                        relatorio.setCalcio(dto.getCalcio());
                    }
                    if (dto.getMagnesio() != null) {
                        relatorio.setMagnesio(dto.getMagnesio());
                    }
                    if (dto.getAluminio() != null) {
                        relatorio.setAluminio(dto.getAluminio());
                    }
                    if (dto.getCtc() != null) {
                        relatorio.setCtc(dto.getCtc());
                    }
                    if (dto.getVBase() != null) {
                        relatorio.setVBase(dto.getVBase());
                    }
                    if (dto.getDiagnostico() != null) {
                        relatorio.setDiagnostico(trimToNull(dto.getDiagnostico()));
                    }
                    if (dto.getRecomendacoes() != null) {
                        relatorio.setRecomendacoes(trimToNull(dto.getRecomendacoes()));
                    }

                    RelatorioSolo salvo = relatorioSoloRepository.save(relatorio);
                    return ResponseEntity.ok(convertToDTO(salvo));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir relatório de solo")
    public ResponseEntity<Void> deletar(@PathVariable @NonNull UUID id) {
        if (!relatorioSoloRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        relatorioSoloRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private RelatorioSoloDTO convertToDTO(RelatorioSolo relatorio) {
        RelatorioSoloDTO dto = new RelatorioSoloDTO();
        dto.setId(relatorio.getId());
        dto.setUsuarioId(relatorio.getUsuario().getId());
        dto.setUsuarioNome(relatorio.getUsuario().getUsername());
        dto.setDataAnalise(relatorio.getDataAnalise());
        dto.setImagemUri(relatorio.getImagemUri());
        dto.setConfianca(relatorio.getConfianca());
        dto.setPh(relatorio.getPh());
        dto.setMateriaOrganica(relatorio.getMateriaOrganica());
        dto.setFosforo(relatorio.getFosforo());
        dto.setPotassio(relatorio.getPotassio());
        dto.setCalcio(relatorio.getCalcio());
        dto.setMagnesio(relatorio.getMagnesio());
        dto.setAluminio(relatorio.getAluminio());
        dto.setCtc(relatorio.getCtc());
        dto.setVBase(relatorio.getVBase());
        dto.setDiagnostico(relatorio.getDiagnostico());
        dto.setRecomendacoes(relatorio.getRecomendacoes());
        dto.setCreatedAt(relatorio.getCreatedAt());
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
