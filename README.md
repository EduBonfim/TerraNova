# 🌍 Projeto Terra Nova

> 🚧 **Status:** Em desenvolvimento ativo (Work in Progress) 🚧

O Terra Nova é um ecossistema digital e aplicativo mobile focado na economia circular e na transição agroecológica. O sistema funciona como um marketplace inteligente, conectando produtores que possuem passivos ambientais (como esterco, compostagem e resíduos de colheita) com agricultores que precisam corrigir e nutrir seus solos de forma econômica.

Mais do que uma plataforma de troca, o Terra Nova atua como uma **Plataforma ESG de Transição Agroecológica**, ajudando o homem do campo a reduzir custos operacionais e garantindo o compliance ambiental.

## 🚀 O Problema e a Solução

* **Dificuldade Financeira:** Os fertilizantes químicos possuem alto custo e reduzem a margem de lucro do pequeno agricultor.
* **Burocracia e Rastreabilidade:** Produtores que desejam fazer a transição para a agricultura orgânica têm dificuldade em encontrar bioinsumos locais que sejam aprovados pelo Ministério da Agricultura (MAPA). O uso de um insumo não rastreado pode fazer o produtor perder o selo orgânico.
* **Passivo Ambiental:** Fazendas (como aviários e pecuária) geram toneladas de resíduos orgânicos que, se mal descartados, geram multas ambientais.

Nossa solução faz a conexão logística e inteligente entre a carência nutricional de um solo e a abundância de resíduos orgânicos em fazendas vizinhas.

## ✨ Funcionalidades Principais (MVP)

* **Leitura Inteligente (Upload):** O produtor envia a foto do seu laudo de análise de solo. Nossa API usa uma IA para ler a imagem, extrair os dados técnicos do laudo (ex: "Falta Fósforo e Matéria Orgânica") e identificar a necessidade real daquela terra.
* **Match Logístico:** O app abre um mapa e mostra os fornecedores ou fazendas vizinhas que possuem exatamente o bioinsumo/resíduo orgânico necessário para aquela correção. A exibição geolocalizada busca insumos disponíveis num raio quilométrico delimitado.
* **Filtro de Compliance:** O banco de dados cruza a necessidade do solo com os insumos disponíveis na região, exibindo apenas aqueles que possuem registro no MAPA para uso orgânico.
* **Comunicação e Confiança:** Sistema de Mensageria (Chat) para comunicação direta entre comprador e vendedor. Inclui sistema de reviews e denúncias para garantir a qualidade do insumo, educação do vendedor e armazenamento correto.

## 🌱 Escopo Expandido (Roadmap)

* **Módulo "Seja Orgânico":** Trilha informativa guiando produtores convencionais sobre as etapas para obter o selo oficial (atuando como âncora de conhecimento, com avisos legais de que o app não emite o certificado).
* **Marketplace Secundário (B2B/B2C):** Permite que o produtor anuncie os frutos de sua colheita (hortaliças, ovos, leite) no mesmo perfil em que busca adubo, aumentando a retenção no app.

## 🛠️ Stack Tecnológico e Arquitetura (Em Produção)

Atualmente, o projeto está na fase de codificação e sendo construído com as seguintes tecnologias:

* **Front-end (Mobile):** O aplicativo já está sendo desenvolvido em **React Native**, com o foco em entregar uma interface simples para o homem do campo e suporte para uso offline-first.
* **Back-end (API REST):** A API robusta do sistema já está sendo construída em Java, utilizando o framework **Spring Boot**.
* **Banco de Dados:** PostgreSQL com a extensão PostGIS (crucial para as queries de cálculo de distância espacial do tipo "ache o insumo num raio de 20km"). Implementação de Pessimistic Locking para evitar que dois produtores reservem o mesmo lote simultaneamente.
* **Inteligência Artificial:** Integração via API com Google Gemini Vision ou OpenAI GPT-4 Vision para OCR inteligente dos laudos.
* **Integrações de Dados Externos:** Portal de Dados Abertos do MAPA (carga da base de insumos certificados) e API ReceitaWS (validação de CNPJ de fornecedores).
* **Mensageria:** Firebase Realtime Database (simplificando a comunicação em tempo real sem sobrecarregar o Spring Boot).

## ⚖️ Regras de Negócio e Gestão de Riscos

* **Transporte e Logística:** O app exibe um Termo de Aceite informando que o transporte de resíduos orgânicos exige carroceria vedada/lonada (Resolução Contran) e alerta sobre zonas de restrição de caminhões em horários comerciais.
* **Human-in-the-loop (Validação de IA):** Para evitar erros de leitura do laudo (ex: OCR confundir um número), o usuário deve confirmar os dados extraídos pela IA antes de o sistema realizar a busca no mapa.

## 💼 Modelo de Monetização

* **Taxa de Intermediação (Marketplace):** Pequeno percentual sobre as vendas de insumos e produtos agrícolas fechadas através da plataforma.
* **Assinatura Premium (SaaS):** Mensalidade para acesso a Relatórios de Rastreabilidade Automatizados. O app compila o histórico de tudo o que foi aplicado no solo e gera um dossiê pronto para os auditores de certificação orgânica.

---

### 🎓 Sobre o Projeto
Projeto desenvolvido como MVP acadêmico e submissão para a competição Empreenda Senac. O objetivo é criar uma interface simplificada para que o empreendedor agro tenha incentivo e facilidade para usar a ferramenta no campo.

**Autores:** 
Eduardo Domingues ([@EduBonfim](https://github.com/EduBonfim),
Kaike Felipe  ([@KaiqueFelipe](https://github.com/BigKaique),
Antonio Mikael ([@AntonioMikael](https://github.com/FSMikael)  
**Curso:** Análise e Desenvolvimento de Sistemas - Centro Universitário Senac SP
