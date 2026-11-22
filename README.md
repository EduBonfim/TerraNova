# 🌍 Projeto Terra Nova

> 🚧 **Status:** Em desenvolvimento ativo (Work in Progress) - MVP Funcional (Offline-First) 🚧

O Terra Nova é um ecossistema digital e aplicativo mobile focado na economia circular e no nicho de certificação orgânica e transição agroecológica. O sistema funciona como um marketplace inteligente de duas vias: primeiro, conecta produtores que possuem passivos ambientais aprovados para o manejo orgânico (como esterco maturado e compostagem) com agricultores que precisam corrigir seus solos e manter o compliance de seus selos. Segundo, conecta esses mesmos agricultores ao consumidor final, permitindo a venda direta e rastreável de produtos limpos.

Mais do que uma plataforma de troca, o Terra Nova atua como uma **Plataforma ESG de Transição Agroecológica**, ajudando o homem do campo a reduzir custos operacionais, garantindo o compliance ambiental exigido por auditores e aproximando o campo da mesa do consumidor.

---

## 🚀 O Problema e a Solução

* **Dificuldade Financeira:** Fertilizantes químicos possuem alto custo, são atrelados ao dólar e reduzem drasticamente a margem de lucro do pequeno agricultor.
* **Burocracia e Rastreabilidade (O Gargalo Orgânico):** Produtores que desejam atuar no nicho de orgânicos têm extrema dificuldade em encontrar bioinsumos locais devidamente rastreados. O uso de um insumo não rastreado resulta na perda imediata do selo orgânico pelo MAPA.
* **Passivo Ambiental:** Fazendas geram toneladas de resíduos que, se mal descartados, geram multas pesadas.
* **Acesso do Consumidor:** Consumidores buscam alimentos saudáveis, mas esbarram nos altos preços de supermercados e na desconexão com o produtor local.
* **Conectividade e Complexidade Agronômica:** A maior parte das propriedades rurais sofre com a ausência de sinal 4G/5G. Além disso, o pequeno produtor muitas vezes tem dificuldade técnica para interpretar laudos químicos complexos do seu próprio solo para saber exatamente o que precisa corrigir.

**A Solução Terra Nova:** Resolvemos essas pontas unindo inteligência artificial e logística. Nosso aplicativo utiliza IA que opera **100% offline** (sem depender de internet) para ler e interpretar laudos de solo direto da câmera do celular. A partir desse diagnóstico, realizamos um *match* geoespacial inteligente, viabilizando a troca de bioinsumos entre vizinhos de porteira e, simultaneamente, oferecemos uma vitrine B2C para o escoamento direto da colheita orgânica.

---

## ✨ Funcionalidades Principais (MVP Atual)

* **Leitura Inteligente (OCR Servidor):** O produtor fotografa o laudo de solo. O app envia a imagem para o servidor backend que extrai os dados técnicos (N, P, K, pH) via OCR, independente de conexão posterior.
* **Match Geoespacial e Logístico:** Apoiado por consultas radiais, o app exibe fornecedores num raio de até 20km que possuem exatamente o insumo orgânico necessário.
* **Fila de Sincronização (Offline Checkout):** Operações de compra possuem tempo de tolerância a falhas de rede. Os pedidos são enfileirados localmente e despachados em background assim que o celular detecta conexão.
* **Marketplace B2B/B2C (Multi-tenancy):** A interface e os recursos se adaptam automaticamente ao perfil (Produtor ou Consumidor), garantindo usabilidade limpa e ferramentas de gestão exclusivas para o administrador da fazenda.

---

## 🛠️ Arquitetura de Fluxo de Dados

Substituindo diagramas visuais por uma matriz de responsabilidade clara, o ecossistema distribui suas obrigações da seguinte forma:

| Camada / Componente | Tecnologias Chave | Responsabilidade Principal no Ecossistema |
| :--- | :--- | :--- |
| **Client Mobile (Frontend)** | React Native + Expo Router | Interface adaptativa (Multi-tenancy), captura de laudos e renderização de mapas. |
| **Banco Local (Device)** | AsyncStorage | Espinha dorsal Offline-First. Cache de sessões e fila assíncrona de compras. |
| **Edge AI Engine** | Servidor Backend OCR | Processamento de imagens de laudos com reconhecimento de padrões estruturados. |
| **Gateway & Security** | Java REST API + JWT | Interceptação de requests, validação de permissões por Role e proteção LGPD. |
| **Camada de Negócio** | Spring Boot (Services) | Validação atômica de concorrência de estoque e regras de transição do MAPA. |
| **Persistência Espacial** | PostgreSQL + PostGIS | Armazenamento corporativo e cálculo de proximidade geográfica (ST_DWithin). |

