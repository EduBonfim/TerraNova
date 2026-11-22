package com.terranova.controller;

import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.terranova.dto.UsuarioDTO;
import com.terranova.model.Usuario;
import com.terranova.repository.HistoricoContaRepository;
import com.terranova.security.JwtUtil;
import com.terranova.service.UsuarioService;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private static final String DEFAULT_TERMS_VERSION = "2026.10";
    private static final String DEFAULT_PRIVACY_VERSION = "2026.04";
    private static final int MAX_VERSION_LENGTH = 20;

    public static class AuthRequest {
        public String username;
        public String password;
    }

    public static class RegisterRequest {
        public String username;
        public String password;
        public String role;
        public String fullName;
        public String email;
        public String phone;
        public String avatarUri;
        public String farmName;
        public String cpf;
        public String farmDocument;
        public String farmDocumentType;
        public String bio;
        public String gender;
        public String addressCep;
        public String addressStreet;
        public String addressNumber;
        public String addressNeighborhood;
        public String addressCity;
        public String addressState;
        public String addressComplement;
        public Boolean acceptLgpd;
        public String privacyVersion;
        public Boolean acceptTerms;
        public String termsVersion;
    }

    public static class AuthResponse {
        public String token;
        public String username;
        public Object roles;
        public UsuarioDTO user;

        public AuthResponse(String token, String username, Object roles, UsuarioDTO user) {
            this.token = token;
            this.username = username;
            this.roles = roles;
            this.user = user;
        }
    }

    private final AuthenticationManager authenticationManager;

    private final JwtUtil jwtUtil;

    private final UsuarioService usuarioService;

    private final PasswordEncoder passwordEncoder;

    private final HistoricoContaRepository historicoContaRepository;

    public AuthController(AuthenticationManager authenticationManager, JwtUtil jwtUtil, UsuarioService usuarioService,
            PasswordEncoder passwordEncoder, HistoricoContaRepository historicoContaRepository) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.usuarioService = usuarioService;
        this.passwordEncoder = passwordEncoder;
        this.historicoContaRepository = historicoContaRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest req) {
        String loginIdentifier = resolveLoginIdentifier(req == null ? null : req.username);
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginIdentifier, req.password));

        String token = jwtUtil.generateToken(auth.getName());

        var roles = auth.getAuthorities().stream().map(GrantedAuthority::getAuthority).collect(Collectors.toList());
        Usuario usuario = usuarioService.obterPorUsername(auth.getName()).orElseThrow();

        return ResponseEntity.ok(new AuthResponse(token, auth.getName(), roles, toDTO(usuario)));
    }

    @PostMapping("/register/producer")
    public ResponseEntity<?> registerProducer(@RequestBody RegisterRequest req) {
        return register(req, "producer");
    }

    @PostMapping("/register/buyer")
    public ResponseEntity<?> registerBuyer(@RequestBody RegisterRequest req) {
        return register(req, "buyer");
    }

    private ResponseEntity<?> register(RegisterRequest req, String fallbackRole) {
        if (req == null) {
            return errorResponse(HttpStatus.BAD_REQUEST, "INVALID_PAYLOAD", "Dados do cadastro não informados.");
        }

        if (isBlank(req.username)) {
            return errorResponse(HttpStatus.BAD_REQUEST, "USERNAME_REQUIRED", "Informe um nome de usuário ou e-mail para o cadastro.");
        }

        if (isBlank(req.password)) {
            return errorResponse(HttpStatus.BAD_REQUEST, "PASSWORD_REQUIRED", "Informe uma senha para concluir o cadastro.");
        }

        String trimmedUsername = req.username.trim();
        if (trimmedUsername.length() > 100) {
            return errorResponse(HttpStatus.BAD_REQUEST, "USERNAME_TOO_LONG", "O nome de usuário deve ter no máximo 100 caracteres.");
        }

        if (!Boolean.TRUE.equals(req.acceptTerms)) {
            return errorResponse(HttpStatus.BAD_REQUEST, "TERMS_REQUIRED", "Você precisa aceitar os Termos de Uso para concluir o cadastro.");
        }

        if (!Boolean.TRUE.equals(req.acceptLgpd)) {
            return errorResponse(HttpStatus.BAD_REQUEST, "LGPD_REQUIRED", "Você precisa aceitar a Política de Privacidade (LGPD) para concluir o cadastro.");
        }

        String trimmedCep = trimToNull(req.addressCep);
        if (trimmedCep == null) {
            return errorResponse(HttpStatus.BAD_REQUEST, "CEP_REQUIRED", "Informe o CEP do endereço para concluir o cadastro.");
        }
        String cepDigits = normalizeDigits(trimmedCep);
        if (cepDigits.length() != 8) {
            return errorResponse(HttpStatus.BAD_REQUEST, "INVALID_CEP", "Informe um CEP válido com 8 dígitos.");
        }
        String formattedCep = cepDigits.substring(0, 5) + "-" + cepDigits.substring(5);

        String trimmedState = trimToNull(req.addressState);
        if (trimmedState != null) {
            trimmedState = trimmedState.toUpperCase(Locale.ROOT);
            if (trimmedState.length() != 2) {
                return errorResponse(HttpStatus.BAD_REQUEST, "INVALID_STATE", "A UF deve conter exatamente 2 letras (ex: SP).");
            }
        }

        String trimmedAddressNumber = trimToNull(req.addressNumber);
        if (trimmedAddressNumber != null && trimmedAddressNumber.length() > 30) {
            return errorResponse(HttpStatus.BAD_REQUEST, "ADDRESS_NUMBER_TOO_LONG", "O número do endereço deve ter no máximo 30 caracteres.");
        }

        String resolvedEmail = trimToNull(req.email);
        if (resolvedEmail == null && isValidEmailFormat(trimmedUsername)) {
            resolvedEmail = trimmedUsername.toLowerCase(Locale.ROOT);
        }
        if (resolvedEmail != null && !isValidEmailFormat(resolvedEmail)) {
            return errorResponse(HttpStatus.BAD_REQUEST, "INVALID_EMAIL", "O e-mail informado é inválido. Verifique o formato (ex: nome@dominio.com).");
        }

        String normalizedCpf = normalizeDigits(req.cpf);
        if (!normalizedCpf.isBlank() && !isValidCpf(normalizedCpf)) {
            return errorResponse(HttpStatus.BAD_REQUEST, "INVALID_CPF", "O CPF informado é inválido. Verifique os 11 dígitos e tente novamente.");
        }

        String normalizedFarmDoc = normalizeDigits(req.farmDocument);
        if (!normalizedFarmDoc.isBlank() && normalizedFarmDoc.length() != 11 && normalizedFarmDoc.length() != 14) {
            return errorResponse(HttpStatus.BAD_REQUEST, "INVALID_DOCUMENT", "Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido para a propriedade.");
        }

        // Verifica se o CPF está banido no cofre histórico
        String cpfToCheckBan = !normalizedCpf.isBlank()
                ? normalizedCpf
                : (normalizedFarmDoc.length() == 11 ? normalizedFarmDoc : "");
        if (!cpfToCheckBan.isBlank()) {
            boolean isBanned = historicoContaRepository.findByCpf(cpfToCheckBan)
                    .map(historico -> "banida".equalsIgnoreCase(historico.getStatus()))
                    .orElse(false);
            if (isBanned) {
                return errorResponse(HttpStatus.FORBIDDEN, "USER_BANNED", "Este CPF está impedido de criar uma nova conta na plataforma.");
            }
        }

        // Libera qualquer conta previamente deletada de forma lógica que esteja ocupando estes dados
        usuarioService.limparDadosDeletados(trimmedUsername, resolvedEmail, normalizedCpf, normalizedFarmDoc);

        if (usuarioService.obterPorUsername(trimmedUsername).isPresent()) {
            return errorResponse(HttpStatus.CONFLICT, "USERNAME_EXISTS", "Este nome de usuário/login já está cadastrado. Escolha outro.");
        }

        if (resolvedEmail != null && usuarioService.obterPorEmail(resolvedEmail).isPresent()) {
            return errorResponse(HttpStatus.CONFLICT, "EMAIL_EXISTS", "Este e-mail já está cadastrado em outra conta.");
        }

        if (!normalizedCpf.isBlank() && usuarioService.obterPorCpf(normalizedCpf).isPresent()) {
            return errorResponse(HttpStatus.CONFLICT, "CPF_EXISTS", "Este CPF já está cadastrado em outra conta.");
        }

        if (!normalizedFarmDoc.isBlank() && usuarioService.obterPorFarmDocument(normalizedFarmDoc).isPresent()) {
            return errorResponse(HttpStatus.CONFLICT, "DOCUMENT_EXISTS", "Já existe uma propriedade cadastrada com este CPF/CNPJ.");
        }

        Usuario usuario = new Usuario();
        usuario.setUsername(trimmedUsername);
        usuario.setPassword(passwordEncoder.encode(req.password));
        usuario.setRole(!isBlank(req.role) ? req.role.trim().toLowerCase(Locale.ROOT) : fallbackRole);
        usuario.setFullName(trimToNull(req.fullName));
        usuario.setEmail(resolvedEmail);
        usuario.setPhone(trimToNull(req.phone));
        usuario.setAvatarUri(trimToNull(req.avatarUri));
        usuario.setFarmName(trimToNull(req.farmName));
        usuario.setCpf(normalizedCpf.isBlank() ? null : normalizedCpf);
        usuario.setFarmDocument(normalizedFarmDoc.isBlank() ? null : normalizedFarmDoc);
        usuario.setFarmDocumentType(trimToNull(req.farmDocumentType));
        usuario.setBio(trimToNull(req.bio));
        usuario.setGender(trimToNull(req.gender));
        usuario.setAddressCep(formattedCep);
        usuario.setAddressStreet(trimToNull(req.addressStreet));
        usuario.setAddressNumber(trimmedAddressNumber);
        usuario.setAddressNeighborhood(trimToNull(req.addressNeighborhood));
        usuario.setAddressCity(trimToNull(req.addressCity));
        usuario.setAddressState(trimmedState);
        usuario.setAddressComplement(trimToNull(req.addressComplement));
        LocalDateTime acceptedAt = LocalDateTime.now();
        usuario.setTermsAcceptedAt(acceptedAt);
        usuario.setTermsVersion(resolveVersion(req.termsVersion, DEFAULT_TERMS_VERSION));
        usuario.setLgpdAcceptedAt(acceptedAt);
        usuario.setLgpdTermsVersion(resolveVersion(req.privacyVersion, DEFAULT_PRIVACY_VERSION));
        usuario.setPendingLgpdReacceptance(false);
        usuario.setCreatedAt(LocalDateTime.now());
        usuario.setUpdatedAt(LocalDateTime.now());

        Usuario salvo = usuarioService.salvar(usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(salvo));
    }

    private ResponseEntity<Map<String, String>> errorResponse(HttpStatus status, String code, String message) {
        return ResponseEntity.status(status).body(Map.of(
                "code", code,
                "message", message
        ));
    }

    private boolean isValidEmailFormat(String value) {
        if (value == null) return false;
        return value.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
    }

    private boolean isValidCpf(String cpf) {
        if (cpf == null || cpf.length() != 11 || cpf.matches("(\\d)\\1{10}")) {
            return false;
        }
        int sum1 = 0;
        for (int i = 0; i < 9; i++) {
            sum1 += Character.getNumericValue(cpf.charAt(i)) * (10 - i);
        }
        int digit1 = 11 - (sum1 % 11);
        if (digit1 >= 10) digit1 = 0;

        int sum2 = 0;
        for (int i = 0; i < 10; i++) {
            sum2 += Character.getNumericValue(cpf.charAt(i)) * (11 - i);
        }
        int digit2 = 11 - (sum2 % 11);
        if (digit2 >= 10) digit2 = 0;

        return digit1 == Character.getNumericValue(cpf.charAt(9))
                && digit2 == Character.getNumericValue(cpf.charAt(10));
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

    private UsuarioDTO toDTO(Usuario usuario) {
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
        dto.setIsOrganicCertified(usuario.getIsOrganicCertified());
        dto.setMapaRegistrationNumber(usuario.getMapaRegistrationNumber());
        return dto;
    }

    private String normalizeDigits(String value) {
        return value == null ? "" : value.replaceAll("\\D", "");
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private String resolveLoginIdentifier(String value) {
        if (isBlank(value)) {
            return value;
        }

        String trimmed = value.trim();

        return usuarioService.obterPorUsername(trimmed)
                .map(Usuario::getUsername)
                .or(() -> usuarioService.obterPorEmail(trimmed).map(Usuario::getUsername))
                .or(() -> usuarioService.obterPorCpf(normalizeDigits(trimmed)).map(Usuario::getUsername))
                .or(() -> usuarioService.obterPorFarmDocument(normalizeDigits(trimmed)).map(Usuario::getUsername))
                .orElse(trimmed);
    }
}