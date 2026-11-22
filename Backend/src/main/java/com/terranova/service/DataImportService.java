package com.terranova.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.terranova.data.InitialDataSet;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;


@Service
public class DataImportService {

    private static final Logger log = LoggerFactory.getLogger(DataImportService.class);

    private final ObjectMapper objectMapper;

    public DataImportService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    /**
     * Lê um arquivo JSON do classpath e converte seu conteudo para InitialDataSet.
     */
    public InitialDataSet loadDataFromJson(String filename) throws IOException {
        try (InputStream inputStream = new ClassPathResource(filename).getInputStream()) {
            InitialDataSet dataSet = objectMapper.readValue(inputStream, InitialDataSet.class);
            log.info("✓ Dados carregados de {}", filename);
            return dataSet;
        } catch (IOException e) {
            log.warn(" Arquivo {} não encontrado. Usando dados padrão.", filename);
            throw e;
        }
    }

    /**
     * Faz uma validacao basica para garantir a presenca das estruturas minimas do dataset.
     */
    public boolean validateDataSet(InitialDataSet dataSet) {
        if (dataSet == null) return false;
        
        boolean valid = true;
        
        if (dataSet.getUsuarios() == null || dataSet.getUsuarios().isEmpty()) {
            log.warn("  Nenhum usuário definido");
            valid = false;
        }
        
        if (dataSet.getCategorias() == null || dataSet.getCategorias().isEmpty()) {
            log.warn("  Nenhuma categoria definida");
            valid = false;
        }

        return valid;
    }

}
