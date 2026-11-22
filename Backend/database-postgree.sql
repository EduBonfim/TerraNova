-- =============================================================================
-- TERRA NOVA - MODELAGEM DE BANCO DE DADOS
-- Sistema de Marketplace Agrícola com Certificação Orgânica
-- PostgreSQL VERSION
-- =============================================================================
-- Criação: 2026-04-14
-- Atualização: 2026-05-01 (Auditoria de alinhamento com frontend)
--   - Adicionados: block_messages, producer_role, farm_address_reference,
--     location_validated_at na tabela usuarios
--   - Status de pedidos alinhado com frontend: 'aguardando'|'transporte'|'finalizado'|'cancelado'
--   - Adicionado campo 'categoria' em pedidos (alimentos|insumos|sementes|cultivo)
--   - Novas tabelas: listings (anúncios comunidade), insumos_disponiveis
-- Banco: PostgreSQL 12+
-- =============================================================================

-- Criar extensão para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. USUARIOS (Users, Producers, Buyers, Admins)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'producer', -- 'producer' (produtor), 'buyer', 'admin'
    full_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    bio VARCHAR(500),
    avatar_uri VARCHAR(500),
    gender VARCHAR(20), -- 'male', 'female', 'other', 'prefer_not'
    cpf VARCHAR(20) UNIQUE, -- Apenas para compradores
    
    -- Dados do Produtor
    farm_name VARCHAR(255),
    farm_document VARCHAR(30),
    farm_document_type VARCHAR(10), -- 'cpf', 'cnpj'
    is_organic_certified BOOLEAN DEFAULT false,
    mapa_registration_number VARCHAR(100),
    
    -- Endereço
    address_cep VARCHAR(10),
    address_street VARCHAR(255),
    address_number VARCHAR(10),
    address_neighborhood VARCHAR(100),
    address_city VARCHAR(100),
    address_state VARCHAR(2),
    address_complement VARCHAR(255),
    
    -- Localização e Mídia do Perfil
    gate_latitude DECIMAL(10, 8),
    gate_longitude DECIMAL(11, 8),
    is_cep_validated BOOLEAN DEFAULT false,
    is_gate_pin_confirmed BOOLEAN DEFAULT false,
    location_validated_at TIMESTAMP, -- Data/hora em que a localização foi confirmada no mapa
    farm_photos TEXT[], -- Array de URIs de fotos da propriedade
    
    -- Perfil do Produtor na Comunidade
    producer_role VARCHAR(100), -- Ex: 'Agricultor Familiar', 'Cooperativa', 'Produtor Rural'
    farm_address_reference VARCHAR(255), -- Ponto de referência do portão/acesso
    
    -- Privacidade
    block_messages BOOLEAN DEFAULT false, -- Bloqueia recebimento de mensagens de outros usuários
    
    -- LGPD (Lei Geral de Proteção de Dados)
    lgpd_accepted_at TIMESTAMP,
    lgpd_terms_version VARCHAR(20),
    pending_lgpd_reacceptance BOOLEAN DEFAULT false,
    
    -- Termos de Uso (aceite no cadastro)
    terms_accepted_at TIMESTAMP,
    terms_version VARCHAR(20),
    
    -- Avaliações Bidirecional - Ratings Agregados
    media_avaliacao DECIMAL(3, 2) DEFAULT 0.00, -- Média de avaliações (1-5 stars)
    total_avaliacoes INT DEFAULT 0, -- Total de avaliações recebidas
    confiabilidade DECIMAL(3, 2) DEFAULT 0.00, -- Score de confiabilidade (1-5, baseado em consistência)
    
    -- Auditoria
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    CONSTRAINT chk_role CHECK (role IN ('producer', 'buyer', 'admin')),
    CONSTRAINT chk_gender CHECK (gender IS NULL OR gender IN ('male', 'female', 'other', 'prefer_not')),
    CONSTRAINT chk_doc_type CHECK (farm_document_type IS NULL OR farm_document_type IN ('cpf', 'cnpj'))
);

CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_cpf ON usuarios(cpf);
CREATE INDEX idx_usuarios_role ON usuarios(role);
CREATE INDEX idx_usuarios_username ON usuarios(username);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. CATEGORIAS DE PRODUTOS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS categorias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL UNIQUE, -- 'Mercado', 'Cultivo'
    descricao VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO categorias (nome, descricao) VALUES 
('Mercado', 'Produtos prontos para venda - Hortifruti, alimentos'),
('Cultivo', 'Insumos e itens relacionados à produção')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS subcategorias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    categoria_id UUID NOT NULL,
    nome VARCHAR(100) NOT NULL, -- 'Frutas', 'Hortaliças', 'Legumes', 'Grãos', 'Insumos', 'Sementes'
    descricao VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_subcategorias_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

CREATE INDEX idx_subcategorias_categoria ON subcategorias(categoria_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. CERTIFICACOES E CONFORMIDADE LEGAL
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS certificacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo VARCHAR(50) NOT NULL UNIQUE, -- 'Organico', 'Transicao', 'Convencional'
    descricao VARCHAR(500),
    requisitos TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO certificacoes (tipo, descricao) VALUES 
('Organico', 'Produzido sem agrotóxicos ou fertilizantes químicos sintéticos'),
('Transicao', 'Em processo de transição para produção orgânica'),
('Convencional', 'Produção convencional sem certificação específica')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS certificados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL,
    tipo_certificacao_id UUID NOT NULL,
    titulo VARCHAR(255), -- Nome de exibição amigável do certificado
    emissor VARCHAR(255), -- Órgão emissor (Ex: MAPA, SIPEAGRO)
    numero_registro VARCHAR(100), -- Número do MAPA ou órgão certificador
    data_emissao DATE,
    data_vencimento DATE,
    url_documento VARCHAR(500),
    status VARCHAR(50) DEFAULT 'em_analise', -- 'valido', 'em_analise', 'rejeitado', 'expirado'
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_certificados_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    CONSTRAINT fk_certificados_tipo FOREIGN KEY (tipo_certificacao_id) REFERENCES certificacoes(id),
    CONSTRAINT chk_status_cert CHECK (status IN ('valido', 'em_analise', 'rejeitado', 'expirado'))
);

CREATE INDEX idx_certificados_usuario ON certificados(usuario_id);
CREATE INDEX idx_certificados_status ON certificados(status);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. LOTES (Rastreabilidade - INC 02/2018)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS lotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(100) NOT NULL UNIQUE, -- Ex: TN-LOTE-2024-001
    usuario_id UUID NOT NULL,
    produto_nome VARCHAR(255) NOT NULL,
    categoria_id UUID,
    data_criacao DATE,
    data_colheita DATE,
    quantidade_total DECIMAL(10, 2),
    unidade VARCHAR(20), -- 'kg', 'unidade', 'maço', 'caixa', 'litro'
    localizacao VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ativo', -- 'ativo', 'finalizado', 'descartado'
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_lotes_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    CONSTRAINT fk_lotes_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id),
    CONSTRAINT chk_status_lote CHECK (status IN ('ativo', 'finalizado', 'descartado'))
);

