package com.terranova.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.terranova.dto.AvaliacaoDTO;
import com.terranova.dto.InsumoDTO;
import com.terranova.dto.ListingDTO;
import com.terranova.dto.UsuarioDTO;
import com.terranova.dto.UsuarioPublicoDTO;
import com.terranova.model.Avaliacao;
import com.terranova.model.Produto;
import com.terranova.model.Usuario;
import com.terranova.repository.AvaliacaoRepository;
import com.terranova.repository.InsumoDisponivelRepository;
import com.terranova.repository.MetricaVendedorRepository;
import com.terranova.repository.ProdutoRepository;
import com.terranova.service.UsuarioService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/v1/usuarios")
@Tag(name = "Usuários", description = "Endpoints para gerenciar usuários")
public class UsuarioController {

    private static final String DEFAULT_TERMS_VERSION = "2026.10";
    private static final String DEFAULT_PRIVACY_VERSION = "2026.04";
    private static final int MAX_VERSION_LENGTH = 20;

    public static class AceiteLegalRequest {
        public Boolean acceptTerms;
        public String termsVersion;
        public Boolean acceptLgpd;
        public String privacyVersion;
    }

    private final UsuarioService usuarioService;
    private final PasswordEncoder passwordEncoder;
    private final ProdutoRepository produtoRepository;
    private final InsumoDisponivelRepository insumoDisponivelRepository;
    private final MetricaVendedorRepository metricaVendedorRepository;
    private final AvaliacaoRepository avaliacaoRepository;

    public UsuarioController(UsuarioService usuarioService, 
                            PasswordEncoder passwordEncoder,
                            ProdutoRepository produtoRepository,
                            InsumoDisponivelRepository insumoDisponivelRepository,
                            MetricaVendedorRepository metricaVendedorRepository,
                            AvaliacaoRepository avaliacaoRepository) {
        this.usuarioService = usuarioService;
        this.passwordEncoder = passwordEncoder;
        this.produtoRepository = produtoRepository;
        this.insumoDisponivelRepository = insumoDisponivelRepository;
        this.metricaVendedorRepository = metricaVendedorRepository;
        this.avaliacaoRepository = avaliacaoRepository;
    }

    private UsuarioPublicoDTO convertToPublicDTO(Usuario usuario) {
        UsuarioPublicoDTO dto = new UsuarioPublicoDTO();
        dto.setId(usuario.getId());
        dto.setUsername(usuario.getUsername());
        dto.setFullName(usuario.getFullName());
        dto.setRole(usuario.getRole());
        dto.setAvatarUri(usuario.getAvatarUri());
        dto.setFarmName(usuario.getFarmName());
        dto.setBio(usuario.getBio());
        dto.setGender(usuario.getGender());
        dto.setAddressStreet(usuario.getAddressStreet());
        dto.setAddressNumber(usuario.getAddressNumber());
        dto.setAddressNeighborhood(usuario.getAddressNeighborhood());
        dto.setAddressCity(usuario.getAddressCity());
        dto.setAddressState(usuario.getAddressState());
        dto.setFarmAddressReference(usuario.getFarmAddressReference());
        dto.setGateLatitude(usuario.getGateLatitude());
        dto.setGateLongitude(usuario.getGateLongitude());
        dto.setIsCepValidated(usuario.getIsCepValidated());
        dto.setIsGatePinConfirmed(usuario.getIsGatePinConfirmed());
        dto.setLocationValidatedAt(usuario.getLocationValidatedAt());
        dto.setProducerRole(usuario.getProducerRole());
        dto.setFarmPhotos(usuario.getFarmPhotos());
        dto.setBlockMessages(usuario.getBlockMessages());
        dto.setIsOrganicCertified(usuario.getIsOrganicCertified());
        dto.setMapaRegistrationNumber(usuario.getMapaRegistrationNumber());

        // Popular Listas (Listings, Insumos, Metricas)
        if ("producer".equalsIgnoreCase(usuario.getRole())) {
            List<ListingDTO> listings = produtoRepository.findByVendedorId(usuario.getId()).stream()
                .map(this::convertProdutoToListingDTO)
                .collect(Collectors.toList());
            dto.setListings(listings);

            List<InsumoDTO> insumos = insumoDisponivelRepository.findByProducerId(usuario.getId()).stream()
                .map(insumo -> new InsumoDTO(insumo.getId(), insumo.getTitle(), insumo.getAmount()))
                .collect(Collectors.toList());
            dto.setInsumos(insumos);

            List<AvaliacaoDTO> reviews = avaliacaoRepository.findByAvaliadoId(usuario.getId()).stream()
                .map(this::convertAvaliacaoToDTO)
                .collect(Collectors.toList());
            dto.setReviews(reviews);

            Double media = metricaVendedorRepository.findByUsuarioIdOrderByMesAnoDesc(usuario.getId()).stream()
                .findFirst()
                .map(m -> m.getMediaNota() != null ? m.getMediaNota().doubleValue() : 0.0)
                .orElse(0.0);
            dto.setMediaNota(media);
        }

        return dto;
    }

