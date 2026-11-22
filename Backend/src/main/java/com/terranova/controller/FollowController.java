package com.terranova.controller;

import com.terranova.dto.UsuarioDTO;
import com.terranova.model.Seguidor;
import com.terranova.model.Usuario;
import com.terranova.repository.SeguidorRepository;
import com.terranova.repository.UsuarioRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/follows")
@Tag(name = "Follows", description = "Seguidores persistidos no banco")
public class FollowController {

    public static class FollowRequest {
        public String followerUsername;
        public String producerUsername;
    }

    private final UsuarioRepository usuarioRepository;
    private final SeguidorRepository seguidorRepository;

    public FollowController(UsuarioRepository usuarioRepository, SeguidorRepository seguidorRepository) {
        this.usuarioRepository = usuarioRepository;
        this.seguidorRepository = seguidorRepository;
    }

    @PostMapping
    @Operation(summary = "Seguir produtor")
    public ResponseEntity<?> follow(@RequestBody FollowRequest request) {
        if (request == null || isBlank(request.followerUsername) || isBlank(request.producerUsername)) {
            return ResponseEntity.badRequest().body(Map.of("message", "INVALID_PAYLOAD"));
        }

        Usuario follower = findActiveUser(request.followerUsername);
        Usuario producer = findActiveUser(request.producerUsername);

        if (follower == null || producer == null || !"producer".equalsIgnoreCase(producer.getRole())) {
            return ResponseEntity.badRequest().body(Map.of("message", "USER_NOT_FOUND"));
        }

        if (follower.getId().equals(producer.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "SELF_FOLLOW_NOT_ALLOWED"));
        }

        if (seguidorRepository.existsByFollowerIdAndProducerId(follower.getId(), producer.getId())) {
            return ResponseEntity.ok(Map.of("following", true));
        }

        Seguidor seguidor = new Seguidor();
        seguidor.setFollower(follower);
        seguidor.setProducer(producer);
        seguidor.setCreatedAt(LocalDateTime.now());
        seguidorRepository.save(seguidor);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("following", true));
    }

    @DeleteMapping("/{producerUsername}/{followerUsername}")
    @Operation(summary = "Deixar de seguir produtor")
    public ResponseEntity<?> unfollow(@PathVariable String producerUsername, @PathVariable String followerUsername) {
        Usuario follower = findActiveUser(followerUsername);
        Usuario producer = findActiveUser(producerUsername);

        if (follower == null || producer == null) {
            return ResponseEntity.notFound().build();
        }

        seguidorRepository.findByFollowerIdAndProducerId(follower.getId(), producer.getId())
                .ifPresent(seguidorRepository::delete);

        return ResponseEntity.ok(Map.of("following", false));
    }

    @GetMapping("/{producerUsername}/count")
    @Operation(summary = "Contar seguidores de um produtor")
    public ResponseEntity<?> countFollowers(@PathVariable String producerUsername) {
        Usuario producer = findActiveUser(producerUsername);
        if (producer == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(Map.of("count", seguidorRepository.countByProducerId(producer.getId())));
    }

    @GetMapping("/{producerUsername}/followers")
    @Operation(summary = "Listar seguidores de um produtor")
    public ResponseEntity<List<UsuarioDTO>> listFollowers(@PathVariable String producerUsername) {
        Usuario producer = findActiveUser(producerUsername);
        if (producer == null) {
            return ResponseEntity.notFound().build();
        }

        List<UsuarioDTO> followers = seguidorRepository.findByProducerId(producer.getId()).stream()
                .map(Seguidor::getFollower)
                .filter(usuario -> usuario.getDeletedAt() == null)
                .map(this::toDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(followers);
    }

    @GetMapping("/{producerUsername}/following/{followerUsername}")
    @Operation(summary = "Verificar se usuario segue produtor")
    public ResponseEntity<?> isFollowing(@PathVariable String producerUsername, @PathVariable String followerUsername) {
        Usuario follower = findActiveUser(followerUsername);
        Usuario producer = findActiveUser(producerUsername);

        if (follower == null || producer == null) {
            return ResponseEntity.notFound().build();
        }

        boolean following = seguidorRepository.existsByFollowerIdAndProducerId(follower.getId(), producer.getId());
        return ResponseEntity.ok(Map.of("following", following));
    }

    @GetMapping("/{followerUsername}/following")
    @Operation(summary = "Listar produtores seguidos por um usuario")
    public ResponseEntity<List<UsuarioDTO>> listFollowing(@PathVariable String followerUsername) {
        Usuario follower = findActiveUser(followerUsername);
        if (follower == null) {
            return ResponseEntity.notFound().build();
        }

        List<UsuarioDTO> following = seguidorRepository.findByFollowerId(follower.getId()).stream()
                .map(Seguidor::getProducer)
                .filter(usuario -> usuario.getDeletedAt() == null)
                .map(this::toDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(following);
    }

    private Usuario findActiveUser(String username) {
        return usuarioRepository.findByUsernameIgnoreCase(username.trim())
                .filter(usuario -> usuario.getDeletedAt() == null)
                .orElse(null);
    }

    private UsuarioDTO toDTO(Usuario usuario) {
        UsuarioDTO dto = new UsuarioDTO();
        dto.setId(usuario.getId());
        dto.setUsername(usuario.getUsername());
        dto.setFullName(usuario.getFullName());
        dto.setRole(usuario.getRole());
        dto.setAvatarUri(usuario.getAvatarUri());
        dto.setFarmName(usuario.getFarmName());
        return dto;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