CREATE INDEX idx_lotes_usuario ON lotes(usuario_id);
CREATE INDEX idx_lotes_codigo ON lotes(codigo);
CREATE INDEX idx_lotes_status ON lotes(status);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. PRODUTOS (Marketplace Opportunities)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS produtos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    vendedor_id UUID NOT NULL, -- Referência ao usuario (produtor)
    categoria_id UUID NOT NULL,
    subcategoria_id UUID,
    preco DECIMAL(10, 2) NOT NULL,
    estoque DECIMAL(10, 2) NOT NULL DEFAULT 0,
    unidade VARCHAR(20), -- 'kg', 'unidade', 'maço', 'caixa', 'litro'
    
    -- Imagens/Galeria
    foto_uri VARCHAR(500), -- Foto principal (snapshot)
    fotos_galeria TEXT[], -- Array de URIs para galeria (PostgreSQL array)
    
    -- Conformidade Legal
    lote_id UUID,
    tipo_certificacao_id UUID,
    numero_registro VARCHAR(100),
    
    -- Status
    status VARCHAR(50) DEFAULT 'ativo', -- 'ativo', 'esgotado', 'pausado', 'inativo'
    data_esgotado TIMESTAMP NULL,
    
    -- Auditoria
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    CONSTRAINT fk_produtos_vendedor FOREIGN KEY (vendedor_id) REFERENCES usuarios(id),
    CONSTRAINT fk_produtos_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id),
    CONSTRAINT fk_produtos_subcategoria FOREIGN KEY (subcategoria_id) REFERENCES subcategorias(id),
    CONSTRAINT fk_produtos_lote FOREIGN KEY (lote_id) REFERENCES lotes(id),
    CONSTRAINT fk_produtos_certificacao FOREIGN KEY (tipo_certificacao_id) REFERENCES certificacoes(id),
    CONSTRAINT chk_status_produto CHECK (status IN ('ativo', 'esgotado', 'pausado', 'inativo'))
);

CREATE INDEX idx_produtos_vendedor ON produtos(vendedor_id);
CREATE INDEX idx_produtos_categoria ON produtos(categoria_id);
CREATE INDEX idx_produtos_status ON produtos(status);
CREATE INDEX idx_produtos_created ON produtos(created_at);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. CARRINHO DE COMPRAS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS carrinho (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comprador_id UUID NOT NULL,
    produto_id UUID NOT NULL,
    quantidade DECIMAL(10, 2) NOT NULL,
    preco_unitario DECIMAL(10, 2) NOT NULL,
    data_adicao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_carrinho_comprador FOREIGN KEY (comprador_id) REFERENCES usuarios(id),
    CONSTRAINT fk_carrinho_produto FOREIGN KEY (produto_id) REFERENCES produtos(id),
    UNIQUE(comprador_id, produto_id)
);

CREATE INDEX idx_carrinho_comprador ON carrinho(comprador_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. PEDIDOS (Orders) E ITENS DO PEDIDO
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS pedidos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_pedido VARCHAR(50) NOT NULL UNIQUE,
    vendedor_id UUID NOT NULL, -- Mantido no pedido pois o carrinho restringe 1 produtor por vez
    comprador_id UUID NOT NULL,
    valor_total DECIMAL(10, 2) NOT NULL,
    
    -- Status do Pedido (Logística)
    -- Alinhado com o frontend: 'aguardando' | 'transporte' | 'finalizado' | 'cancelado'
    status VARCHAR(50) DEFAULT 'aguardando',
    
    -- Categoria do pedido (agrupamento usado no frontend)
    categoria VARCHAR(20), -- 'alimentos', 'insumos', 'sementes', 'cultivo'
    
    -- Transporte
    transportadora VARCHAR(255),
    tracking_numero VARCHAR(100),
    
    -- Snapshot do Endereço de Entrega
    endereco_entrega_cep VARCHAR(10),
    endereco_entrega_street VARCHAR(255),
    endereco_entrega_number VARCHAR(10),
    endereco_entrega_neighborhood VARCHAR(100),
    endereco_entrega_city VARCHAR(100),
    endereco_entrega_state VARCHAR(2),
    endereco_entrega_complement VARCHAR(255),
    
    -- Datas
    data_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_confirmacao TIMESTAMP,
    data_envio TIMESTAMP,
    data_entrega TIMESTAMP,
    
    -- Observações
    observacoes TEXT,
    
    -- Auditoria
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_pedidos_vendedor FOREIGN KEY (vendedor_id) REFERENCES usuarios(id),
    CONSTRAINT fk_pedidos_comprador FOREIGN KEY (comprador_id) REFERENCES usuarios(id),
    CONSTRAINT chk_status_pedido CHECK (status IN ('aguardando', 'transporte', 'finalizado', 'cancelado')),
    CONSTRAINT chk_categoria_pedido CHECK (categoria IS NULL OR categoria IN ('alimentos', 'insumos', 'sementes', 'cultivo'))
);

