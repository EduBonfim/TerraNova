package com.terranova.controller;

import com.terranova.model.Categoria;
import com.terranova.repository.CategoriaRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/categorias")
@Tag(name = "Categorias", description = "Gerenciar categorias de produto (temporário)")
public class CategoriaController {

    private final CategoriaRepository categoriaRepository;

    public CategoriaController(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    @GetMapping
    @Operation(summary = "Listar categorias")
    public ResponseEntity<List<Categoria>> listar() {
        return ResponseEntity.ok(categoriaRepository.findAll());
    }

    @PostMapping
    @Operation(summary = "Criar categoria")
    public ResponseEntity<Categoria> criar(@RequestBody Categoria dto) {
        if (dto.getNome() == null || dto.getNome().isBlank()) return ResponseEntity.badRequest().build();
        Categoria c = new Categoria();
        c.setNome(dto.getNome().trim());
        c.setDescricao(dto.getDescricao());
        c.setCreatedAt(LocalDateTime.now());
        Categoria salvo = categoriaRepository.save(c);
        return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
    }
}
