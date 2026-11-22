package com.terranova.service;

import com.terranova.model.HistoricoConta;
import com.terranova.model.Usuario;
import com.terranova.repository.HistoricoContaRepository;
import com.terranova.repository.UsuarioRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class UsuarioCleanupService {

        private static final Logger log = LoggerFactory.getLogger(UsuarioCleanupService.class);
        private static final String PARAM_USER_ID = "userId";

    @PersistenceContext
    private EntityManager entityManager;

    private final UsuarioRepository usuarioRepository;
    private final HistoricoContaRepository historicoContaRepository;

    public UsuarioCleanupService(UsuarioRepository usuarioRepository, HistoricoContaRepository historicoContaRepository) {
        this.usuarioRepository = usuarioRepository;
        this.historicoContaRepository = historicoContaRepository;
    }

        /**
         * Executa diariamente a exclusao definitiva das contas marcadas ha mais de 30 dias.
         */
    @Scheduled(cron = "0 0 4 * * ?")
    @Transactional
    public void executarLimpezaDeContas() {
        LocalDateTime trintaDiasAtras = LocalDateTime.now().minusDays(30);
        
        List<Usuario> usuariosDeletados = usuarioRepository.findAll().stream()
                .filter(u -> u.getDeletedAt() != null && u.getDeletedAt().isBefore(trintaDiasAtras))
                .toList();

        for (Usuario usuario : usuariosDeletados) {
            UUID userId = usuario.getId();
            
            // Arquiva os dados essenciais da conta antes da remocao definitiva.
            HistoricoConta historico = new HistoricoConta();
            historico.setId(UUID.randomUUID());
            historico.setOriginalUserId(userId);
            historico.setUsername(usuario.getUsername());
            historico.setEmail(usuario.getEmail());
            historico.setCpf(usuario.getCpf());
            historico.setStatus("deletada");
            historico.setDeletedAt(LocalDateTime.now());
            
            historicoContaRepository.save(historico);
            
            // Remove registros dependentes com queries nativas para evitar consultas excessivas.
            entityManager.createNativeQuery("DELETE FROM itens_pedido WHERE produto_id IN (SELECT id FROM produtos WHERE vendedor_id = :userId)")
                    .setParameter(PARAM_USER_ID, userId).executeUpdate();

            entityManager.createNativeQuery("DELETE FROM itens_pedido WHERE pedido_id IN (SELECT id FROM pedidos WHERE comprador_id = :userId OR vendedor_id = :userId)")
                    .setParameter(PARAM_USER_ID, userId).executeUpdate();

            entityManager.createNativeQuery("DELETE FROM produtos WHERE vendedor_id = :userId")
                    .setParameter(PARAM_USER_ID, userId).executeUpdate();

            entityManager.createNativeQuery("DELETE FROM pedidos WHERE comprador_id = :userId OR vendedor_id = :userId")
                    .setParameter(PARAM_USER_ID, userId).executeUpdate();

            entityManager.createNativeQuery("DELETE FROM avaliacoes WHERE avaliado_id = :userId OR avaliador_id = :userId")
                    .setParameter(PARAM_USER_ID, userId).executeUpdate();

            entityManager.createNativeQuery("DELETE FROM mensagens WHERE remetente_id = :userId OR destinatario_id = :userId")
                    .setParameter(PARAM_USER_ID, userId).executeUpdate();

            entityManager.createNativeQuery("DELETE FROM notificacoes WHERE usuario_id = :userId")
                    .setParameter(PARAM_USER_ID, userId).executeUpdate();
                    
            entityManager.createNativeQuery("DELETE FROM relatorios_solo WHERE usuario_id = :userId")
                    .setParameter(PARAM_USER_ID, userId).executeUpdate();
                    
            entityManager.createNativeQuery("DELETE FROM lotes WHERE usuario_id = :userId")
                    .setParameter(PARAM_USER_ID, userId).executeUpdate();
                    
            entityManager.createNativeQuery("DELETE FROM carrinho WHERE comprador_id = :userId")
                    .setParameter(PARAM_USER_ID, userId).executeUpdate();

            entityManager.createNativeQuery("DELETE FROM certificados WHERE usuario_id = :userId")
                    .setParameter(PARAM_USER_ID, userId).executeUpdate();

            entityManager.createNativeQuery("DELETE FROM metricas_vendedor WHERE usuario_id = :userId")
                    .setParameter(PARAM_USER_ID, userId).executeUpdate();

            entityManager.createNativeQuery("DELETE FROM metricas_comprador WHERE usuario_id = :userId")
                    .setParameter(PARAM_USER_ID, userId).executeUpdate();

            entityManager.createNativeQuery("DELETE FROM seguidores WHERE follower_id = :userId OR producer_id = :userId")
                    .setParameter(PARAM_USER_ID, userId).executeUpdate();

            entityManager.createNativeQuery("DELETE FROM avisos_usuario WHERE usuario_id = :userId OR emitido_por = :userId")
                    .setParameter(PARAM_USER_ID, userId).executeUpdate();

            entityManager.createNativeQuery("DELETE FROM bloqueios_usuario WHERE usuario_id = :userId OR bloqueado_por = :userId")
                    .setParameter(PARAM_USER_ID, userId).executeUpdate();

            entityManager.createNativeQuery("DELETE FROM denuncias WHERE denunciante_id = :userId OR denunciado_id = :userId OR moderador_id = :userId")
                    .setParameter(PARAM_USER_ID, userId).executeUpdate();

            entityManager.createNativeQuery("DELETE FROM listings WHERE producer_id = :userId")
                    .setParameter(PARAM_USER_ID, userId).executeUpdate();

            entityManager.createNativeQuery("DELETE FROM insumos_disponiveis WHERE producer_id = :userId")
                    .setParameter(PARAM_USER_ID, userId).executeUpdate();

            // Remove definitivamente o usuario apos limpar os relacionamentos dependentes.
            usuarioRepository.delete(usuario);
            
            log.info("Usuario {} foi arquivado no cofre e removido definitivamente do sistema principal.", userId);
        }
    }
}