CREATE INDEX idx_pedidos_vendedor ON pedidos(vendedor_id);
CREATE INDEX idx_pedidos_comprador ON pedidos(comprador_id);
CREATE INDEX idx_pedidos_status ON pedidos(status);
CREATE INDEX idx_pedidos_data ON pedidos(data_pedido);

CREATE TABLE IF NOT EXISTS itens_pedido (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pedido_id UUID NOT NULL,
    produto_id UUID,
    quantidade DECIMAL(10, 2) NOT NULL,
    preco_unitario DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    
    CONSTRAINT fk_itens_pedido_pedido FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    CONSTRAINT fk_itens_pedido_produto FOREIGN KEY (produto_id) REFERENCES produtos(id)
);

CREATE INDEX idx_itens_pedido_pedido ON itens_pedido(pedido_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. AUDITORIA DE TRANSIÇÕES DE ESTADO DOS PEDIDOS (Order State History)
-- ─────────────────────────────────────────────────────────────────────────────
-- Registra cada mudança de status de um pedido para compliance e debugging
-- Permite rastrear quem, quando e por que um pedido mudou de status
-- Exemplo: AGUARDANDO → TRANSPORTE (Vendedor confirmou envio)

CREATE TABLE IF NOT EXISTS order_state_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pedido_id UUID NOT NULL,
    status_anterior VARCHAR(50) NOT NULL,
    status_novo VARCHAR(50) NOT NULL,
    mudado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    mudado_por UUID NOT NULL,
    motivo VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_order_state_history_pedido FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    CONSTRAINT fk_order_state_history_usuario FOREIGN KEY (mudado_por) REFERENCES usuarios(id),
    CONSTRAINT chk_status_anterior CHECK (status_anterior IN ('aguardando', 'transporte', 'finalizado', 'cancelado')),
    CONSTRAINT chk_status_novo CHECK (status_novo IN ('aguardando', 'transporte', 'finalizado', 'cancelado'))
);

CREATE INDEX idx_order_state_history_pedido ON order_state_history(pedido_id);
CREATE INDEX idx_order_state_history_mudado_em ON order_state_history(mudado_em);
CREATE INDEX idx_order_state_history_status ON order_state_history(status_novo);

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. RELATÓRIOS DE SOLO (Soil Analysis)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS relatorios_solo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL,
    data_analise DATE NOT NULL,
    imagem_uri VARCHAR(500),
    confianca DECIMAL(3, 2), -- 0.00 a 1.00
    
    -- Métricas de Solo
    ph NUMERIC(38, 2),
    materia_organica NUMERIC(38, 2),
    fosforo NUMERIC(38, 2),
    potassio NUMERIC(38, 2),
    calcio NUMERIC(38, 2),
    magnesio NUMERIC(38, 2),
    aluminio NUMERIC(38, 2),
    ctc NUMERIC(38, 2),
    v_base NUMERIC(38, 2),
    
    -- Diagnóstico
    diagnostico TEXT, -- JSON ou texto com diagnósticos
    recomendacoes TEXT,
    
    -- Auditoria
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_relatorios_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE INDEX idx_relatorios_usuario ON relatorios_solo(usuario_id);
CREATE INDEX idx_relatorios_data ON relatorios_solo(data_analise);

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. RATINGS/AVALIAÇÕES
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS avaliacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    avaliador_id UUID NOT NULL,
    avaliado_id UUID NOT NULL,
    pedido_id UUID,
    produto_id UUID, -- Opcional: permite avaliar um produto específico
    tipo_avaliacao VARCHAR(50) NOT NULL CHECK (tipo_avaliacao IN ('COMPRADOR_AVALIA_PRODUTOR', 'PRODUTOR_AVALIA_COMPRADOR')),
    nota INT NOT NULL,
    comentario VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_avaliacoes_avaliador FOREIGN KEY (avaliador_id) REFERENCES usuarios(id),
    CONSTRAINT fk_avaliacoes_avaliado FOREIGN KEY (avaliado_id) REFERENCES usuarios(id),
    CONSTRAINT fk_avaliacoes_pedido FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
    CONSTRAINT fk_avaliacoes_produto FOREIGN KEY (produto_id) REFERENCES produtos(id),
    CONSTRAINT chk_nota CHECK (nota >= 1 AND nota <= 5)
);