---

## 📱 Detalhamento das Bibliotecas (Raio-X Técnico)

### 1. O Coração do Aplicativo (Core)
* **react-native & expo:** Permite acesso a recursos nativos do dispositivo sem a complexidade de manter bases de código separadas para Android e iOS.
* **expo-router:** Gerencia o roteamento de telas baseado em arquivos (File-based routing), vital para a separação dos perfis `/(buyer)` e `/(producer)`.
* **@react-navigation/bottom-tabs:** Estrutura a navegação por abas inferiores de forma fluida.

### 2. Hardware e Sensores Nativos
* **expo-image-picker:** Captura em alta resolução os laudos físicos de solo diretamente da câmera para o OCR.
* **expo-location:** Acessa o GPS nativo para alimentar as consultas geoespaciais de vizinhos mais próximos.
* **expo-file-system & expo-sharing:** Utilizados para gerar, salvar e exportar os relatórios e planilhas em formato CSV e documentos para auditoria.

### 3. Interface, Animação e UX
* **react-native-maps:** Exibição visual de fornecedores parceiros através de pins no mapa.
* **react-native-copilot:** Cria os tutoriais passo a passo na primeira inicialização, garantindo acessibilidade para produtores de mais idade.
* **react-native-reanimated & react-native-screens:** Suspendem o processamento de telas em segundo plano e garantem interface estável a 60 FPS, poupando a bateria do aparelho no campo.

### 4. DevOps e Utilitários
* **expo-updates:** Permite a entrega de correções críticas Over-The-Air (OTA) sem passar pelo fluxo demorado das lojas de aplicativos.
* **docx:** Usado no ecossistema de relatórios para a montagem de históricos padronizados para auditores.

---

## 🔄 Caminhos Críticos de Execução (Runtime View)

Substituindo os diagramas sequenciais por rastreamentos lógicos passo a passo em formato de texto estruturado:

### 15.1 Ciclo do Comprador: Do Login ao Checkout Ativo
1. **Autenticação Segura:** O cliente insere as credenciais na tela de Login. A requisição dispara um `POST /api/v1/auth/login`. O Backend valida via hash BCrypt no banco e devolve um token JWT assinado (HS256).
2. **Roteamento por Perfil:** O `authStore.js` captura o token, identifica a Claim `Role=BUYER` e instrui o `expo-router` a montar unicamente a árvore de telas contida em `(buyer)`. O acesso a telas administrativas ou do produtor é bloqueado no client-side.
3. **Gerenciamento Reativo:** O comprador navega pelo catálogo e adiciona insumos orgânicos. O arquivo `cartStore.js` atualiza instantaneamente o estado global e a interface de forma reativa.
4. **Validação de Transação:** Ao clicar em "Finalizar Compra", o `ordersStore.js` injeta o token JWT no cabeçalho HTTP e faz o disparo para o endpoint `POST /api/v1/pedidos/checkout`.
5. **Isolamento de Concorrência:** O `JwtAuthenticationFilter` valida o token e entrega o payload limpo para o `PedidoService.java`. O sistema abre uma transação atômica no banco, verifica se há estoque, realiza o abatimento e grava os registros no PostgreSQL.
6. **Confirmação:** A API retorna o código `201 Created` junto com o UUID do pedido. O app limpa o carrinho local e exibe a confirmação de sucesso na interface.

