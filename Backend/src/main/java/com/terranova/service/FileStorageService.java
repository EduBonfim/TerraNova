package com.terranova.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            ".jpg", ".jpeg", ".png", ".gif", ".webp", ".heic", ".heif"
    );

    @Value("${app.upload.dir:uploads/images}")
    private String uploadDir;

    @Value("${server.servlet.context-path:/}")
    private String contextPath;

    @Value("${server.port:8080}")
    private String serverPort;

    /**
     * Salva um arquivo de imagem e retorna a URL para acesso
     */
    public String salvarImagem(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Arquivo de imagem está vazio.");
        }

        String contentType = file.getContentType();
        String extensao = resolveExtension(file.getOriginalFilename(), contentType);

        // Validar tipo de arquivo (aceita image/* ou octet-stream/null quando a extensao e de imagem valida)
        boolean hasImageContentType = contentType != null && contentType.toLowerCase(Locale.ROOT).startsWith("image/");
        boolean hasValidImageExtension = extensao != null && ALLOWED_EXTENSIONS.contains(extensao);
        if (!hasImageContentType && !hasValidImageExtension) {
            throw new IllegalArgumentException("Formato de arquivo inválido. Envie uma imagem (JPG, PNG, WEBP ou GIF).");
        }

        if (extensao == null) {
            extensao = ".jpg";
        }

        // Criar diretório se não existir
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Gerar nome único para o arquivo
        String nomeArquivo = UUID.randomUUID().toString() + extensao;

        // Salvar arquivo no servidor
        Path caminhoCompleto = uploadPath.resolve(nomeArquivo);
        Files.copy(file.getInputStream(), caminhoCompleto, StandardCopyOption.REPLACE_EXISTING);

        // Retornar URL de acesso
        return "/api/v1/imagens/" + nomeArquivo;
    }

    private String resolveExtension(String nomeOriginal, String contentType) {
        if (nomeOriginal != null && !nomeOriginal.isBlank()) {
            String cleanName = nomeOriginal.split("\\?")[0].trim();
            int dotIndex = cleanName.lastIndexOf('.');
            if (dotIndex >= 0 && dotIndex < cleanName.length() - 1) {
                String ext = cleanName.substring(dotIndex).toLowerCase(Locale.ROOT);
                if (ALLOWED_EXTENSIONS.contains(ext)) {
                    return ext;
                }
            }
        }
        if (contentType != null) {
            String ct = contentType.toLowerCase(Locale.ROOT).split(";")[0].trim();
            return switch (ct) {
                case "image/png" -> ".png";
                case "image/gif" -> ".gif";
                case "image/webp" -> ".webp";
                case "image/heic" -> ".heic";
                case "image/heif" -> ".heif";
                case "image/jpeg", "image/jpg" -> ".jpg";
                default -> null;
            };
        }
        return null;
    }

    /**
     * Obtém um arquivo de imagem pelo nome
     */
    public byte[] obterImagem(String nomeArquivo) throws IOException {
        Path caminhoArquivo = Paths.get(uploadDir).resolve(nomeArquivo);

        if (!Files.exists(caminhoArquivo)) {
            throw new IllegalArgumentException("Imagem não encontrada: " + nomeArquivo);
        }

        return Files.readAllBytes(caminhoArquivo);
    }

    /**
     * Deleta um arquivo de imagem
     */
    public void deletarImagem(String nomeArquivo) throws IOException {
        Path caminhoArquivo = Paths.get(uploadDir).resolve(nomeArquivo);

        if (Files.exists(caminhoArquivo)) {
            Files.delete(caminhoArquivo);
        }
    }

    /**
     * Extrai o nome do arquivo a partir de uma URL
     */
    public String extrairNomeArquivo(String url) {
        if (url == null) return null;
        return url.substring(url.lastIndexOf("/") + 1);
    }
}