    @GetMapping
    @Operation(summary = "Listar todos os usuários (Público)")
    public ResponseEntity<List<UsuarioPublicoDTO>> listarTodos() {
        List<UsuarioPublicoDTO> usuarios = usuarioService.listarTodos().stream()
                .map(usuario -> convertToPublicDTO(usuario))
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(usuarios);
    }

    @GetMapping("/deletados")
    @Operation(summary = "Listar usuários excluídos (soft delete)")
    public ResponseEntity<List<UsuarioDTO>> listarDeletados() {
        List<UsuarioDTO> usuarios = usuarioService.obterTodosIncluindoDeletados().stream()
                .filter(usuario -> usuario.getDeletedAt() != null)
                .map(usuario -> convertToDTO(usuario))
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(usuarios);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar usuário por ID")
    public ResponseEntity<UsuarioDTO> obterPorId(@PathVariable @NonNull UUID id) {
        return usuarioService.obterPorId(id)
            .map(usuario -> ResponseEntity.ok(convertToDTO(usuario)))
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/username/{username}")
    @Operation(summary = "Buscar usuário por username")
    public ResponseEntity<Object> obterPorUsername(@PathVariable String username, java.security.Principal principal) {
        return usuarioService.obterPorUsername(username)
            .map(usuario -> {
                boolean isOwner = principal != null && principal.getName().equals(usuario.getUsername());
                if (isOwner) {
                    return ResponseEntity.ok((Object) convertToDTO(usuario));
                } else {
                    return ResponseEntity.ok((Object) convertToPublicDTO(usuario));
                }
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/username/{username}/banir")
    @Operation(summary = "Banir usuário de forma permanente")
    public ResponseEntity<Void> banirConta(@PathVariable String username) {
        boolean sucesso = usuarioService.banirConta(username);
        if (sucesso) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    @Operation(summary = "Criar novo usuário")
    public ResponseEntity<UsuarioDTO> criar(@RequestBody UsuarioDTO dto) {
        if (dto.getUsername() == null || dto.getUsername().isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        boolean usernameJaExiste = usuarioService.obterPorUsername(dto.getUsername()).isPresent();
        if (usernameJaExiste) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        Usuario usuario = new Usuario();
        usuario.setUsername(dto.getUsername().trim());
        usuario.setPassword(passwordEncoder.encode("change-me"));
        usuario.setRole(dto.getRole() != null && !dto.getRole().isBlank() ? dto.getRole().trim() : "producer");
        usuario.setFullName(trimToNull(dto.getFullName()));
        usuario.setEmail(trimToNull(dto.getEmail()));
        usuario.setPhone(trimToNull(dto.getPhone()));
        usuario.setAvatarUri(trimToNull(dto.getAvatarUri()));
        usuario.setFarmName(trimToNull(dto.getFarmName()));
        usuario.setCpf(trimToNull(dto.getCpf()));
        usuario.setCreatedAt(LocalDateTime.now());
        usuario.setUpdatedAt(LocalDateTime.now());

        Usuario salvo = usuarioService.salvar(usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(salvo));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar usuário")
    public ResponseEntity<UsuarioDTO> atualizar(@PathVariable @NonNull UUID id, @RequestBody UsuarioDTO dto) {
        return usuarioService.obterPorId(id)
            .map(usuario -> {
                if (dto.getUsername() != null && !dto.getUsername().isBlank()
                        && !Objects.equals(usuario.getUsername(), dto.getUsername().trim())) {
                    boolean usernameJaExiste = usuarioService.obterPorUsername(dto.getUsername().trim())
                            .filter(outro -> !outro.getId().equals(usuario.getId()))
                            .isPresent();
                    if (usernameJaExiste) {
                        return ResponseEntity.status(HttpStatus.CONFLICT).<UsuarioDTO>build();
                    }
                    usuario.setUsername(dto.getUsername().trim());
                }

                if (dto.getRole() != null && !dto.getRole().isBlank()) {
                    usuario.setRole(dto.getRole().trim());
                }
                if (dto.getFullName() != null) {
                    usuario.setFullName(trimToNull(dto.getFullName()));
                }
                if (dto.getEmail() != null) {
                    usuario.setEmail(trimToNull(dto.getEmail()));
                }
                if (dto.getPhone() != null) {
                    usuario.setPhone(trimToNull(dto.getPhone()));
                }
                if (dto.getAvatarUri() != null) {
                    usuario.setAvatarUri(trimToNull(dto.getAvatarUri()));
                }
                if (dto.getFarmName() != null) {
                    usuario.setFarmName(trimToNull(dto.getFarmName()));
                }
                if (dto.getCpf() != null) {
                    usuario.setCpf(trimToNull(dto.getCpf()));
                }
                if (dto.getFarmDocument() != null) {
                    usuario.setFarmDocument(trimToNull(dto.getFarmDocument()));
                }
                if (dto.getFarmDocumentType() != null) {
                    usuario.setFarmDocumentType(trimToNull(dto.getFarmDocumentType()));
                }

                // Campos do perfil que estavam faltando (causavam "voltar no reload")
                if (dto.getBio() != null) {
                    usuario.setBio(trimToNull(dto.getBio()));
                }
                if (dto.getGender() != null) {
                    usuario.setGender(trimToNull(dto.getGender()));
                }
                if (dto.getAddressCep() != null) {
                    usuario.setAddressCep(trimToNull(dto.getAddressCep()));
                }
                if (dto.getAddressStreet() != null) {
                    usuario.setAddressStreet(trimToNull(dto.getAddressStreet()));
                }
                if (dto.getAddressNumber() != null) {
                    usuario.setAddressNumber(trimToNull(dto.getAddressNumber()));
                }
                if (dto.getAddressNeighborhood() != null) {
                    usuario.setAddressNeighborhood(trimToNull(dto.getAddressNeighborhood()));
                }
                if (dto.getAddressCity() != null) {
                    usuario.setAddressCity(trimToNull(dto.getAddressCity()));
                }
                if (dto.getAddressState() != null) {
                    usuario.setAddressState(trimToNull(dto.getAddressState()));
                }
                if (dto.getAddressComplement() != null) {
                    usuario.setAddressComplement(trimToNull(dto.getAddressComplement()));
                }

                // Novos campos de geolocalizacao da fazenda
                if (dto.getGateLatitude() != null) {
                    usuario.setGateLatitude(dto.getGateLatitude());
                }
                if (dto.getGateLongitude() != null) {
                    usuario.setGateLongitude(dto.getGateLongitude());
                }
                if (dto.getIsCepValidated() != null) {
                    usuario.setIsCepValidated(dto.getIsCepValidated());
                }
                if (dto.getIsGatePinConfirmed() != null) {
                    usuario.setIsGatePinConfirmed(dto.getIsGatePinConfirmed());
                }
                if (dto.getLocationValidatedAt() != null) {
                    usuario.setLocationValidatedAt(dto.getLocationValidatedAt());
                }
                if (dto.getIsOrganicCertified() != null) {
                    usuario.setIsOrganicCertified(dto.getIsOrganicCertified());
                }
                if (dto.getMapaRegistrationNumber() != null) {
                    usuario.setMapaRegistrationNumber(trimToNull(dto.getMapaRegistrationNumber()));
                }

                usuario.setUpdatedAt(LocalDateTime.now());
                Usuario salvo = usuarioService.salvar(usuario);
                return ResponseEntity.ok(convertToDTO(salvo));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deletar usuário (soft delete)")
    public ResponseEntity<Void> deletar(@PathVariable @NonNull UUID id, java.security.Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Usuario targetUser = usuarioService.obterPorId(id).orElse(null);
        if (targetUser == null) {
            return ResponseEntity.notFound().build();
        }

        Usuario loggedInUser = usuarioService.obterPorUsername(principal.getName()).orElse(null);
        if (loggedInUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        boolean isAdmin = "admin".equalsIgnoreCase(loggedInUser.getRole());
        boolean isOwner = loggedInUser.getId().equals(targetUser.getId());

        if (!isAdmin && !isOwner) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        usuarioService.remover(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/exportar")
    @Operation(summary = "Exportar todos os dados pessoais do usuário (LGPD)")
    public ResponseEntity<UsuarioDTO> exportarDados(@PathVariable @NonNull UUID id, java.security.Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Usuario targetUser = usuarioService.obterPorId(id).orElse(null);
        if (targetUser == null) {
            return ResponseEntity.notFound().build();
        }

        Usuario loggedInUser = usuarioService.obterPorUsername(principal.getName()).orElse(null);
        if (loggedInUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        boolean isAdmin = "admin".equalsIgnoreCase(loggedInUser.getRole());
        boolean isOwner = loggedInUser.getId().equals(targetUser.getId());

        if (!isAdmin && !isOwner) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(convertToDTO(targetUser));
    }


    @PostMapping("/{id}/aceite-legal")
    @Operation(summary = "Registrar aceite dos Termos de Uso e/ou da Política de Privacidade (LGPD)")
    public ResponseEntity<?> registrarAceiteLegal(@PathVariable @NonNull UUID id,
            @RequestBody AceiteLegalRequest req,
            java.security.Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Usuario targetUser = usuarioService.obterPorId(id).orElse(null);
        if (targetUser == null) {
            return ResponseEntity.notFound().build();
        }

        Usuario loggedInUser = usuarioService.obterPorUsername(principal.getName()).orElse(null);
        if (loggedInUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Consentimento é pessoal: somente o próprio titular pode registrar o aceite.
        if (!loggedInUser.getId().equals(targetUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        boolean acceptTerms = req != null && Boolean.TRUE.equals(req.acceptTerms);
        boolean acceptLgpd = req != null && Boolean.TRUE.equals(req.acceptLgpd);
        if (!acceptTerms && !acceptLgpd) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "ACCEPT_REQUIRED"));
        }

        LocalDateTime acceptedAt = LocalDateTime.now();
        if (acceptTerms) {
            targetUser.setTermsAcceptedAt(acceptedAt);
            targetUser.setTermsVersion(resolveVersion(req.termsVersion, DEFAULT_TERMS_VERSION));
        }
        if (acceptLgpd) {
            targetUser.setLgpdAcceptedAt(acceptedAt);
            targetUser.setLgpdTermsVersion(resolveVersion(req.privacyVersion, DEFAULT_PRIVACY_VERSION));
            targetUser.setPendingLgpdReacceptance(false);
        }
        targetUser.setUpdatedAt(acceptedAt);

        Usuario salvo = usuarioService.salvar(targetUser);
        return ResponseEntity.ok(convertToDTO(salvo));
    }

    @PatchMapping("/{id}/recuperar")
    @Operation(summary = "Recuperar usuário (remover soft delete)")
    public ResponseEntity<Void> recuperar(@PathVariable @NonNull UUID id) {
        // Obter por ID sem o filtro de deletedAt
        boolean existe = usuarioService.obterPorId(id).isPresent() || 
                         usuarioService.obterTodosIncluindoDeletados().stream().anyMatch(u -> u.getId().equals(id));
        if (!existe) {
            return ResponseEntity.notFound().build();
        }
        usuarioService.recuperarConta(id);
        return ResponseEntity.ok().build();
    }

    private String resolveVersion(String requested, String fallback) {
        if (requested == null) {
            return fallback;
        }
        String trimmed = requested.trim();
        if (trimmed.isEmpty() || trimmed.length() > MAX_VERSION_LENGTH) {
            return fallback;
        }
        return trimmed;
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private UsuarioDTO convertToDTO(Usuario usuario) {
        UsuarioDTO dto = new UsuarioDTO();
        dto.setId(usuario.getId());
        dto.setUsername(usuario.getUsername());
        dto.setFullName(usuario.getFullName());
        dto.setEmail(usuario.getEmail());
        dto.setPhone(usuario.getPhone());
        dto.setRole(usuario.getRole());
        dto.setAvatarUri(usuario.getAvatarUri());
        dto.setFarmName(usuario.getFarmName());
        dto.setCpf(usuario.getCpf());
        dto.setFarmDocument(usuario.getFarmDocument());
        dto.setFarmDocumentType(usuario.getFarmDocumentType());
        dto.setBio(usuario.getBio());
        dto.setGender(usuario.getGender());
        dto.setAddressCep(usuario.getAddressCep());
        dto.setAddressStreet(usuario.getAddressStreet());
        dto.setAddressNumber(usuario.getAddressNumber());
        dto.setAddressNeighborhood(usuario.getAddressNeighborhood());
        dto.setAddressCity(usuario.getAddressCity());
        dto.setAddressState(usuario.getAddressState());
        dto.setAddressComplement(usuario.getAddressComplement());
        dto.setLgpdAcceptedAt(usuario.getLgpdAcceptedAt());
        dto.setLgpdTermsVersion(usuario.getLgpdTermsVersion());
        dto.setPendingLgpdReacceptance(usuario.getPendingLgpdReacceptance());
        dto.setTermsAcceptedAt(usuario.getTermsAcceptedAt());
        dto.setTermsVersion(usuario.getTermsVersion());
        dto.setCreatedAt(usuario.getCreatedAt());
        dto.setUpdatedAt(usuario.getUpdatedAt());

        // Novos campos de Perfil
        dto.setGateLatitude(usuario.getGateLatitude());
        dto.setGateLongitude(usuario.getGateLongitude());
        dto.setIsCepValidated(usuario.getIsCepValidated());
        dto.setIsGatePinConfirmed(usuario.getIsGatePinConfirmed());
        dto.setLocationValidatedAt(usuario.getLocationValidatedAt());
        dto.setProducerRole(usuario.getProducerRole());
        dto.setFarmAddressReference(usuario.getFarmAddressReference());
        dto.setFarmPhotos(usuario.getFarmPhotos());
        dto.setBlockMessages(usuario.getBlockMessages());
        dto.setIsOrganicCertified(usuario.getIsOrganicCertified());
        dto.setMapaRegistrationNumber(usuario.getMapaRegistrationNumber());

        // Popular Listas (Listings, Insumos, Metricas)
        if ("producer".equalsIgnoreCase(usuario.getRole())) {
            // Listings (Produtos como Anúncios)
            List<ListingDTO> listings = produtoRepository.findByVendedorId(usuario.getId()).stream()
                .map(this::convertProdutoToListingDTO)
                .collect(Collectors.toList());
            dto.setListings(listings);

            // Insumos
            List<InsumoDTO> insumos = insumoDisponivelRepository.findByProducerId(usuario.getId()).stream()
                .map(insumo -> new InsumoDTO(insumo.getId(), insumo.getTitle(), insumo.getAmount()))
                .collect(Collectors.toList());
            dto.setInsumos(insumos);

            // Avaliações
            List<AvaliacaoDTO> reviews = avaliacaoRepository.findByAvaliadoId(usuario.getId()).stream()
                .map(this::convertAvaliacaoToDTO)
                .collect(Collectors.toList());
            dto.setReviews(reviews);

            // Média de Nota (Métricas)
            Double media = metricaVendedorRepository.findByUsuarioIdOrderByMesAnoDesc(usuario.getId()).stream()
                .findFirst()
                .map(m -> m.getMediaNota() != null ? m.getMediaNota().doubleValue() : 0.0)
                .orElse(0.0);
            dto.setMediaNota(media);
        }

        return dto;
    }

    private ListingDTO convertProdutoToListingDTO(Produto produto) {
        ListingDTO dto = new ListingDTO();
        dto.setId(produto.getId());
        dto.setTitulo(produto.getNome());
        dto.setDescricao(produto.getDescricao());
        dto.setQuantidade(produto.getEstoque());
        dto.setPreco(produto.getPreco());
        dto.setVendedorUsername(produto.getVendedor().getUsername());
        dto.setFotoUrl(produto.getFotoUri());
        dto.setUnidade(produto.getUnidade() != null ? produto.getUnidade().getSimbolo() : null);
        return dto;
    }

    private AvaliacaoDTO convertAvaliacaoToDTO(Avaliacao avaliacao) {
        AvaliacaoDTO dto = new AvaliacaoDTO();
        dto.setId(avaliacao.getId());
        dto.setAvaliadorId(avaliacao.getAvaliador().getId());
        dto.setAvaliadorNome(avaliacao.getAvaliador().getFullName() != null ? avaliacao.getAvaliador().getFullName() : avaliacao.getAvaliador().getUsername());
        dto.setNota(avaliacao.getNota());
        dto.setComentario(avaliacao.getComentario());
        dto.setCreatedAt(avaliacao.getCreatedAt());
        if (avaliacao.getProduto() != null) {
            dto.setProdutoId(avaliacao.getProduto().getId());
            dto.setProdutoNome(avaliacao.getProduto().getNome());
        }
        return dto;
    }

    public static class AlterarSenhaRequest {
        public String senhaAtual;
        public String novaSenha;
    }

    @PutMapping("/{id}/alterar-senha")
    @Operation(summary = "Alterar senha do usuário")
    public ResponseEntity<?> alterarSenha(@PathVariable @NonNull UUID id, @RequestBody AlterarSenhaRequest req) {
        return usuarioService.obterPorId(id)
            .map(usuario -> {
                if (req.senhaAtual == null || req.senhaAtual.isBlank() ||
                    req.novaSenha == null || req.novaSenha.isBlank()) {
                    return ResponseEntity.badRequest().body(java.util.Map.of("message", "Campos obrigatórios ausentes."));
                }
                if (!passwordEncoder.matches(req.senhaAtual, usuario.getPassword())) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(java.util.Map.of("message", "Senha atual incorreta."));
                }
                usuario.setPassword(passwordEncoder.encode(req.novaSenha));
                usuario.setUpdatedAt(LocalDateTime.now());
                usuarioService.salvar(usuario);
                return ResponseEntity.ok(java.util.Map.of("message", "Senha alterada com sucesso."));
            })
            .orElse(ResponseEntity.notFound().build());
    }

}