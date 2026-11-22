package com.terranova.config;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.terranova.enums.StatusPedido;
import com.terranova.enums.StatusProduto;
import com.terranova.enums.UnidadeMedida;
import com.terranova.model.Avaliacao;
import com.terranova.model.Categoria;
import com.terranova.model.Certificacao;
import com.terranova.model.ItemPedido;
import com.terranova.model.Lote;
import com.terranova.model.Notificacao;
import com.terranova.model.Pedido;
import com.terranova.model.Produto;
import com.terranova.model.RelatorioSolo;
import com.terranova.model.SubCategoria;
import com.terranova.model.Usuario;
import com.terranova.model.InsumoDisponivel;
import com.terranova.model.Listing;
import com.terranova.model.MetricaVendedor;
import com.terranova.repository.InsumoDisponivelRepository;
import com.terranova.repository.ListingRepository;
import com.terranova.repository.MetricaVendedorRepository;
import com.terranova.repository.AvaliacaoRepository;
import com.terranova.repository.CategoriaRepository;
import com.terranova.repository.CertificacaoRepository;
import com.terranova.repository.LoteRepository;
import com.terranova.repository.NotificacaoRepository;
import com.terranova.repository.PedidoRepository;
import com.terranova.repository.ProdutoRepository;
import com.terranova.repository.RelatorioSoloRepository;
import com.terranova.repository.SubCategoriaRepository;
import com.terranova.repository.UsuarioRepository;

@Component
public class StartupDataInitializer implements ApplicationRunner {

    private record SeedProducer(String username, String fullName, String farmName, String cep, String email) {}

    private record SeedProduct(
            String id,
            String produto,
            String vendedorUsername,
            String preco,
            int estoqueValor,
            String categoria,
            String subcategoria,
            String loteCodigo,
            String tipoCertificacao,
            String numeroRegistro,
            String descricao,
            String foto
    ) {}
    private record SeedOrderItem(Produto produto, BigDecimal quantidade, BigDecimal precoUnitario) {}
    private static final Logger log = LoggerFactory.getLogger(StartupDataInitializer.class);
    private final UsuarioRepository usuarioRepository;
    private final CategoriaRepository categoriaRepository;
    private final ProdutoRepository produtoRepository;
    private final SubCategoriaRepository subCategoriaRepository;
    private final CertificacaoRepository certificacaoRepository;
    private final PedidoRepository pedidoRepository;
    private final NotificacaoRepository notificacaoRepository;
    private final RelatorioSoloRepository relatorioSoloRepository;

    private final AvaliacaoRepository avaliacaoRepository;
    private final ListingRepository listingRepository;
    private final InsumoDisponivelRepository insumoDisponivelRepository;
    private final MetricaVendedorRepository metricaVendedorRepository;