CREATE INDEX idx_avaliacoes_avaliado ON avaliacoes(avaliado_id);
CREATE INDEX idx_avaliacoes_avaliador ON avaliacoes(avaliador_id);
CREATE INDEX idx_avaliacoes_pedido ON avaliacoes(pedido_id);
CREATE INDEX idx_avaliacoes_produto ON avaliacoes(produto_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 10. MENSAGENS/CHAT
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS mensagens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    remetente_id UUID NOT NULL,
    destinatario_id UUID NOT NULL,
    assunto VARCHAR(255),
    conteudo TEXT NOT NULL,
    lida BOOLEAN DEFAULT false,
    lida_em TIMESTAMP NULL,
    
    -- Relacionado a
    pedido_id UUID,
    produto_id UUID,
    
    -- Auditoria
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_mensagens_remetente FOREIGN KEY (remetente_id) REFERENCES usuarios(id),
    CONSTRAINT fk_mensagens_destinatario FOREIGN KEY (destinatario_id) REFERENCES usuarios(id),
    CONSTRAINT fk_mensagens_pedido FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
    CONSTRAINT fk_mensagens_produto FOREIGN KEY (produto_id) REFERENCES produtos(id)
);

CREATE INDEX idx_mensagens_remetente ON mensagens(remetente_id);
CREATE INDEX idx_mensagens_destinatario ON mensagens(destinatario_id);
CREATE INDEX idx_mensagens_lida ON mensagens(lida);

-- ─────────────────────────────────────────────────────────────────────────────
-- 11. NOTIFICAÇÕES
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS notificacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(50), -- 'pedidos', 'ofertas', 'compras', 'produtos', 'vendas', 'laudo', 'certificado', 'chat', 'alerta'
    rota VARCHAR(255), -- Rota de navegação
    item_alvo_id VARCHAR(100), -- ID do item relacionado
    lida BOOLEAN DEFAULT false,
    lida_em TIMESTAMP NULL,
    
    -- Auditoria
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notificacoes_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    CONSTRAINT chk_categoria_notif CHECK (categoria IS NULL OR categoria IN ('pedidos', 'ofertas', 'compras', 'produtos', 'vendas', 'laudo', 'certificado', 'chat', 'alerta'))
);

CREATE INDEX idx_notificacoes_usuario ON notificacoes(usuario_id);
CREATE INDEX idx_notificacoes_lida ON notificacoes(lida);
CREATE INDEX idx_notificacoes_created ON notificacoes(created_at);

-- ─────────────────────────────────────────────────────────────────────────────
-- 12. ANÁLISES E MÉTRICAS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS metricas_vendedor (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL,
    total_pedidos INT DEFAULT 0,
    total_vendas DECIMAL(15, 2) DEFAULT 0,
    media_nota DECIMAL(3, 2),
    total_avaliacoes INT DEFAULT 0,
    mes_ano DATE NOT NULL,
    CONSTRAINT fk_metricas_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    UNIQUE(usuario_id, mes_ano)
);

