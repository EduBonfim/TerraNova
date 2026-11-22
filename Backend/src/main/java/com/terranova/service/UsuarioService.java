package com.terranova.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.terranova.model.HistoricoConta;
import com.terranova.model.Usuario;
import com.terranova.repository.HistoricoContaRepository;
import com.terranova.repository.UsuarioRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class UsuarioService {

    private static final String DELETED_SUFFIX = "_del_";

    @PersistenceContext
    private EntityManager entityManager;

    private final UsuarioRepository usuarioRepository;
    private final HistoricoContaRepository historicoContaRepository;

    public UsuarioService(UsuarioRepository usuarioRepository, HistoricoContaRepository historicoContaRepository) {
        this.usuarioRepository = usuarioRepository;
        this.historicoContaRepository = historicoContaRepository;
    }

    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll().stream()
                .filter(usuario -> usuario.getDeletedAt() == null)
                .toList();
    }

    public List<Usuario> obterTodosIncluindoDeletados() {
        return usuarioRepository.findAll();
    }

    public Optional<Usuario> obterPorId(UUID id) {
        return usuarioRepository.findById(id)
                .filter(usuario -> usuario.getDeletedAt() == null);
    }

    public Optional<Usuario> obterPorUsername(String username) {
        return usuarioRepository.findByUsernameIgnoreCase(username)
                .filter(usuario -> usuario.getDeletedAt() == null);
    }

    public Optional<Usuario> obterPorEmail(String email) {
        return usuarioRepository.findByEmailIgnoreCase(email)
                .filter(usuario -> usuario.getDeletedAt() == null);
    }

    public Optional<Usuario> obterPorCpf(String cpf) {
        return usuarioRepository.findByCpf(cpf)
                .filter(usuario -> usuario.getDeletedAt() == null);
    }

    public Optional<Usuario> obterPorFarmDocument(String farmDocument) {
        return usuarioRepository.findByFarmDocument(farmDocument)
                .filter(usuario -> usuario.getDeletedAt() == null);
    }

    public Usuario salvar(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }

    @Transactional
    public void remover(UUID id) {
        usuarioRepository.findById(id).ifPresent(usuario -> {
            usuario.setDeletedAt(LocalDateTime.now());
            usuarioRepository.save(usuario);
        });
    }

    @Transactional
    public void recuperarConta(UUID id) {
        usuarioRepository.findById(id).ifPresent(usuario -> {
            usuario.setDeletedAt(null);
            usuarioRepository.save(usuario);
        });
    }

    @Transactional
    public boolean banirConta(String username) {
        Optional<Usuario> optionalUsuario = usuarioRepository.findByUsernameIgnoreCase(username);
        if (optionalUsuario.isPresent()) {
            Usuario usuario = optionalUsuario.get();
            
            // Guarda um historico minimo da conta antes de bloquea-la.
            HistoricoConta historico = new HistoricoConta();
            historico.setId(UUID.randomUUID());
            historico.setOriginalUserId(usuario.getId());
            historico.setUsername(usuario.getUsername());
            historico.setEmail(usuario.getEmail());
            historico.setCpf(usuario.getCpf());
            historico.setStatus("banida");
            historico.setDeletedAt(LocalDateTime.now());
            
            historicoContaRepository.save(historico);
            
            // Aplica exclusao logica para que a limpeza final seja feita depois.
            usuario.setDeletedAt(LocalDateTime.now());
            usuarioRepository.save(usuario);
            return true;
        }
        return false;
    }

    public void limparDadosDeletados(String username, String email, String cpf) {
        limparDadosDeletados(username, email, cpf, null);
    }

    public void limparDadosDeletados(String username, String email, String cpf, String farmDocument) {
        if (username != null && !username.isBlank()) {
            usuarioRepository.findByUsernameIgnoreCase(username).ifPresent(u -> {
                if (u.getDeletedAt() != null) renomearCamposUnicos(u);
            });
        }
        if (email != null && !email.isBlank()) {
            usuarioRepository.findByEmailIgnoreCase(email).ifPresent(u -> {
                if (u.getDeletedAt() != null) renomearCamposUnicos(u);
            });
        }
        if (cpf != null && !cpf.isBlank()) {
            usuarioRepository.findByCpf(cpf).ifPresent(u -> {
                if (u.getDeletedAt() != null) renomearCamposUnicos(u);
            });
        }
        if (farmDocument != null && !farmDocument.isBlank()) {
            usuarioRepository.findByFarmDocument(farmDocument).ifPresent(u -> {
                if (u.getDeletedAt() != null) renomearCamposUnicos(u);
            });
        }
    }

    private void renomearCamposUnicos(Usuario usuario) {
        String suffix = DELETED_SUFFIX + UUID.randomUUID().toString().substring(0, 5);
        
        String newUsername = usuario.getUsername();
        if (newUsername != null && !newUsername.contains(DELETED_SUFFIX)) {
            if (newUsername.length() > 85) newUsername = newUsername.substring(0, 85);
            usuario.setUsername(newUsername + suffix);
        }
        
        // Limpa email, CPF e documento da propriedade em contas deletadas para evitar conflitos e erros de validacao @Email/@CPF.
        usuario.setEmail(null);
        usuario.setCpf(null);
        usuario.setFarmDocument(null);
        if (usuario.getAddressCep() == null || usuario.getAddressCep().isBlank()) {
            usuario.setAddressCep("00000-000");
        }
        usuarioRepository.saveAndFlush(usuario);
    }
}