    private final LoteRepository loteRepository;

    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.demo-data:false}")
    private boolean seedDemoData;

    public StartupDataInitializer(UsuarioRepository usuarioRepository,
                                  CategoriaRepository categoriaRepository,
                                  ProdutoRepository produtoRepository,
                                  SubCategoriaRepository subCategoriaRepository,
                                  CertificacaoRepository certificacaoRepository,
                                  PedidoRepository pedidoRepository,
                                  NotificacaoRepository notificacaoRepository,
                                  RelatorioSoloRepository relatorioSoloRepository,
                                  AvaliacaoRepository avaliacaoRepository,
                                  LoteRepository loteRepository,
                                  PasswordEncoder passwordEncoder,
                                  ListingRepository listingRepository,
                                  InsumoDisponivelRepository insumoDisponivelRepository,
                                  MetricaVendedorRepository metricaVendedorRepository) {
        this.usuarioRepository = usuarioRepository;
        this.categoriaRepository = categoriaRepository;
        this.produtoRepository = produtoRepository;
        this.subCategoriaRepository = subCategoriaRepository;
        this.certificacaoRepository = certificacaoRepository;
        this.pedidoRepository = pedidoRepository;
        this.notificacaoRepository = notificacaoRepository;
        this.relatorioSoloRepository = relatorioSoloRepository;
        this.avaliacaoRepository = avaliacaoRepository;
        this.loteRepository = loteRepository;
        this.passwordEncoder = passwordEncoder;
        this.listingRepository = listingRepository;
        this.insumoDisponivelRepository = insumoDisponivelRepository;
        this.metricaVendedorRepository = metricaVendedorRepository;
    }

        @Override
        @Transactional
        public void run(ApplicationArguments args) {
            if (!seedDemoData) {
                log.info("Seed demo desativado por configuracao. Nenhum usuario de exemplo sera recriado.");
                return;
            }

            log.info("Sincronizando dados base migrados do frontend...");

            Usuario admin = ensureUser("Admin", "1234", "admin", "Administrador Terra Nova", "00000-000");
            admin.setLgpdAcceptedAt(admin.getLgpdAcceptedAt() == null ? LocalDateTime.now() : admin.getLgpdAcceptedAt());
            admin.setLgpdTermsVersion(admin.getLgpdTermsVersion() == null ? "2026.04" : admin.getLgpdTermsVersion());
            admin.setPendingLgpdReacceptance(admin.getPendingLgpdReacceptance() == null ? true : admin.getPendingLgpdReacceptance());
            admin.setEmail("admin@terranova.local");
            usuarioRepository.save(admin);

            Usuario produtorPrincipal = ensureUser("Sitio", "1234", "producer", "Sítio Esperança", "75903080");
            produtorPrincipal.setFarmName("Sítio Esperança");
            produtorPrincipal.setFarmDocumentType("cpf");
            produtorPrincipal.setFarmDocument("52998224725");
            produtorPrincipal.setCpf("52998224725");
            produtorPrincipal.setBio("Pioneiro no cultivo organico na regiao de Rio Verde, focado em biodiversidade e saude do solo.");
            produtorPrincipal.setAddressStreet("Rodovia GO-174");
            produtorPrincipal.setAddressNumber("Km 12");
            produtorPrincipal.setAddressNeighborhood("Córrego do Sapato");
            produtorPrincipal.setAddressCity("Rio Verde");
            produtorPrincipal.setAddressState("GO");
            
            // Verificacao e Localizacao
            produtorPrincipal.setIsCepValidated(true);
            produtorPrincipal.setIsGatePinConfirmed(true);
            produtorPrincipal.setLocationValidatedAt(LocalDateTime.now().minusMonths(3));
            produtorPrincipal.setProducerRole("Agricultor Familiar");
            produtorPrincipal.setFarmAddressReference("Entrada a esquerda apos o silo de graos");
            produtorPrincipal.setGateLatitude(new BigDecimal("-17.8015"));
            produtorPrincipal.setGateLongitude(new BigDecimal("-50.9108"));
            produtorPrincipal.setFarmPhotos(new ArrayList<>(Arrays.asList(
                "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80"
            )));

            produtorPrincipal.setLgpdAcceptedAt(produtorPrincipal.getLgpdAcceptedAt() == null ? LocalDateTime.now() : produtorPrincipal.getLgpdAcceptedAt());
            produtorPrincipal.setLgpdTermsVersion(produtorPrincipal.getLgpdTermsVersion() == null ? "2026.04" : produtorPrincipal.getLgpdTermsVersion());
            produtorPrincipal.setPendingLgpdReacceptance(false);
            produtorPrincipal.setEmail("sitio.esperanca@terranova.local");
            produtorPrincipal.setIsOrganicCertified(true);
            produtorPrincipal.setMapaRegistrationNumber("MAPA-2026-SITIO");
            usuarioRepository.save(produtorPrincipal);
            seedProducerProfile(produtorPrincipal);

            Usuario consumidor = usuarioRepository.findByUsernameIgnoreCase("Consumidor")
                .or(() -> usuarioRepository.findByCpf("11144477735"))
                .orElseGet(Usuario::new);
            consumidor.setUsername("Consumidor");
            consumidor.setPassword(passwordEncoder.encode("1234"));
            consumidor.setRole("buyer");
            consumidor.setFullName("Consumidor de Teste");
            consumidor.setAddressCep("00000-000");
            if (consumidor.getCreatedAt() == null) {
                consumidor.setCreatedAt(LocalDateTime.now());
            }
            consumidor.setUpdatedAt(LocalDateTime.now());
            consumidor.setEmail("consumidor@terranova.local");
            consumidor.setCpf("11144477735");
            consumidor.setBio("Consumidor cadastrado para validacao da integracao.");
            consumidor.setLgpdAcceptedAt(consumidor.getLgpdAcceptedAt() == null ? LocalDateTime.now() : consumidor.getLgpdAcceptedAt());
            consumidor.setLgpdTermsVersion(consumidor.getLgpdTermsVersion() == null ? "2026.04" : consumidor.getLgpdTermsVersion());
            consumidor.setPendingLgpdReacceptance(false);
            usuarioRepository.save(consumidor);

            List<SeedProducer> producers = List.of(
                    new SeedProducer("Sitio1", "Fazenda São João", "Fazenda São João", "75901-100", "fazenda.saojoao@terranova.local"),
                    new SeedProducer("Sitio2", "Sítio Vale Azul", "Sítio Vale Azul", "75901-200", "sitio.valeazul@terranova.local"),
                    new SeedProducer("Sitio3", "Sítio Nova Raiz", "Sítio Nova Raiz", "75901-300", "sitio.novaraiz@terranova.local"),
                    new SeedProducer("Sitio4", "Sítio Boa Terra", "Sítio Boa Terra", "75901-400", "sitio.boaterra@terranova.local"),
                    new SeedProducer("Sitio5", "Central Compostagem Comunitária", "Central Compostagem Comunitária", "75901-500", "central.compostagem@terranova.local")
            );

            Map<String, Usuario> sellers = new HashMap<>();
            sellers.put("Sitio", produtorPrincipal);
            for (SeedProducer seedProducer : producers) {
                sellers.put(seedProducer.username(), ensureProducer(seedProducer));
            }

            ensureCategoria("Mercado", "Categoria migrada do frontend");
            ensureCategoria("Cultivo", "Categoria migrada do frontend");

            seedFrontendProducts(sellers);
            seedOperationalData(admin, produtorPrincipal, consumidor);

            log.info("Seed sincronizado: admin={}, produtor={}, comprador={}, anuncios={}",
                    admin.getUsername(), produtorPrincipal.getUsername(), consumidor.getUsername(), produtoRepository.count());
        }

    private void seedOperationalData(Usuario admin, Usuario produtorPrincipal, Usuario consumidor) {
    // Produtos para testes
    Produto alface = findProdutoByLoteCodigo("SIT-ESP-ALF-001").orElse(null);
    Produto tomate = findProdutoByLoteCodigo("SIT-ESP-TOM-005").orElse(null);
    Produto cenoura = findProdutoByLoteCodigo("FAZ-SJO-CEN-009").orElse(null);
    Produto banana = findProdutoByLoteCodigo("FAZ-SJO-BAN-013").orElse(null);
    Produto vagem = findProdutoByLoteCodigo("FAZ-SJO-VAG-029").orElse(null);

    // Pedido 1 - Entregue
    if (alface != null && tomate != null) {
        seedPedido(
            "PED-2026-0001",
            alface.getVendedor(), // Vendedor: Sitio
            consumidor,
            List.of(
                new SeedOrderItem(tomate, BigDecimal.valueOf(2), new BigDecimal("45.00")),
                new SeedOrderItem(alface, BigDecimal.valueOf(3), new BigDecimal("12.00"))
            ),
            "Jadlog",
            "00000-000",
            "Rua das Flores",
            "99",
            "Centro",
            "Rio Verde",
            "GO",
            "Acompanha produção para a feira local"
        );

        seedAvaliacao(
            consumidor,
            alface.getVendedor(), // Avaliando o Sitio
            findPedidoByNumero("PED-2026-0001").orElse(null),
            alface,
            5,
            "Entrega rápida e produto com excelente padrao visual."
        );
    }

    // Pedido 2 - Entregue
    if (cenoura != null && banana != null && consumidor != null) {
        seedPedido(
            "PED-2026-0002",
            cenoura.getVendedor(),
            consumidor,
            List.of(
                new SeedOrderItem(cenoura, BigDecimal.valueOf(2), new BigDecimal("42.00")),
                new SeedOrderItem(banana, BigDecimal.valueOf(1), new BigDecimal("52.00"))
            ),
            "Correios",
            "00000-000",
            "Avenida Central",
            "145",
            "Centro",
            "Rio Verde",
            "GO",
            "Fruta deve ser armazenada em local fresco"
        );

        seedAvaliacao(
            consumidor,
            cenoura.getVendedor(),
            findPedidoByNumero("PED-2026-0002").orElse(null),
            banana,
            4,
            "Frutas bem maduras, chegou perfeito no prazo."
        );
    }

    // Pedido 3 - Em transito
    if (vagem != null && tomate != null && consumidor != null) {
        seedPedido(
            "PED-2026-0003",
            vagem.getVendedor(),
            consumidor,
            List.of(
                new SeedOrderItem(vagem, BigDecimal.valueOf(3), new BigDecimal("28.00")),
                new SeedOrderItem(tomate, BigDecimal.valueOf(1), new BigDecimal("110.00"))
            ),
            "Sedex",
            "00000-000",
            "Rua do Comercio",
            "55",
            "Bairro",
            "Rio Verde",
            "GO",
            "Solicitar entrega com cuidado"
        );
    }
    
    // Pedido 4 - Entregue na conta do SITIO param KPI
    if (tomate != null && consumidor != null) {
        seedPedido(
            "PED-2026-0004",
            tomate.getVendedor(), // Esse produto é do Sitio
            consumidor,
            List.of(
                new SeedOrderItem(tomate, BigDecimal.valueOf(5), new BigDecimal("100.00")),
                new SeedOrderItem(alface, BigDecimal.valueOf(10), new BigDecimal("50.00"))
            ),
            "Entrega Propria",
            "00000-000",
            "Rua das Flores",
            "99",
            "Centro",
            "Rio Verde",
            "GO",
            "Pedido extra para KPI"
        );
    }

    // Notificações para comprador
    if (consumidor != null && tomate != null) {
        seedNotificacao(
            consumidor,
            "Pedido confirmado",
            "Seu pedido PED-2026-0001 foi confirmado e está em separação.",
            "pedido",
            "/my-orders",
            "PED-2026-0001",
            false
        );
        seedNotificacao(
            consumidor,
            "Novo anúncio disponível",
            "O produtor Sitio publicou tomate cereja orgânico disponível para compra.",
            "marketplace",
            "/(buyer)/marketplace",
            tomate.getId().toString(),
            false
        );
        seedNotificacao(
            consumidor,
            "Pedido enviado",
            "Seu pedido PED-2026-0003 saiu para entrega! Acompanhe em Meu Carrinho.",
            "pedido",
            "/my-orders",
            "PED-2026-0003",
            false
        );
        seedNotificacao(
            consumidor,
            "Avaliacao pendente",
            "Voce pode avaliar sua compra da Central de Compostagem.",
            "pedido",
            "/ratings",
            "PED-2026-0001",
            true
        );
    }

    // Notificações para produtor principal
    if (produtorPrincipal != null) {
        seedNotificacao(
            produtorPrincipal,
            "Novo pedido recebido",
            "Voce recebeu um pedido de PED-2026-0001 do comprador.",
            "pedido",
            "/(producer)/sales-metrics",
            "PED-2026-0001",
            false
        );
        seedNotificacao(
            produtorPrincipal,
            "Laudo liberado",
            "Um novo laudo de solo foi publicado para a propriedade principal.",
            "laudo",
            "/soil-reports",
            "SOIL-2026-0001",
            true
        );
        seedNotificacao(
            produtorPrincipal,
            "Avaliacao recebida",
            "Voce recebeu uma avaliacao 5 estrelas! Parabens!",
            "avaliacao",
            "/(producer)/ratings",
            "AVL-2026-0001",
            false
        );
    }

    // Notificações para admin
    if (admin != null) {
        seedNotificacao(
            admin,
            "Relatorio de vendas",
            "Confira o relatorio de vendas do mês atual.",
            "admin",
            "/admin-sales",
            "RPT-2026-0001",
            false
        );
    }

    // Relatórios de solo - Produtor Principal
    if (produtorPrincipal != null) {
        seedRelatorioSolo(
            produtorPrincipal,
            LocalDate.now().minusDays(14),
            "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
            new BigDecimal("0.93"),
            new BigDecimal("6.4"),
            new BigDecimal("3.2"),
            new BigDecimal("18.5"),
            new BigDecimal("0.31"),
            new BigDecimal("7.9"),
            new BigDecimal("1.8"),
            new BigDecimal("0.04"),
            new BigDecimal("13.2"),
            new BigDecimal("62.5"),
            "Solo equilibrado, com boa matéria orgânica e pH adequado para hortaliças.",
            "Manter cobertura morta e reavaliar o talhão em 60 dias."
        );

        seedRelatorioSolo(
            produtorPrincipal,
            LocalDate.now().minusDays(7),
            "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1200&q=80",
            new BigDecimal("0.87"),
            new BigDecimal("5.8"),
            new BigDecimal("4.1"),
            new BigDecimal("22.3"),
            new BigDecimal("0.42"),
            new BigDecimal("8.5"),
            new BigDecimal("2.1"),
            new BigDecimal("0.08"),
            new BigDecimal("15.7"),
            new BigDecimal("71.2"),
            "Solo ligeiramente acido, necessita calagem para otimizar frutificacao.",
            "Aplicar calario agricola 2 ton/ha em 30 dias. Reavaliar em 45 dias."
        );
    }

    ensureAdminNotification(admin);
    }

    private void seedFrontendProducts(Map<String, Usuario> sellers) {
        List<SeedProduct> seedProducts = List.of(
                new SeedProduct("m1", "Alface Crespa Orgânica - 500g", "Sitio", "12,00", 20, "Mercado", "Hortaliças", "SIT-ESP-ALF-001", "Organico", "", "Alface crespa fresquinha, cultivada sem agrotóxicos e colhida no dia da entrega para garantir máxima crocância.", "https://cdn.pixabay.com/photo/2018/07/05/23/10/salad-3519389_1280.jpg"),
                new SeedProduct("m2", "Couve Manteiga Orgânica - 800g", "FazendaSaoJoao", "15,00", 15, "Mercado", "Hortaliças", "FAZ-SJO-COU-002", "Convencional", "", "", "https://cdn.pixabay.com/photo/2017/10/24/10/20/savoy-2884008_1280.jpg"),
                new SeedProduct("m3", "Rúcula Biodinâmica - 300g", "SitioValeAzul", "18,00", 25, "Mercado", "Hortaliças", "SIT-VAZ-RUC-003", "Organico", "", "", "https://cdn.pixabay.com/photo/2024/08/19/18/32/ai-generated-8981312_1280.jpg"),
                new SeedProduct("m4", "Espinafre Orgânico - 400g", "SitioNovaRaiz", "14,00", 22, "Mercado", "Hortaliças", "SIT-NRA-ESP-004", "Transicao", "", "", "https://cdn.pixabay.com/photo/2022/08/27/04/00/spinach-7413568_1280.jpg"),
                new SeedProduct("m5", "Tomate Cereja Orgânico - 15kg", "Sitio", "110,00", 30, "Mercado", "Frutas", "SIT-ESP-TOM-005", "Organico", "MAPA-2024-001", "", "https://cdn.pixabay.com/photo/2025/08/14/13/33/cherry-tomatoes-9774075_1280.jpg"),
                new SeedProduct("m6", "Tomate Caqui Orgânico - 12kg", "FazendaSaoJoao", "95,00", 18, "Mercado", "Frutas", "FAZ-SJO-TOM-006", "Organico", "MAPA-2024-001", "", "https://cdn.pixabay.com/photo/2016/02/17/19/26/tomato-1205699_1280.jpg"),
                new SeedProduct("m7", "Pimentão Vermelho Orgânico - 6kg", "SitioValeAzul", "78,00", 8, "Mercado", "Legumes", "SIT-VAZ-PIM-007", "Organico", "", "", "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=1200&q=80"),
                new SeedProduct("m8", "Abóbora Cabotiá Orgânica - 8kg", "SitioNovaRaiz", "65,00", 12, "Mercado", "Legumes", "SIT-NRA-ABO-008", "Organico", "", "", "https://cdn.pixabay.com/photo/2021/09/20/16/47/pumpkins-6641314_1280.jpg"),
                new SeedProduct("m9", "Cenoura Biodinâmica - 10kg", "FazendaSaoJoao", "42,00", 20, "Mercado", "Legumes", "FAZ-SJO-CEN-009", "Convencional", "", "", "https://cdn.pixabay.com/photo/2016/07/29/12/50/vegetable-1553195_1280.jpg"),
                new SeedProduct("m10", "Batata-Doce Orgânica - 8kg", "Sitio", "55,00", 16, "Mercado", "Legumes", "SIT-ESP-BAT-010", "Organico", "", "", "https://cdn.pixabay.com/photo/2017/01/12/23/49/sweetpotato-1975990_1280.jpg"),
                new SeedProduct("m11", "Mandioca Brava Orgânica - 12kg", "SitioValeAzul", "48,00", 14, "Mercado", "Legumes", "SIT-VAZ-MAN-011", "Organico", "", "", "https://cdn.pixabay.com/photo/2014/03/11/08/25/cassava-285033_1280.jpg"),
                new SeedProduct("m12", "Beterraba Orgânica - 6kg", "SitioNovaRaiz", "38,00", 18, "Mercado", "Legumes", "SIT-NRA-BET-012", "Convencional", "", "", "https://cdn.pixabay.com/photo/2015/03/24/08/52/beetroot-687251_1280.jpg"),
                new SeedProduct("m13", "Banana Prata Orgânica - 13kg", "FazendaSaoJoao", "52,00", 12, "Mercado", "Frutas", "FAZ-SJO-BAN-013", "Organico", "MAPA-2024-002", "", "https://cdn.pixabay.com/photo/2018/07/25/10/05/banana-3561020_1280.jpg"),
                new SeedProduct("m14", "Mamão Orgânico - 10kg", "Sitio", "65,00", 16, "Mercado", "Frutas", "SIT-ESP-MAM-014", "Organico", "", "", "https://cdn.pixabay.com/photo/2018/09/03/19/08/papaya-3652074_1280.jpg"),
                new SeedProduct("m15", "Laranja Pera Orgânica - 15kg", "SitioValeAzul", "58,00", 22, "Mercado", "Frutas", "SIT-VAZ-LAR-015", "Organico", "", "", "https://cdn.pixabay.com/photo/2014/05/30/04/57/kumquats-357895_1280.jpg"),
                new SeedProduct("m16", "Manjericão Fresco - 200g", "SitioNovaRaiz", "16,00", 28, "Mercado", "Hortaliças", "SIT-NRA-MAN-016", "Organico", "", "", "https://cdn.pixabay.com/photo/2014/12/30/11/12/basil-583816_1280.jpg"),
                new SeedProduct("m17", "Salsinha Orgânica - 150g", "FazendaSaoJoao", "12,00", 32, "Mercado", "Hortaliças", "FAZ-SJO-SAL-017", "Organico", "", "", "https://cdn.pixabay.com/photo/2020/05/12/22/23/parsley-5165150_1280.jpg"),
                new SeedProduct("c1", "Composto Orgânico Premium - 50kg", "CentralCompostagem", "45,00", 24, "Cultivo", "Insumos", "CCC-COM-PRE-001", "Organico", "", "", "https://cdn.pixabay.com/photo/2017/06/09/12/51/fresh-2386786_1280.jpg"),
                new SeedProduct("c2", "Composto Orgânico Peneirado - 50kg", "SitioBoaTerra", "52,00", 24, "Cultivo", "Insumos", "SIT-BTA-COM-002", "Organico", "", "", "https://cdn.pixabay.com/photo/2014/07/31/11/00/dung-406217_1280.jpg"),
                new SeedProduct("c3", "Húmus de Minhoca - 25kg", "SitioNovaRaiz", "40,00", 18, "Cultivo", "Insumos", "SIT-NRA-HUM-003", "Organico", "", "", "https://s2-globorural.glbimg.com/4LcCUuuU0RztXcREW3wCmaPOFg0=/0x0:780x440/984x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_afe5c125c3bb42f0b5ae633b58923923/internal_photos/bs/2022/k/c/zAenRTSdG2KasxoueiEQ/2018-04-19-thinkstockphotos-502037102.jpg"),
                new SeedProduct("c4", "Esterco Bovino Curtido - Ton", "Sitio", "90,00", 2, "Cultivo", "Insumos", "SIT-ESP-EST-004", "Organico", "", "", "https://cdn.pixabay.com/photo/2019/05/15/17/16/elster-4205481_1280.jpg"),
                new SeedProduct("c5", "Cama de Frango - Tonelada", "FazendaSaoJoao", "150,00", 12, "Cultivo", "Insumos", "FAZ-SJO-CAM-005", "Organico", "", "", "https://cdn.pixabay.com/photo/2017/06/17/17/44/machine-2412897_1280.jpg"),
                new SeedProduct("c6", "Cama de Aviário Curtida - Ton", "SitioValeAzul", "135,00", 9, "Cultivo", "Insumos", "SIT-VAZ-CAM-006", "Organico", "", "", "https://cdn.pixabay.com/photo/2025/06/05/08/50/hands-9642479_1280.jpg"),
                new SeedProduct("c7", "Bokashi Maturado - 20kg", "SitioNovaRaiz", "68,00", 10, "Cultivo", "Insumos", "SIT-NRA-BOK-007", "Organico", "", "", "https://images.tcdn.com.br/img/img_prod/665728/180_bokashi_adubo_organico_farelado_1kg_1147_1_3965615a3953ed00ecc5cad4aa8796b3.jpg"),
                new SeedProduct("c8", "Biofertilizante Líquido - 20L", "CentralCompostagem", "55,00", 5, "Cultivo", "Insumos", "CCC-BIO-LIQ-008", "Organico", "", "", "https://www.epagri.sc.gov.br/wp-content/uploads/2019/09/biofertilizante-receita-passo-a-passo-300x183.jpg"),
                new SeedProduct("c9", "Extrato de Algas - 5L", "FazendaSaoJoao", "42,00", 8, "Cultivo", "Insumos", "FAZ-SJO-ALA-009", "Organico", "", "", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3KtLbbLbhDcMw4hMAby9zuUZVVKOp-42kXA&s"),
                new SeedProduct("c10", "Chorume Vegetal - 20L", "Sitio", "38,00", 12, "Cultivo", "Insumos", "SIT-ESP-CHO-010", "Organico", "", "", "https://believe.earth/wp-content/uploads/2018/07/green-waste-pixabay-believeearth-1024x682.jpg"),
                new SeedProduct("c11", "Óleo de Neem Puro - 1L", "SitioValeAzul", "85,00", 6, "Cultivo", "Insumos", "SIT-VAZ-NEE-011", "Organico", "", "", "https://images.tcdn.com.br/img/img_prod/350075/repelente_oleo_de_neem_500ml_pronto_para_uso_vitaplan_combate_insetos_e_acaros_atua_no_controle_de_p_434_1_19eefbe8f4f73e5332dc662c691a10d8.jpg"),
                new SeedProduct("c12", "Calda Bordalesa - 500ml", "SitioNovaRaiz", "22,00", 15, "Cultivo", "Insumos", "SIT-NRA-CAL-012", "Organico", "", "", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTqoFXn8uZylaoTZNoytYjDfhmppuzrJjeRw&s"),
                new SeedProduct("c13", "Extrato de Alho/Pimenta - 1L", "FazendaSaoJoao", "28,00", 10, "Cultivo", "Insumos", "FAZ-SJO-ALP-013", "Organico", "", "", "https://static.vecteezy.com/ti/fotos-gratis/p1/9272822-pimenta-malagueta-quente-vermelha-e-alho-em-colher-de-pau-em-textura-cinza-pimenta-e-alho-sao-ingrediente-de-comida-thai-foto.jpg"),
                new SeedProduct("c14", "Sementes Crioulas - Variedade Mix", "Sitio", "35,00", 30, "Cultivo", "Sementes", "SIT-ESP-SEM-014", "Organico", "", "", "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80"),
                new SeedProduct("c15", "Mudas Orgânicas de Hortaliças", "SitioValeAzul", "2,50", 500, "Cultivo", "Sementes", "SIT-VAZ-MUD-015", "Organico", "", "", "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1200&q=80"),
                new SeedProduct("c16", "Bandejas de Germinação - 50 células", "CentralCompostagem", "15,00", 20, "Cultivo", "Sementes", "CCC-BAN-GER-016", "Convencional", "", "", "https://images.unsplash.com/photo-1492496913980-501348b61469?auto=format&fit=crop&w=1200&q=80"),
                new SeedProduct("c17", "Palhada Seca - 20kg", "SitioNovaRaiz", "18,00", 25, "Cultivo", "Insumos", "SIT-NRA-PAL-017", "Organico", "", "", "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1200&q=80"),
                new SeedProduct("c18", "Casca de Arroz - 30kg", "FazendaSaoJoao", "25,00", 15, "Cultivo", "Insumos", "FAZ-SJO-CAS-018", "Organico", "", "", "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80"),
                new SeedProduct("c19", "Fibra de Coco - 5kg", "Sitio", "32,00", 12, "Cultivo", "Insumos", "SIT-ESP-FIB-019", "Organico", "", "", "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1200&q=80"),
                new SeedProduct("m18", "Repolho Verde - 3kg", "FazendaSaoJoao", "22,00", 18, "Mercado", "Legumes", "FAZ-SJO-REP-018", "Organico", "", "", "https://cdn.pixabay.com/photo/2018/10/03/21/57/cabbage-3722498_1280.jpg"),
                new SeedProduct("m19", "Cebola Roxa Orgânica - 5kg", "SitioValeAzul", "35,00", 14, "Mercado", "Legumes", "SIT-VAZ-CEB-019", "Organico", "", "", "https://cdn.pixabay.com/photo/2015/08/21/15/56/onion-899102_1280.jpg"),
                new SeedProduct("m20", "Inhame Orgânico - 4kg", "SitioNovaRaiz", "48,00", 12, "Mercado", "Legumes", "SIT-NRA-INH-020", "Organico", "", "", "https://cdn.pixabay.com/photo/2017/10/07/09/44/taro-root-2825925_1280.jpg"),
                new SeedProduct("m21", "Melancia Orgânica - 5-7kg", "FazendaSaoJoao", "42,00", 16, "Mercado", "Frutas", "FAZ-SJO-MEL-021", "Organico", "", "", "https://cdn.pixabay.com/photo/2023/09/29/07/58/watermelon-8283269_1280.jpg"),
                new SeedProduct("m22", "Melão Orgânico - 2-3kg", "Sitio", "38,00", 20, "Mercado", "Frutas", "SIT-ESP-MLE-022", "Organico", "", "", "https://cdn.pixabay.com/photo/2018/05/27/16/30/melon-3433835_1280.jpg"),
                new SeedProduct("m23", "Abacaxi Orgânico - 2kg", "SitioValeAzul", "28,00", 14, "Mercado", "Frutas", "SIT-VAZ-ABA-023", "Organico", "", "", "https://cdn.pixabay.com/photo/2018/11/11/15/42/pineapple-3808963_1280.jpg"),
                new SeedProduct("m24", "Goiaba Vermelha Orgânica - 4kg", "SitioNovaRaiz", "32,00", 10, "Mercado", "Frutas", "SIT-NRA-GOI-024", "Organico", "", "", "https://cdn.pixabay.com/photo/2023/01/10/15/17/guava-7709978_1280.jpg"),
                new SeedProduct("m25", "Maracujá Orgânico - 3kg", "FazendaSaoJoao", "45,00", 8, "Mercado", "Frutas", "FAZ-SJO-MAR-025", "Organico", "", "", "https://cdn.pixabay.com/photo/2017/07/30/03/18/passion-fruit-2553389_1280.jpg"),
                new SeedProduct("m26", "Alecrim Fresco - 100g", "Sitio", "14,00", 26, "Mercado", "Hortaliças", "SIT-ESP-ALE-026", "Organico", "", "", "https://cdn.pixabay.com/photo/2020/06/04/14/52/rosemary-5259098_1280.jpg"),
                new SeedProduct("m27", "Tomilho Fresco - 80g", "SitioValeAzul", "12,00", 30, "Mercado", "Hortaliças", "SIT-VAZ-TOM-027", "Organico", "", "", "https://cdn.pixabay.com/photo/2013/06/01/03/07/thyme-115349_1280.jpg"),
                new SeedProduct("m28", "Pimenta Biquinho Orgânica - 500g", "SitioNovaRaiz", "22,00", 16, "Mercado", "Legumes", "SIT-NRA-PIB-028", "Organico", "", "", "https://cdn.pixabay.com/photo/2021/01/23/22/16/pepper-pout-5943834_1280.jpg"),
                new SeedProduct("m29", "Vagem Orgânica - 2kg", "FazendaSaoJoao", "28,00", 12, "Mercado", "Legumes", "FAZ-SJO-VAG-029", "Organico", "", "", "https://cdn.pixabay.com/photo/2024/06/12/14/38/broom-seed-capsule-8825612_1280.jpg"),
                new SeedProduct("m30", "Quiabo Orgânico - 1,5kg", "Sitio", "32,00", 14, "Mercado", "Legumes", "SIT-ESP-QUI-030", "Organico", "", "", "https://cdn.pixabay.com/photo/2017/09/19/09/06/lady-finger-2764615_1280.jpg"),
                new SeedProduct("c20", "Vermiculita Agrícola - 15kg", "SitioValeAzul", "48,00", 10, "Cultivo", "Insumos", "SIT-VAZ-VER-020", "Convencional", "", "", "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1200&q=80"),
                new SeedProduct("c21", "Perlita Agrícola - 10kg", "SitioNovaRaiz", "42,00", 12, "Cultivo", "Insumos", "SIT-NRA-PER-021", "Convencional", "", "", "https://images.unsplash.com/photo-1492496913980-501348b61469?auto=format&fit=crop&w=1200&q=80"),
                new SeedProduct("c22", "Turfa Orgânica - 20kg", "FazendaSaoJoao", "58,00", 8, "Cultivo", "Insumos", "FAZ-SJO-TUR-022", "Convencional", "", "", "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80"),
                new SeedProduct("c23", "Enraizador Natural - 500ml", "Sitio", "52,00", 6, "Cultivo", "Insumos", "SIT-ESP-ENR-023", "Organico", "", "", "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1200&q=80"),
                new SeedProduct("c24", "Pó de Rocha - 25kg", "SitioValeAzul", "65,00", 5, "Cultivo", "Insumos", "SIT-VAZ-PDR-024", "Organico", "", "", "https://images.unsplash.com/photo-1492496913980-501348b61469?auto=format&fit=crop&w=1200&q=80"),
                new SeedProduct("c25", "Calcário Agrícola - 30kg", "SitioNovaRaiz", "45,00", 8, "Cultivo", "Insumos", "SIT-NRA-CAL-025", "Organico", "", "", "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80"),
                new SeedProduct("c26", "Sulfato de Magnésio - 2kg", "FazendaSaoJoao", "35,00", 15, "Cultivo", "Insumos", "FAZ-SJO-SUL-026", "Organico", "", "", "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1200&q=80"),
                new SeedProduct("c27", "Ferro Quelato - 1kg", "Sitio", "48,00", 10, "Cultivo", "Insumos", "SIT-ESP-FER-027", "Organico", "", "", "https://images.unsplash.com/photo-1492496913980-501348b61469?auto=format&fit=crop&w=1200&q=80"),
                new SeedProduct("c28", "Ácido Bórico - 500g", "SitioValeAzul", "28,00", 12, "Cultivo", "Insumos", "SIT-VAZ-ACI-028", "Organico", "", "", "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80"),
                new SeedProduct("c29", "Nematoides Benéficos - Frasco", "SitioNovaRaiz", "95,00", 4, "Cultivo", "Insumos", "SIT-NRA-NEM-029", "Organico", "", "", "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1200&q=80"),
                new SeedProduct("c30", "Bacillus Thuringiensis - 200g", "FazendaSaoJoao", "72,00", 8, "Cultivo", "Insumos", "FAZ-SJO-BAC-030", "Organico", "", "", "https://images.unsplash.com/photo-1492496913980-501348b61469?auto=format&fit=crop&w=1200&q=80")
        );

        for (SeedProduct seed : seedProducts) {
            if (findProdutoByLoteCodigo(seed.loteCodigo()).isPresent()) {
                continue;
            }

            Usuario seller = sellers.computeIfAbsent(seed.vendedorUsername(), username ->
                    ensureProducer(new SeedProducer(username, seed.vendedorUsername(), seed.vendedorUsername(), "75900-999", username.toLowerCase(Locale.ROOT) + "@terranova.local")));

            Categoria categoria = ensureCategoria(seed.categoria(), "Categoria migrada do frontend");
            SubCategoria subCategoria = ensureSubCategoria(categoria, seed.subcategoria());
            Certificacao certificacao = ensureCertificacao(seed.tipoCertificacao());
            Lote lote = ensureLote(seed.loteCodigo(), seller, seed.produto(), categoria, BigDecimal.valueOf(seed.estoqueValor()), resolveUnidade(seed.produto()).getSimbolo());

            Produto produto = new Produto();
            produto.setNome(seed.produto());
            produto.setDescricao(seed.descricao().isBlank() ? null : seed.descricao());
            produto.setVendedor(seller);
            produto.setCategoria(categoria);
            produto.setSubCategoria(subCategoria);
            produto.setCertificacao(certificacao);
            produto.setLote(lote);
            produto.setNumeroRegistro(seed.numeroRegistro().isBlank() ? null : seed.numeroRegistro());
            produto.setPreco(parsePreco(seed.preco()));
            produto.setEstoque(BigDecimal.valueOf(seed.estoqueValor()));
            produto.setUnidade(resolveUnidade(seed.produto()));
            produto.setStatus(seed.estoqueValor() > 0 ? StatusProduto.ATIVO : StatusProduto.ESGOTADO);
            produto.setFotoUri(seed.foto());
            produto.setCreatedAt(LocalDateTime.now());
            produto.setUpdatedAt(LocalDateTime.now());

            produtoRepository.save(produto);
        }

        log.info("Migracao de anuncios concluida com {} itens.", seedProducts.size());
    }

    private void ensureAdminNotification(Usuario admin) {
        if (admin == null) {
            return;
        }

        boolean exists = notificacaoRepository.findAll().stream()
                .anyMatch(notificacao -> "Boas-vindas Terra Nova".equalsIgnoreCase(notificacao.getTitulo())
                        && notificacao.getUsuario() != null
                        && admin.getUsername().equalsIgnoreCase(notificacao.getUsuario().getUsername()));

        if (exists) {
            return;
        }

        Notificacao notificacao = new Notificacao();
        notificacao.setUsuario(admin);
        notificacao.setTitulo("Boas-vindas Terra Nova");
        notificacao.setDescricao("Os dados iniciais do Spring foram carregados com sucesso.");
        notificacao.setCategoria("sistema");
        notificacao.setRota("/admin/home");
        notificacao.setItemAlvoId("INIT-2026-0001");
        notificacao.setLida(false);
        notificacao.setCreatedAt(LocalDateTime.now().minusHours(1));
        notificacaoRepository.save(notificacao);
    }

    private Optional<Produto> findProdutoByLoteCodigo(String loteCodigo) {
        if (loteCodigo == null || loteCodigo.isBlank()) {
            return Optional.empty();
        }

        return produtoRepository.findAll().stream()
                .filter(produto -> produto.getLote() != null)
                .filter(produto -> loteCodigo.equalsIgnoreCase(produto.getLote().getCodigo()))
                .findFirst();
    }

    private Optional<Pedido> findPedidoByNumero(String numeroPedido) {
        if (numeroPedido == null || numeroPedido.isBlank()) {
            return Optional.empty();
        }
        return pedidoRepository.findByNumeroPedido(numeroPedido);
    }

    private void seedPedido(String numeroPedido,
                            Usuario vendedor,
                            Usuario comprador,
                            List<SeedOrderItem> items,
                            String transportadora,
                            String cep,
                            String street,
                            String number,
                            String neighborhood,
                            String city,
                            String state,
                            String observacoes) {
        if (vendedor == null || comprador == null || items == null || items.isEmpty()) {
            return;
        }

        if (pedidoRepository.findByNumeroPedido(numeroPedido).isPresent()) {
            return;
        }

        Pedido pedido = new Pedido();
        pedido.setNumeroPedido(numeroPedido);
        pedido.setVendedor(vendedor);
        pedido.setComprador(comprador);
        pedido.setStatus(StatusPedido.finalizado);
        pedido.setTransportadora(transportadora);
        pedido.setEnderecoEntregaCep(cep);
        pedido.setEnderecoEntregaStreet(street);
        pedido.setEnderecoEntregaNumber(number);
        pedido.setEnderecoEntregaNeighborhood(neighborhood);
        pedido.setEnderecoEntregaCity(city);
        pedido.setEnderecoEntregaState(state);
        pedido.setObservacoes(observacoes);
        pedido.setDataPedido(LocalDateTime.now().minusDays(3));
        pedido.setDataConfirmacao(LocalDateTime.now().minusDays(2));
        pedido.setDataEnvio(LocalDateTime.now().minusDays(1));
        pedido.setDataEntrega(LocalDateTime.now().minusHours(8));
        pedido.setCreatedAt(LocalDateTime.now().minusDays(3));
        pedido.setUpdatedAt(LocalDateTime.now());

        BigDecimal total = BigDecimal.ZERO;
        for (SeedOrderItem seedItem : items) {
            ItemPedido item = new ItemPedido();
            item.setPedido(pedido);
            item.setProduto(seedItem.produto());
            item.setQuantidade(seedItem.quantidade());
            item.setPrecoUnitario(seedItem.precoUnitario());
            item.setSubtotal(seedItem.quantidade().multiply(seedItem.precoUnitario()));
            pedido.getItens().add(item);
            total = total.add(item.getSubtotal());
        }

        pedido.setValorTotal(total);
        pedidoRepository.save(pedido);
    }

    private void seedNotificacao(Usuario usuario,
                                 String titulo,
                                 String descricao,
                                 String categoria,
                                 String rota,
                                 String itemAlvoId,
                                 boolean lida) {
        if (usuario == null) {
            return;
        }

        boolean exists = notificacaoRepository.findAll().stream().anyMatch(notificacao ->
                notificacao.getUsuario() != null
                        && usuario.getUsername().equalsIgnoreCase(notificacao.getUsuario().getUsername())
                        && titulo.equalsIgnoreCase(notificacao.getTitulo()));

        if (exists) {
            return;
        }

        Notificacao notificacao = new Notificacao();
        notificacao.setUsuario(usuario);
        notificacao.setTitulo(titulo);
        notificacao.setDescricao(descricao);
        notificacao.setCategoria(categoria);
        notificacao.setRota(rota);
        notificacao.setItemAlvoId(itemAlvoId);
        notificacao.setLida(lida);
        notificacao.setLidaEm(lida ? LocalDateTime.now().minusHours(2) : null);
        notificacao.setCreatedAt(LocalDateTime.now().minusDays(1));
        notificacaoRepository.save(notificacao);
    }

    private void seedRelatorioSolo(Usuario usuario,
                                   LocalDate dataAnalise,
                                   String imagemUri,
                                   BigDecimal confianca,
                                   BigDecimal ph,
                                   BigDecimal materiaOrganica,
                                   BigDecimal fosforo,
                                   BigDecimal potassio,
                                   BigDecimal calcio,
                                   BigDecimal magnesio,
                                   BigDecimal aluminio,
                                   BigDecimal ctc,
                                   BigDecimal vBase,
                                   String diagnostico,
                                   String recomendacoes) {
        if (usuario == null || dataAnalise == null) {
            return;
        }

        boolean exists = relatorioSoloRepository.findByUsuarioIdOrderByDataAnaliseDesc(usuario.getId()).stream()
                .anyMatch(relatorio -> dataAnalise.equals(relatorio.getDataAnalise()));

        if (exists) {
            return;
        }

        RelatorioSolo relatorio = new RelatorioSolo();
        relatorio.setUsuario(usuario);
        relatorio.setDataAnalise(dataAnalise);
        relatorio.setImagemUri(imagemUri);
        relatorio.setConfianca(confianca);
        relatorio.setPh(ph);
        relatorio.setMateriaOrganica(materiaOrganica);
        relatorio.setFosforo(fosforo);
        relatorio.setPotassio(potassio);
        relatorio.setCalcio(calcio);
        relatorio.setMagnesio(magnesio);
        relatorio.setAluminio(aluminio);
        relatorio.setCtc(ctc);
        relatorio.setVBase(vBase);
        relatorio.setDiagnostico(diagnostico);
        relatorio.setRecomendacoes(recomendacoes);
        relatorio.setCreatedAt(LocalDateTime.now().minusDays(14));
        relatorioSoloRepository.save(relatorio);
    }

    private void seedAvaliacao(Usuario avaliador,
                               Usuario avaliado,
                               Pedido pedido,
                               Produto produto,
                               Integer nota,
                               String comentario) {
        if (avaliador == null || avaliado == null || nota == null) {
            return;
        }

        boolean exists = avaliacaoRepository.findByAvaliadorId(avaliador.getId()).stream()
                .anyMatch(avaliacao -> avaliacao.getAvaliado() != null
                        && avaliado.getUsername().equalsIgnoreCase(avaliacao.getAvaliado().getUsername())
                        && ((pedido != null && avaliacao.getPedido() != null && pedido.getNumeroPedido().equalsIgnoreCase(avaliacao.getPedido().getNumeroPedido()))
                        || (produto != null && avaliacao.getProduto() != null && produto.getId().equals(avaliacao.getProduto().getId()))));

        if (exists) {
            return;
        }

        Avaliacao avaliacao = new Avaliacao();
        avaliacao.setAvaliador(avaliador);
        avaliacao.setAvaliado(avaliado);
        avaliacao.setPedido(pedido);
        avaliacao.setProduto(produto);
        avaliacao.setNota(nota);
        avaliacao.setComentario(comentario);
        avaliacao.setCreatedAt(LocalDateTime.now().minusDays(2));
        avaliacaoRepository.save(avaliacao);
    }

    private Usuario ensureProducer(SeedProducer seedProducer) {
        Usuario producer = ensureUser(seedProducer.username(), "1234", "producer", seedProducer.fullName(), seedProducer.cep());
        producer.setFarmName(seedProducer.farmName());
        producer.setIsOrganicCertified(false);
        producer.setFarmDocumentType("cnpj");
        producer.setAvatarUri(seedProducer.username().equalsIgnoreCase("Sitio") 
            ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
            : "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80");
        producer.setFarmDocument(null);
        producer.setCpf(null);
        producer.setEmail(seedProducer.email());
        producer.setBio("Produtor migrado automaticamente da populacao original do frontend.");
        producer.setAddressStreet("Zona Rural");
        producer.setAddressNumber("S/N");
        producer.setAddressNeighborhood("Area Rural");
        producer.setAddressCity("Rio Verde");
        producer.setAddressState("GO");
        
        // Ativando selos de verificacao e localizacao
        producer.setIsCepValidated(true);
        producer.setIsGatePinConfirmed(true);
        producer.setLocationValidatedAt(LocalDateTime.now().minusMonths(2));
        producer.setProducerRole("Agricultor Familiar");
        producer.setFarmAddressReference("Entrada principal apos a ponte de madeira");
        
        // Coordenadas ficticias proximas a Rio Verde
        double baseLat = -17.7915;
        double baseLon = -50.9208;
        double offset = (seedProducer.username().hashCode() % 100) / 1000.0;
        producer.setGateLatitude(BigDecimal.valueOf(baseLat + offset));
        producer.setGateLongitude(BigDecimal.valueOf(baseLon + offset));

        // Fotos da Fazenda
        if (seedProducer.username().equalsIgnoreCase("Sitio")) {
            producer.setFarmPhotos(new ArrayList<>(Arrays.asList(
                "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80"
            )));
        } else if (seedProducer.username().equalsIgnoreCase("FazendaSaoJoao")) {
            producer.setFarmPhotos(new ArrayList<>(Arrays.asList(
                "https://images.unsplash.com/photo-1518843875459-f738682238a6?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80"
            )));
        } else if (seedProducer.username().equalsIgnoreCase("SitioValeAzul")) {
            producer.setFarmPhotos(new ArrayList<>(Arrays.asList(
                "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1453749404628-eb2b4f30e3f2?auto=format&fit=crop&w=800&q=80"
            )));
        } else {
            producer.setFarmPhotos(new ArrayList<>(Arrays.asList(
                "https://images.unsplash.com/photo-1467020323557-13f1fc8e4c8e?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800&q=80"
            )));
        }

        producer.setLgpdAcceptedAt(producer.getLgpdAcceptedAt() == null ? LocalDateTime.now() : producer.getLgpdAcceptedAt());
        producer.setLgpdTermsVersion(producer.getLgpdTermsVersion() == null ? "2026.04" : producer.getLgpdTermsVersion());
        producer.setPendingLgpdReacceptance(false);
        Usuario saved = usuarioRepository.save(producer);
        
        seedProducerProfile(saved);
        return saved;
    }

    private void seedProducerProfile(Usuario producer) {
        // 1. Metricas
        if (metricaVendedorRepository.findByUsuarioIdAndMesAno(producer.getId(), LocalDate.now().withDayOfMonth(1)).isEmpty()) {
            MetricaVendedor metrica = new MetricaVendedor();
            metrica.setUsuario(producer);
            metrica.setMesAno(LocalDate.now().withDayOfMonth(1));
            metrica.setTotalPedidos(15 + (producer.getUsername().length() % 10));
            metrica.setTotalVendas(new BigDecimal("1250.00").add(BigDecimal.valueOf(producer.getUsername().length() * 10)));
            metrica.setMediaNota(new BigDecimal("4.8"));
            metrica.setTotalAvaliacoes(12 + (producer.getUsername().length() % 5));
            metricaVendedorRepository.save(metrica);
        }

        // 2. Listings (Comunidade)
        if (listingRepository.findByProducerId(producer.getId()).isEmpty()) {
            Listing l1 = new Listing();
            l1.setProducer(producer);
            l1.setTitle("Excedente de Sementes de Milho Crioulo");
            l1.setType("doacao");
            listingRepository.save(l1);

            Listing l2 = new Listing();
            l2.setProducer(producer);
            l2.setTitle("Venda de Mudas de Frutiferas");
            l2.setType("venda");
            l2.setPrice("R$ 15,00/unid");
            listingRepository.save(l2);
        }

        // 3. Insumos Disponiveis (Bioinsumos)
        if (insumoDisponivelRepository.findByProducerId(producer.getId()).isEmpty()) {
            InsumoDisponivel i1 = new InsumoDisponivel();
            i1.setProducer(producer);
            i1.setTitle("Biofertilizante de Esterco Bovino");
            i1.setAmount("500 litros");
            insumoDisponivelRepository.save(i1);

            InsumoDisponivel i2 = new InsumoDisponivel();
            i2.setProducer(producer);
            i2.setTitle("Composto Organico Maturado");
            i2.setAmount("2 toneladas");
            insumoDisponivelRepository.save(i2);
        }

        // 4. Relatorio de Solo (Qualidade e Fertilizantes)
        if (relatorioSoloRepository.findByUsuarioIdOrderByDataAnaliseDesc(producer.getId()).isEmpty()) {
            seedRelatorioSolo(
                producer,
                LocalDate.now().minusDays(30),
                "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80",
                new BigDecimal("0.90"),
                new BigDecimal("6.0"),
                new BigDecimal("2.8"),
                new BigDecimal("15.0"),
                new BigDecimal("0.25"),
                new BigDecimal("6.5"),
                new BigDecimal("1.5"),
                new BigDecimal("0.05"),
                new BigDecimal("12.0"),
                new BigDecimal("58.0"),
                "Solo com boa estrutura, mas necessita reposicao de fosforo.",
                "Aplicar fosfato natural 500kg/ha."
            );
        }
    }

    private Categoria ensureCategoria(String nome, String descricao) {
        return categoriaRepository.findByNomeIgnoreCase(nome)
                .orElseGet(() -> {
                    Categoria categoria = new Categoria();
                    categoria.setNome(nome);
                    categoria.setDescricao(descricao);
                    return categoriaRepository.save(categoria);
                });
    }

    private SubCategoria ensureSubCategoria(Categoria categoria, String nomeSubCategoria) {
        if (categoria == null || nomeSubCategoria == null || nomeSubCategoria.isBlank()) {
            return null;
        }

        return subCategoriaRepository.findByNomeIgnoreCaseAndCategoria_Id(nomeSubCategoria, categoria.getId())
                .orElseGet(() -> {
                    SubCategoria subCategoria = new SubCategoria();
                    subCategoria.setCategoria(categoria);
                    subCategoria.setNome(nomeSubCategoria);
                    subCategoria.setDescricao("Subcategoria migrada do frontend");
                    return subCategoriaRepository.save(subCategoria);
                });
    }

    private Certificacao ensureCertificacao(String tipo) {
        if (tipo == null || tipo.isBlank()) {
            return null;
        }

        return certificacaoRepository.findByTipoIgnoreCase(tipo)
                .orElseGet(() -> {
                    Certificacao certificacao = new Certificacao();
                    certificacao.setTipo(tipo);
                    certificacao.setDescricao("Certificacao migrada do frontend");
                    certificacao.setRequisitos("Migracao automatica inicial");
                    return certificacaoRepository.save(certificacao);
                });
    }

    private Lote ensureLote(String codigo, Usuario usuario, String produtoNome, Categoria categoria, BigDecimal quantidade, String unidade) {
        if (codigo == null || codigo.isBlank()) {
            return null;
        }

        return loteRepository.findByCodigoIgnoreCase(codigo)
                .map(existing -> updateLote(existing, usuario, produtoNome, categoria, quantidade, unidade))
                .orElseGet(() -> {
                    Lote lote = new Lote();
                    lote.setCodigo(codigo);
                    lote.setUsuario(usuario);
                    lote.setProdutoNome(produtoNome);
                    lote.setCategoria(categoria);
                    lote.setQuantidadeTotal(quantidade);
                    lote.setUnidade(unidade);
                    lote.setStatus("ativo");
                    lote.setDataCriacao(LocalDateTime.now().toLocalDate());
                    lote.setUpdatedAt(LocalDateTime.now());
                    return loteRepository.save(lote);
                });
    }

    private Lote updateLote(Lote lote, Usuario usuario, String produtoNome, Categoria categoria, BigDecimal quantidade, String unidade) {
        lote.setUsuario(usuario);
        lote.setProdutoNome(produtoNome);
        lote.setCategoria(categoria);
        lote.setQuantidadeTotal(quantidade);
        lote.setUnidade(unidade);
        lote.setUpdatedAt(LocalDateTime.now());
        return loteRepository.save(lote);
    }

    private BigDecimal parsePreco(String preco) {
        String normalized = preco.replace("R$", "").trim().replace(".", "").replace(",", ".");
        try {
            return new BigDecimal(normalized);
        } catch (NumberFormatException ex) {
            return BigDecimal.ZERO;
        }
    }

    private UnidadeMedida resolveUnidade(String produtoNome) {
        String normalized = normalize(produtoNome);
        if (normalized.contains("ml")) {
            return UnidadeMedida.MILILITRO;
        }
        if (normalized.contains(" l") || normalized.endsWith("l")) {
            return UnidadeMedida.LITRO;
        }
        if (normalized.contains("kg")) {
            return UnidadeMedida.QUILOGRAMA;
        }
        if (normalized.contains("g")) {
            return UnidadeMedida.GRAMA;
        }
        if (normalized.contains("saco") || normalized.contains("pacote")) {
            return UnidadeMedida.SACO;
        }
        return UnidadeMedida.UNIDADE;
    }

    private String normalize(String value) {
        return Normalizer.normalize(value == null ? "" : value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT);
    }

    private Usuario ensureUser(String username, String rawPassword, String role, String fullName, String addressCep) {
        Optional<Usuario> existing = usuarioRepository.findByUsernameIgnoreCase(username);
        Usuario usuario = existing.orElseGet(Usuario::new);
        usuario.setUsername(username);
        usuario.setPassword(passwordEncoder.encode(rawPassword));
        usuario.setRole(role);
        usuario.setFullName(fullName);
        usuario.setAddressCep(addressCep);
        if (usuario.getCreatedAt() == null) {
            usuario.setCreatedAt(LocalDateTime.now());
        }
        usuario.setUpdatedAt(LocalDateTime.now());
        return usuario;
    }
}