CREATE TABLE IF NOT EXISTS metricas_comprador (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL,
    total_pedidos INT DEFAULT 0,
    total_gasto DECIMAL(15, 2) DEFAULT 0,
    mes_ano DATE NOT NULL,
    CONSTRAINT fk_metricas_comprador FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    UNIQUE(usuario_id, mes_ano)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 13. DENÚNCIAS (Reports)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS denuncias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    denunciante_id UUID NOT NULL,
    denunciado_id UUID,
    produto_id UUID,
    pedido_id UUID,
    categoria VARCHAR(50), -- 'comportamento', 'fraude', 'conteudo_inapropriado', 'outro'
    motivo VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    evidencia_uri VARCHAR(500),
    status VARCHAR(50) DEFAULT 'pendente', -- 'pendente', 'em_analise', 'resolvido', 'descartado'
    
    -- Resolução
    moderador_id UUID,
    acao_tipo VARCHAR(50), -- 'aviso', 'bloqueio', 'bloqueio_temporario', 'nenhum'
    acao_detalhes TEXT,
    bloqueio_dias INT,
    resolvido_em TIMESTAMP NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_denuncias_denunciante FOREIGN KEY (denunciante_id) REFERENCES usuarios(id),
    CONSTRAINT fk_denuncias_denunciado FOREIGN KEY (denunciado_id) REFERENCES usuarios(id),
    CONSTRAINT fk_denuncias_moderador FOREIGN KEY (moderador_id) REFERENCES usuarios(id),
    CONSTRAINT fk_denuncias_produto FOREIGN KEY (produto_id) REFERENCES produtos(id),
    CONSTRAINT fk_denuncias_pedido FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
    CONSTRAINT chk_status_denuncia CHECK (status IN ('pendente', 'em_analise', 'resolvido', 'descartado'))
);

CREATE INDEX idx_denuncias_denunciante ON denuncias(denunciante_id);
CREATE INDEX idx_denuncias_denunciado ON denuncias(denunciado_id);
CREATE INDEX idx_denuncias_status ON denuncias(status);