### 15.2 Ciclo do Produtor: Do Scan do Laudo à Recomendação Ecológica
1. **Acionamento de Hardware:** O produtor acessa a aba de diagnóstico de solo e ativa a câmera através do `expo-image-picker`.
2. **Processamento em Servidor:** O buffer da foto tirada é enviado para o servidor backend. O engine OCR processa os pixels da imagem e extrai os padrões estruturados de nutrientes e pH do laudo de forma confiável.
3. **Higienização via Regex:** A string de texto bruto extraída do papel passa por filtros de Expressões Regulares estruturadas para capturar e isolar os indicadores de Nitrogênio (N), Fósforo (P), Potássio (K) e pH.
4. **Validação Humana:** Os indicadores extraídos são pré-preenchidos na tela `ExtractedDataForm.jsx`. O produtor faz o ajuste fino de qualquer caractere mal interpretado e confirma os dados.
5. **Regras de Negócio Orgânico:** O app cruza os índices químicos com as matrizes de recomendação ecológica integradas baseadas nas cartilhas do MAPA. Ele salva o relatório e as ações prescritas diretamente no AsyncStorage.
6. **Match Logístico:** Caso haja conexão ativa, o sistema realiza uma consulta espacial via PostGIS utilizando a função `ST_DWithin`. O mapa renderiza instantaneamente pins de fazendas parceiras num raio de até 20km que possuem o adubo natural exato para cobrir a deficiência daquele solo.

---

## ⚖️ Regras de Negócio e Compliance

* **Privacidade e LGPD:** Tratamento cuidadoso de laudos rurais privados. A base opera com deleção lógica (Soft Delete via `deleted_at`) para manter a integridade dos dados históricos de auditoria, além de mascaramento de dados sensíveis e controle de consentimento com `lgpd_terms_version`.
* **Regulamentação Logística:** Aceites documentados no app sobre a obrigatoriedade legal de lonar/vedar caminhões que transportam material biológico, conforme a Resolução do Contran.
* **Human-in-the-Loop:** A IA atua como assistente e nunca de forma arbitrária; os dados do OCR dependem da validação e edição manual do agricultor antes de se tornarem registros oficiais.

---

## 🧪 Estratégia de Qualidade (QA) e Observabilidade

* **Performance Mobile (Flashlight.dev):** Usamos o Flashlight para testar quedas de FPS (Frame Drops) e consumo de bateria do processo de OCR local em smartphones Android de entrada, garantindo que o app seja leve no dia a dia do campo.
* **Testes de Estresse (Apache JMeter):** Simulamos picos de requisições concorrentes de milhares de fazendas descarregando seus carrinhos do AsyncStorage síncronos assim que recuperam conexão, testando os limites do Spring Boot.
* **Telemetria Asíncrona (Sentry):** Crashs ou exceções no meio da lavoura são salvos localmente em disco. O log com o Stack Trace é transmitido para a equipe de engenharia em nuvem assim que o celular encontra sinal de rede.

---

## 🌱 RoadMap e Escalabilidade (Agro 4.0 e Hardware)

* **Integração de Equipamentos (IoT):** A próxima fase arquitetural envolve a leitura direta do solo sem papel. Sensores de NPK instalados na terra enviarão dados via protocolos de baixo consumo e longo alcance (BLE ou módulos LoRaWAN) direto para o painel do app, eliminando o papel.
* **Auditoria Contínua:** Integração de rotinas automatizadas no backend que cruzam os insumos utilizados pelo produtor com o Portal de Dados Abertos do Ministério da Agricultura, emitindo alertas imediatos se um produto comprometer o selo orgânico.

---

## 💼 Modelo de Monetização

* **Taxa de Intermediação B2B/B2C (Marketplace):** Micropercentual incidente sobre as transações financeiras fechadas dentro do aplicativo.
* **SaaS Agronômico:** Assinatura Premium oferecendo acesso a Dossiês de Rastreabilidade Automatizados (geração instantânea via docx/pdf), facilitando as auditorias para a emissão e manutenção do selo orgânico.

---

### 🎓 Sobre o Projeto
Projeto MVP desenvolvido para a competição Empreenda Senac, desenhado para solucionar dores logísticas e ambientais reais, provando que a tecnologia de ponta pode e deve chegar às mãos do trabalhador do campo.

**Engenharia e Desenvolvimento:** 
* Eduardo Domingues ([@EduBonfim](https://github.com/EduBonfim))
* Kaike Felipe ([@KaiqueFelipe](https://github.com/BigKaique))
* Antonio Mikael ([@AntonioMikael](https://github.com/FSMikael))

**Instituição:** Centro Universitário Senac SP  
**Curso:** Análise e Desenvolvimento de Sistemas (ADS)
