package com.terranova.service;

import com.terranova.repository.MensagemRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class MensagemCleanupService {

    private static final Logger log = LoggerFactory.getLogger(MensagemCleanupService.class);

    private final MensagemRepository mensagemRepository;

    public MensagemCleanupService(MensagemRepository mensagemRepository) {
        this.mensagemRepository = mensagemRepository;
    }

    /**
     * Executa diariamente a limpeza definitiva de mensagens com mais de 30 dias.
     */
    @Scheduled(cron = "0 0 3 * * ?")
    @Transactional
    public void limparMensagensAntigas() {
        LocalDateTime trintaDiasAtras = LocalDateTime.now().minusDays(30);
        
        try {
            mensagemRepository.deleteByCreatedAtBefore(trintaDiasAtras);
            log.info("Limpeza automatica de mensagens concluida. Mensagens anteriores a {} foram removidas.", trintaDiasAtras);
        } catch (Exception e) {
            log.warn("Erro ao tentar limpar mensagens antigas", e);
        }
    }
}