-- ─────────────────────────────────────────────────────────────────────────────
-- 14. PENALIDADES (Warnings e Blocks)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS avisos_usuario (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL,
    denuncia_id UUID, -- Denúncia que originou o aviso
    motivo TEXT NOT NULL,
    emitido_por UUID, -- Moderador
    status VARCHAR(20) DEFAULT 'ativo', -- 'ativo', 'removido'
    emitido_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_avisos_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    CONSTRAINT fk_avisos_denuncia FOREIGN KEY (denuncia_id) REFERENCES denuncias(id),
    CONSTRAINT fk_avisos_moderador FOREIGN KEY (emitido_por) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS bloqueios_usuario (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL,
    denuncia_id UUID,
    motivo TEXT NOT NULL,
    bloqueado_por UUID,
    bloqueado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expira_em TIMESTAMP NULL, -- NULL para permanente
    status VARCHAR(20) DEFAULT 'ativo', -- 'ativo', 'removido'
    CONSTRAINT fk_bloqueios_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    CONSTRAINT fk_bloqueios_denuncia FOREIGN KEY (denuncia_id) REFERENCES denuncias(id),
    CONSTRAINT fk_bloqueios_moderador FOREIGN KEY (bloqueado_por) REFERENCES usuarios(id)
);

CREATE INDEX idx_bloqueios_usuario ON bloqueios_usuario(usuario_id);
CREATE INDEX idx_bloqueios_status ON bloqueios_usuario(status);

-- ─────────────────────────────────────────────────────────────────────────────
-- 15. LISTINGS DA COMUNIDADE (Anúncios de Venda e Doação)
-- Equivalente ao campo 'listings' em communityStore.ts (CommunityProfile)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    producer_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(10) NOT NULL, -- 'venda', 'doacao'
    price VARCHAR(50), -- Texto livre, ex: 'R$ 110,00' ou NULL para doação
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_listings_producer FOREIGN KEY (producer_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT chk_listings_type CHECK (type IN ('venda', 'doacao'))
);

CREATE INDEX idx_listings_producer ON listings(producer_id);
CREATE INDEX idx_listings_type ON listings(type);

-- ─────────────────────────────────────────────────────────────────────────────
-- 16. INSUMOS DISPONÍVEIS (Bioinsumos oferecidos por produtores)
-- Equivalente ao campo 'insumos' em communityStore.ts (CommunityProfile)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS insumos_disponiveis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    producer_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    amount VARCHAR(100) NOT NULL, -- Texto livre, ex: '2 toneladas', '600 kg'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_insumos_producer FOREIGN KEY (producer_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX idx_insumos_producer ON insumos_disponiveis(producer_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- VIEWS ÚTEIS
-- ─────────────────────────────────────────────────────────────────────────────

-- Vista: Produtos com informações do vendedor
CREATE OR REPLACE VIEW v_produtos_detalhado AS
SELECT 
    p.id,
    p.nome,
    p.descricao,
    p.preco,
    p.estoque,
    p.unidade,
    p.status,
    u.username AS vendedor,
    u.farm_name,
    c.nome AS categoria,
    sc.nome AS subcategoria,
    cert.tipo AS tipo_certificacao,
    p.created_at
FROM produtos p
LEFT JOIN usuarios u ON p.vendedor_id = u.id
LEFT JOIN categorias c ON p.categoria_id = c.id
LEFT JOIN subcategorias sc ON p.subcategoria_id = sc.id
LEFT JOIN certificacoes cert ON p.tipo_certificacao_id = cert.id
WHERE p.deleted_at IS NULL;

-- Vista: Pedidos com resumo
CREATE OR REPLACE VIEW v_pedidos_resumo AS
SELECT 
    ped.id,
    ped.numero_pedido,
    u_vendedor.username AS vendedor,
    u_comprador.username AS comprador,
    ped.valor_total,
    ped.status,
    ped.data_pedido,
    ped.transportadora,
    ped.endereco_entrega_city,
    ped.endereco_entrega_state,
    COUNT(ip.id) AS quantidade_itens
FROM pedidos ped
LEFT JOIN usuarios u_vendedor ON ped.vendedor_id = u_vendedor.id
LEFT JOIN usuarios u_comprador ON ped.comprador_id = u_comprador.id
LEFT JOIN itens_pedido ip ON ped.id = ip.pedido_id
GROUP BY 
    ped.id, ped.numero_pedido, u_vendedor.username, u_comprador.username, 
    ped.valor_total, ped.status, ped.data_pedido, ped.transportadora,
    ped.endereco_entrega_city, ped.endereco_entrega_state;

-- Vista: Itens do pedido detalhado
CREATE OR REPLACE VIEW v_itens_pedido_detalhado AS
SELECT 
    ip.id AS item_id,
    ped.numero_pedido,
    prod.nome AS produto,
    ip.quantidade,
    ip.preco_unitario,
    ip.subtotal,
    ped.status AS pedido_status
FROM itens_pedido ip
JOIN pedidos ped ON ip.pedido_id = ped.id
JOIN produtos prod ON ip.produto_id = prod.id;

-- Vista: Usuários ativos com resumo
CREATE OR REPLACE VIEW v_usuarios_resumo AS
SELECT 
    u.id,
    u.username,
    u.role,
    u.full_name,
    u.farm_name,
    u.email,
    COUNT(DISTINCT CASE WHEN ped.vendedor_id = u.id THEN ped.id END) AS total_vendas,
    COUNT(DISTINCT CASE WHEN ped.comprador_id = u.id THEN ped.id END) AS total_compras,
    u.created_at
FROM usuarios u
LEFT JOIN pedidos ped ON u.id = ped.vendedor_id OR u.id = ped.comprador_id
WHERE u.deleted_at IS NULL
GROUP BY u.id, u.username, u.role, u.full_name, u.farm_name, u.email, u.created_at;

-- =============================================================================
-- FIM DA MODELAGEM
-- =============================================================================
