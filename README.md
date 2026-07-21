# Projeto Terra Nova

> **Status:** Em desenvolvimento ativo (Work in Progress) - MVP Funcional (Offline-First)

O Terra Nova é um ecossistema digital e aplicativo mobile focado na economia circular e na transição agroecológica. O sistema funciona como um marketplace inteligente de duas vias: primeiro, conecta produtores que possuem passivos ambientais (como esterco, compostagem e resíduos de colheita) com agricultores que precisam corrigir e nutrir seus solos de forma econômica. Segundo, conecta esses mesmos agricultores ao **consumidor final**, permitindo a venda direta de produtos agroecológicos e orgânicos.

Mais do que uma plataforma de troca, o Terra Nova atua como uma **Plataforma ESG de Transição Agroecológica**, ajudando o homem do campo a reduzir custos operacionais, garantindo o compliance ambiental e aproximando o campo da mesa do consumidor.

## O Problema e a Solução

* **Dificuldade Financeira:** Os fertilizantes químicos possuem alto custo e reduzem a margem de lucro do pequeno agricultor.
* **Burocracia e Rastreabilidade:** Produtores que desejam fazer a transição para a agricultura orgânica têm dificuldade em encontrar bioinsumos locais aprovados pelo MAPA. O uso de um insumo não rastreado pode fazer o produtor perder o selo orgânico.
* **Passivo Ambiental:** Fazendas geram toneladas de resíduos orgânicos que, se mal descartados, geram multas ambientais.
* **Acesso do Consumidor:** Consumidores buscam alimentos saudáveis e rastreáveis, mas esbarram nos altos preços de supermercados e na desconexão com o produtor local.

Nossa solução resolve essas pontas: faz a conexão logística inteligente para a nutrição do solo com insumos de fazendas vizinhas e, simultaneamente, oferece uma vitrine B2C para que o produtor venda sua colheita diretamente ao consumidor final.

## Funcionalidades Principais (MVP Atual)

* **Leitura Inteligente (OCR Offline):** O produtor envia a foto do seu laudo de análise de solo. O app utiliza tecnologia OCR on-device (Tesseract.js) para ler a imagem, extrair os dados técnicos (ex: níveis de Fósforo, Nitrogênio, Potássio) e identificar a necessidade real daquela terra — tudo sem depender de internet.
* **Match Logístico e Compliance:** O app exibe fornecedores ou fazendas vizinhas que possuem exatamente o bioinsumo necessário.
* **Comunicação e Confiança (Chat):** Sistema de Mensageria interno para comunicação direta e fechamento de negócios. Inclui sistema de avaliações (reviews) para produtores e compradores.
* **Módulo "Seja Orgânico":** Trilha informativa ("Mundo Orgânico") guiando produtores convencionais sobre as etapas para obter o selo oficial.
* **Marketplace do Consumidor (B2C):** Módulo para o "Comprador" (consumidor final), que pode explorar hortaliças e produtos frescos, consultar o nível de saúde/transição daquela fazenda e comprar direto da fonte.
* **Gestão de Transações:** Painéis de "Minhas Compras" e "Minhas Vendas", onde produtores e consumidores gerenciam seu histórico por meio de cards expansíveis.
* **Onboarding Interativo:** Tutorial guiado passo a passo para facilitar a navegação e o primeiro uso por agricultores.

## Escopo Expandido (Roadmap)

* **Integração Backend Completa:** Conexão com a API robusta em Java (Spring Boot) e banco de dados PostgreSQL (PostGIS) para o cálculo geoespacial de distância online ("ache o insumo num raio de 20km") e sincronização em nuvem.
* **IA Avançada na Nuvem:** Integração futura com Google Gemini Vision ou OpenAI GPT-4 Vision para OCR de laudos de altíssima complexidade.
* **Integrações Externas:** Conexão direta com o Portal de Dados Abertos do MAPA e validação de CNPJ via ReceitaWS.

## Stack Tecnológico e Arquitetura

Atualmente, o projeto foca na validação da interface e experiência do usuário no campo, utilizando:

* **Front-end (Mobile):** **React Native** com **Expo Router**, construindo uma interface premium e com suporte nativo **Offline-First**.
* **Gestão de Estado e Persistência:** Uso extensivo de stores customizados e `AsyncStorage` para simular o banco de dados localmente, garantindo a operação do app mesmo sem conectividade (vital na zona rural).
* **Inteligência Artificial (OCR):** **Tesseract.js** (processamento local no dispositivo) para leitura gratuita e instantânea dos laudos agrícolas.
* **Design e UI:** Sistema de navegação moderno, mapas nativos (`react-native-maps`) e assistente de navegação iterativo (`react-native-copilot`).

## Regras de Negócio e Gestão de Riscos

* **Transporte e Logística:** O app exibe um Termo de Aceite informando que o transporte de resíduos orgânicos exige carroceria vedada/lonada (Resolução Contran).
* **Human-in-the-loop (Validação de IA):** O usuário sempre confirma os dados extraídos pelo OCR antes de o sistema realizar a busca e salvar a análise de solo.

## Modelo de Monetização

* **Taxa de Intermediação (Marketplace):** Pequeno percentual sobre as vendas de insumos fechadas através da plataforma.
* **Assinatura Premium (SaaS):** Mensalidade para acesso a Relatórios de Rastreabilidade Automatizados, gerando dossiês prontos para os auditores de certificação orgânica com base no histórico da conta.

---

### Sobre o Projeto

Projeto desenvolvido como MVP acadêmico e submissão para a competição Empreenda Senac. O objetivo é criar uma interface simplificada para que o empreendedor agro tenha incentivo e facilidade para usar a ferramenta no campo.

**Autores:**
Eduardo Domingues ([@EduBonfim](https://github.com/EduBonfim)),
Kaike Felipe ([@KaiqueFelipe](https://github.com/BigKaique)),
Antonio Mikael ([@AntonioMikael](https://github.com/FSMikael))
**Curso:** Análise e Desenvolvimento de Sistemas - Centro Universitário Senac SP
