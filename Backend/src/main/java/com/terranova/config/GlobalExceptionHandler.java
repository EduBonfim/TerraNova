package com.terranova.config;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, Object>> handleConstraintViolation(ConstraintViolationException ex) {
        log.warn("Erro de validacao (ConstraintViolationException): {}", ex.getMessage());

        String message = ex.getConstraintViolations().stream()
                .map(this::formatViolation)
                .distinct()
                .collect(Collectors.joining(" "));

        if (message.isBlank()) {
            message = "Um ou mais campos informados são inválidos. Verifique os dados e tente novamente.";
        }

        Map<String, Object> body = new HashMap<>();
        body.put("code", "VALIDATION_ERROR");
        body.put("message", message);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleMethodArgumentNotValid(MethodArgumentNotValidException ex) {
        log.warn("Erro de validacao (MethodArgumentNotValidException): {}", ex.getMessage());

        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(err -> translateFieldName(err.getField()) + ": " + err.getDefaultMessage())
                .distinct()
                .collect(Collectors.joining(" "));

        if (message.isBlank()) {
            message = "Um ou mais campos obrigatórios estão inválidos.";
        }

        Map<String, Object> body = new HashMap<>();
        body.put("code", "VALIDATION_ERROR");
        body.put("message", message);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrity(DataIntegrityViolationException ex) {
        String rootMsg = ex.getMostSpecificCause() != null ? ex.getMostSpecificCause().getMessage() : ex.getMessage();
        String lower = rootMsg != null ? rootMsg.toLowerCase(Locale.ROOT) : "";
        log.warn("Erro de integridade no banco: {}", rootMsg);

        String code = "DATA_INTEGRITY_ERROR";
        String message = "Não foi possível salvar os dados. Verifique as informações preenchidas e tente novamente.";
        HttpStatus status = HttpStatus.BAD_REQUEST;

        if (lower.contains("duplicate key") || lower.contains("unique constraint") || lower.contains("already exists")) {
            status = HttpStatus.CONFLICT;
            if (lower.contains("username")) {
                code = "USERNAME_EXISTS";
                message = "Este nome de usuário/login já está cadastrado. Escolha outro.";
            } else if (lower.contains("email")) {
                code = "EMAIL_EXISTS";
                message = "Este e-mail já está cadastrado em outra conta.";
            } else if (lower.contains("cpf")) {
                code = "CPF_EXISTS";
                message = "Este CPF já está cadastrado em outra conta.";
            } else {
                code = "DUPLICATE_ENTRY";
                message = "Já existe um cadastro com os mesmos dados informados.";
            }
        } else if (lower.contains("value too long")) {
            code = "VALUE_TOO_LONG";
            message = "Um dos campos preenchidos ultrapassou o tamanho máximo permitido. Revise os dados (como número do endereço, telefone ou nome).";
        } else if (lower.contains("not-null") || lower.contains("null value in column")) {
            code = "REQUIRED_FIELD_MISSING";
            message = "Um campo obrigatório não foi preenchido corretamente.";
        }

        Map<String, Object> body = new HashMap<>();
        body.put("code", code);
        body.put("message", message);
        return ResponseEntity.status(status).body(body);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, Object>> handleMaxUploadSize(MaxUploadSizeExceededException ex) {
        log.warn("Arquivo excedeu o limite maximo de upload: {}", ex.getMessage());
        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("code", "FILE_TOO_LARGE");
        body.put("error", "A imagem selecionada é muito grande. Escolha uma imagem menor (máximo 20MB).");
        body.put("message", "A imagem selecionada é muito grande. Escolha uma imagem menor (máximo 20MB).");
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(body);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleUnreadableMessage(HttpMessageNotReadableException ex) {
        log.warn("Payload JSON invalido: {}", ex.getMessage());
        Map<String, Object> body = new HashMap<>();
        body.put("code", "INVALID_PAYLOAD");
        body.put("message", "Os dados enviados estão em formato inválido.");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    private String formatViolation(ConstraintViolation<?> violation) {
        String field = violation.getPropertyPath() != null ? violation.getPropertyPath().toString() : "";
        return switch (field) {
            case "cpf" -> "O CPF informado é inválido. Verifique os 11 dígitos.";
            case "email" -> "O e-mail informado é inválido.";
            case "addressCep" -> "O CEP do endereço é obrigatório.";
            case "password" -> "A senha é obrigatória.";
            case "username" -> "O nome de usuário é obrigatório.";
            default -> translateFieldName(field) + ": " + violation.getMessage();
        };
    }

    private String translateFieldName(String field) {
        if (field == null || field.isBlank()) return "Campo";
        return switch (field) {
            case "username" -> "Usuário";
            case "password" -> "Senha";
            case "email" -> "E-mail";
            case "cpf" -> "CPF";
            case "addressCep" -> "CEP";
            case "addressNumber" -> "Número do endereço";
            case "addressState" -> "UF";
            case "farmDocument" -> "CPF/CNPJ da propriedade";
            default -> field;
        };
    }
}
