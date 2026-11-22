package com.terranova.controller;

import com.terranova.dto.NoticiaDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.net.URL;
import java.net.URLConnection;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/noticias")
@Tag(name = "Notícias", description = "Endpoints para consumo de notícias (Agro e Consumidor)")
public class NoticiasController {

    @GetMapping("/agro")
    @Operation(summary = "Listar notícias para Produtores (G1 Agro)")
    public ResponseEntity<List<NoticiaDTO>> listarNoticiasAgro() {
        // Palavras-chave relevantes para o produtor
        List<String> keywords = java.util.Arrays.asList("agro", "agricultur", "safra", "rural", "campo", "pecuária", "fazenda", "colheita", "gado", "soja", "milho", "clima", "hortaliça", "vegetal", "plantio", "semente", "lavoura", "produtor");
        return ResponseEntity.ok(fetchRssNews("https://g1.globo.com/rss/g1/economia/agronegocios/", "G1 Agro", keywords));
    }

    @GetMapping("/consumidor")
    @Operation(summary = "Listar notícias para Consumidores (Receitas e Saúde)")
    public ResponseEntity<List<NoticiaDTO>> listarNoticiasConsumidor() {
        // Palavras-chave relevantes para o consumidor final
        List<String> keywords = java.util.Arrays.asList("receita", "alimentação", "saúde", "dieta", "bem-estar", "nutrição", "alimento", "culinária", "saudável", "gastronomia");
        return ResponseEntity.ok(fetchRssNews("https://g1.globo.com/rss/g1/saude/", "G1 Saúde e Bem-Estar", keywords));
    }

    private List<NoticiaDTO> fetchRssNews(String feedUrl, String fonteDefault, List<String> keywords) {
        List<NoticiaDTO> noticias = new ArrayList<>();
        try {
            URL url = new URL(feedUrl);
            URLConnection connection = url.openConnection();
            connection.setConnectTimeout(5000);
            connection.setReadTimeout(5000);
            connection.setRequestProperty("Accept-Encoding", "gzip");
            connection.setRequestProperty("User-Agent", "Mozilla/5.0");

            java.io.InputStream inputStream = connection.getInputStream();
            if ("gzip".equalsIgnoreCase(connection.getContentEncoding())) {
                inputStream = new java.util.zip.GZIPInputStream(inputStream);
            }

            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc = builder.parse(inputStream);

            int count = 0;
            NodeList items = doc.getElementsByTagName("item");
            for (int i = 0; i < items.getLength() && count < 10; i++) {
                Element element = (Element) items.item(i);

                String titulo = getTagValue("title", element);
                String descricao = getTagValue("description", element);

                
                if (keywords != null && !keywords.isEmpty()) {
                    String textoBusca = ((titulo != null ? titulo : "") + " " + (descricao != null ? descricao : "")).toLowerCase();
                    boolean containsKeyword = false;
                    for (String kw : keywords) {
                        if (textoBusca.contains(kw.toLowerCase())) {
                            containsKeyword = true;
                            break;
                        }
                    }
                    if (!containsKeyword) {
                        continue; 
                    }
                }

                String link = getTagValue("link", element);
                String data = getTagValue("pubDate", element);
                
                
                String imagemUrl = null;
                NodeList mediaContents = element.getElementsByTagName("media:content");
                if (mediaContents.getLength() > 0) {
                    imagemUrl = ((Element) mediaContents.item(0)).getAttribute("url");
                } else if (element.getElementsByTagName("enclosure").getLength() > 0) {
                    imagemUrl = ((Element) element.getElementsByTagName("enclosure").item(0)).getAttribute("url");
                }

                
                if (data != null && data.length() > 16) {
                    data = data.substring(5, 16); 
                }

                noticias.add(new NoticiaDTO(
                        UUID.randomUUID().toString(),
                        titulo,
                        fonteDefault,
                        link,
                        imagemUrl,
                        data != null ? data : "Hoje"
                ));
                count++;
            }
        } catch (Exception e) {
            System.err.println("Erro ao ler RSS de " + feedUrl + ": " + e.getMessage());
        }
        return noticias;
    }

    private String getTagValue(String tag, Element element) {
        NodeList nodeList = element.getElementsByTagName(tag);
        if (nodeList.getLength() > 0) {
            return nodeList.item(0).getTextContent();
        }
        return null;
    }
}
