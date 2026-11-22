/**
 * Documentos legais exibidos no cadastro (Termos de Uso e Política de Privacidade).
 *
 * Estrutura: cada seção tem `title` e `paragraphs`. Parágrafos iniciados com
 * "• " são renderizados como itens de lista.
 *
 * As versões (TERMS_OF_USE_VERSION / LGPD_TERMS_VERSION) ficam em
 * "@/services/authStore" e são enviadas ao backend junto com o aceite.
 * Sempre que o texto abaixo mudar de forma relevante, incremente a versão
 * correspondente (e a constante equivalente no backend).
 */

export const DPO_EMAIL = "dpo@terranova.com.br";

export const TERMS_OF_USE_DOCUMENT = {
  title: "Termos de Uso",
  intro:
    "CONTRATO DE ADESÃO AOS TERMOS DE USO DA PLATAFORMA TERRA NOVA\n\nLeia com atenção. Ao clicar em \"Aceito\" ao final deste documento, você (USUÁRIO) declara ter lido, compreendido e concordado integralmente com todas as cláusulas abaixo, que passam a regular a relação entre você e a plataforma Terra Nova (PLATAFORMA).",
  sections: [
    {
      title: "CLÁUSULA 1ª – DO OBJETO",
      paragraphs: [
        "1.1. A PLATAFORMA é um aplicativo que aproxima produtores rurais agroecológicos (PRODUTORES) e consumidores (COMPRADORES), oferecendo recursos de anúncios, pedidos, mensagens, avaliações, mapa de insumos locais, apoio informativo por inteligência artificial e rastreabilidade de produção.",
        "1.2. A PLATAFORMA atua exclusivamente como intermediadora tecnológica. Ela não vende, não armazena, não transporta e não fiscaliza os produtos anunciados, e não é parte do contrato de compra e venda firmado entre PRODUTOR e COMPRADOR.",
      ],
    },
    {
      title: "CLÁUSULA 2ª – DA LEGISLAÇÃO APLICÁVEL",
      paragraphs: [
        "2.1. Este contrato é regido pela legislação brasileira, em especial:",
        "• Lei nº 10.406/2002 (Código Civil), que disciplina a validade dos contratos e a manifestação de vontade por meio eletrônico (art. 104 e art. 107);",
        "• Lei nº 8.078/1990 (Código de Defesa do Consumidor – CDC) e Decreto nº 7.962/2013 (Comércio Eletrônico), nas relações de consumo;",
        "• Lei nº 12.965/2014 (Marco Civil da Internet), que estabelece direitos e deveres no uso da internet no Brasil;",
        "• Lei nº 13.709/2018 (Lei Geral de Proteção de Dados – LGPD), quanto ao tratamento de dados pessoais;",
        "• Lei nº 10.831/2003 e Decreto nº 6.323/2007, que regulam a produção e a comercialização de produtos orgânicos;",
        "• Instrução Normativa Conjunta nº 02/2018 (MAPA/ANVISA), sobre rastreabilidade na cadeia produtiva de produtos vegetais frescos;",
        "• Lei nº 7.802/1989 (Lei dos Agrotóxicos), quanto à oferta de insumos agrícolas sujeitos a registro e receituário;",
        "• Lei nº 9.610/1998 (Direitos Autorais), quanto aos conteúdos publicados.",
      ],
    },
    {
      title: "CLÁUSULA 3ª – DO CADASTRO E DA CONTA",
      paragraphs: [
        "3.1. Para usar a PLATAFORMA, o USUÁRIO deve ser pessoa com plena capacidade civil (maior de 18 anos ou emancipado, nos termos do art. 5º do Código Civil) e fornecer dados verdadeiros, completos e atualizados.",
        "3.2. O CPF ou CNPJ informado identifica o USUÁRIO de forma única. É vedado manter mais de uma conta para o mesmo documento ou usar dados de terceiros.",
        "3.3. O USUÁRIO é o único responsável pela guarda de sua senha e por todas as ações realizadas em sua conta, devendo comunicar imediatamente qualquer uso não autorizado.",
        "3.4. A PLATAFORMA pode solicitar a confirmação de dados e documentos sempre que necessário para prevenir fraudes ou cumprir obrigações legais.",
      ],
    },
    {
      title: "CLÁUSULA 4ª – DAS OBRIGAÇÕES DO PRODUTOR",
      paragraphs: [
        "4.1. O PRODUTOR se obriga a:",
        "• anunciar apenas produtos que efetivamente possua ou produza, com descrição, quantidade, unidade, preço e fotos verdadeiros;",
        "• cumprir a legislação sanitária, de rotulagem e de segurança dos alimentos aplicável aos produtos que oferece;",
        "• utilizar a expressão \"orgânico\" somente se estiver certificado ou regularmente cadastrado nos termos da Lei nº 10.831/2003 e do Decreto nº 6.323/2007;",
        "• manter os registros de rastreabilidade exigidos pela Instrução Normativa Conjunta nº 02/2018, quando aplicável à sua atividade;",
        "• não ofertar produtos ou insumos cuja comercialização dependa de registro, receituário ou autorização que não possua, conforme a Lei nº 7.802/1989 e demais normas aplicáveis;",
        "• honrar os pedidos aceitos, informando de imediato o COMPRADOR em caso de indisponibilidade.",
        "4.2. O PRODUTOR responde, perante o COMPRADOR e perante as autoridades, pela qualidade, procedência, quantidade e conformidade dos produtos que anuncia e entrega.",
      ],
    },
    {
      title: "CLÁUSULA 5ª – DAS OBRIGAÇÕES DO COMPRADOR",
      paragraphs: [
        "5.1. O COMPRADOR se obriga a:",
        "• informar endereço e dados de contato corretos para entrega ou retirada;",
        "• efetuar o pagamento na forma combinada com o PRODUTOR;",
        "• receber ou retirar o pedido nas condições acordadas, conferindo o produto no ato do recebimento;",
        "• agir com boa-fé, respeito e lealdade nas negociações e nas avaliações que publicar.",
      ],
    },
    {
      title: "CLÁUSULA 6ª – DA COMPRA E VENDA, ENTREGA E DIREITOS DO CONSUMIDOR",
      paragraphs: [
        "6.1. A compra e venda é celebrada diretamente entre PRODUTOR e COMPRADOR. Preço, prazo, forma de pagamento e de entrega são de responsabilidade das partes envolvidas.",
        "6.2. Nas relações de consumo, ficam assegurados ao COMPRADOR os direitos previstos no CDC, incluindo o direito de arrependimento em até 7 (sete) dias, contados do recebimento do produto, nas compras realizadas fora do estabelecimento comercial (art. 49 do CDC), ressalvadas as hipóteses legais aplicáveis.",
        "6.3. Havendo vício de qualidade ou quantidade do produto, aplicam-se os arts. 18 e seguintes do CDC, e os prazos de reclamação do art. 26 (30 dias para produtos não duráveis).",
        "6.4. Nenhuma cláusula deste contrato afasta ou limita direitos que a legislação consumerista considera irrenunciáveis (art. 25 do CDC).",
      ],
    },
    {
      title: "CLÁUSULA 7ª – DA CONDUTA, AVALIAÇÕES E COMUNIDADE",
      paragraphs: [
        "7.1. É proibido publicar conteúdo ilegal, falso, enganoso, ofensivo, discriminatório, que incite violência ou que viole direitos de terceiros, bem como praticar fraude, assédio, spam ou manipulação de avaliações.",
        "7.2. As avaliações devem refletir uma experiência real de compra ou venda. A PLATAFORMA pode remover avaliações e conteúdos que violem estes Termos.",
        "7.3. O USUÁRIO pode denunciar condutas e conteúdos inadequados pelos canais disponíveis no aplicativo.",
      ],
    },
    {
      title: "CLÁUSULA 8ª – DA MODERAÇÃO, ADVERTÊNCIA, SUSPENSÃO E BANIMENTO",
      paragraphs: [
        "8.1. Em caso de violação destes Termos ou da lei, a PLATAFORMA poderá, conforme a gravidade e a reincidência, aplicar advertência, remover conteúdos, suspender temporariamente ou banir definitivamente a conta, sem prejuízo de medidas judiciais cabíveis.",
        "8.2. Como forma de evitar a reincidência e proteger a comunidade, o documento (CPF/CNPJ) vinculado a uma conta banida poderá ser mantido em registro histórico, com base no exercício regular de direitos e no legítimo interesse da PLATAFORMA (art. 7º, incisos VI e IX, da LGPD), impedindo novo cadastro.",
        "8.3. Sempre que possível, o USUÁRIO será informado do motivo da medida aplicada e poderá apresentar contestação ao canal de suporte.",
      ],
    },
    {
      title: "CLÁUSULA 9ª – DOS RECURSOS DE INTELIGÊNCIA ARTIFICIAL E INFORMAÇÕES AGRONÔMICAS",
      paragraphs: [
        "9.1. As recomendações, análises e conteúdos gerados por inteligência artificial ou apresentados em áreas informativas (como notícias e indicadores) têm caráter meramente orientativo e não substituem a avaliação de engenheiro agrônomo, técnico responsável ou autoridade competente.",
        "9.2. O USUÁRIO é responsável pelas decisões que tomar com base nessas informações.",
      ],
    },
    {
      title: "CLÁUSULA 10ª – DA PROPRIEDADE INTELECTUAL",
      paragraphs: [
        "10.1. A marca, o layout, o código e os demais elementos da PLATAFORMA pertencem à Terra Nova ou a seus licenciantes e são protegidos pela legislação de propriedade intelectual.",
        "10.2. Ao publicar fotos, textos e demais conteúdos, o USUÁRIO declara ser titular dos direitos ou ter autorização para tal e concede à PLATAFORMA licença gratuita, não exclusiva e limitada ao necessário para exibir esse conteúdo no aplicativo.",
      ],
    },
    {
      title: "CLÁUSULA 11ª – DA LIMITAÇÃO DE RESPONSABILIDADE",
      paragraphs: [
        "11.1. A PLATAFORMA empenha-se em manter o serviço disponível e seguro, mas não garante funcionamento ininterrupto, podendo haver indisponibilidades por manutenção, falhas de terceiros ou casos fortuitos e de força maior.",
        "11.2. Observados os limites da lei, a PLATAFORMA não responde por negociações, pagamentos, entregas e pela qualidade dos produtos tratados diretamente entre USUÁRIOS, nem por danos decorrentes de informações falsas fornecidas por eles.",
        "11.3. Permanece a responsabilidade da PLATAFORMA nas hipóteses em que a lei não admite sua exclusão.",
      ],
    },
    {
      title: "CLÁUSULA 12ª – DA PROTEÇÃO DE DADOS PESSOAIS",
      paragraphs: [
        "12.1. O tratamento de dados pessoais realizado pela PLATAFORMA segue a LGPD e está detalhado na Política de Privacidade, documento complementar a estes Termos, que o USUÁRIO também deve ler e aceitar.",
      ],
    },
    {
      title: "CLÁUSULA 13ª – DA VIGÊNCIA, ALTERAÇÕES E ENCERRAMENTO",
      paragraphs: [
        "13.1. Este contrato vigora por prazo indeterminado, a partir do aceite, enquanto a conta estiver ativa.",
        "13.2. A PLATAFORMA poderá atualizar estes Termos. Alterações relevantes serão comunicadas no aplicativo e poderão exigir novo aceite para continuidade do uso.",
        "13.3. O USUÁRIO pode encerrar sua conta a qualquer momento pelas opções do aplicativo. O encerramento não afasta obrigações já assumidas, nem a guarda de informações exigida por lei.",
      ],
    },
    {
      title: "CLÁUSULA 14ª – DO ACEITE ELETRÔNICO E SEU REGISTRO",
      paragraphs: [
        "14.1. O clique no botão \"Aceito\" constitui manifestação de vontade válida, nos termos do art. 107 do Código Civil.",
        "14.2. A PLATAFORMA registrará a data e a hora do aceite e a versão destes Termos, vinculando-os à conta do USUÁRIO, para fins de comprovação.",
      ],
    },
    {
      title: "CLÁUSULA 15ª – DO FORO",
      paragraphs: [
        "15.1. Fica eleito o foro da comarca de domicílio do USUÁRIO para dirimir quaisquer controvérsias decorrentes deste contrato, em observância ao art. 101, inciso I, do CDC.",
        `15.2. Dúvidas, solicitações e reclamações podem ser enviadas ao e-mail ${DPO_EMAIL}.`,
      ],
    },
  ],
  closing:
    "Você chegou ao final dos Termos de Uso. Ao tocar em \"Aceito\", você concorda com todas as cláusulas acima.",
};

export const PRIVACY_POLICY_DOCUMENT = {
  title: "Política de Privacidade e LGPD",
  intro:
    "Esta Política explica, de forma clara, como a Terra Nova coleta, usa, compartilha e protege os seus dados pessoais, em conformidade com a Lei nº 13.709/2018 (Lei Geral de Proteção de Dados – LGPD). Ao clicar em \"Aceito\" ao final, você declara ter lido e compreendido este documento.",
  sections: [
    {
      title: "1. QUEM É O CONTROLADOR E O ENCARREGADO (DPO)",
      paragraphs: [
        "A Terra Nova é a controladora dos dados pessoais tratados na plataforma, nos termos do art. 5º, inciso VI, da LGPD.",
        `Encarregado pelo tratamento de dados (DPO, art. 41 da LGPD): ${DPO_EMAIL}.`,
      ],
    },
    {
      title: "2. QUAIS DADOS PODEMOS COLETAR",
      paragraphs: [
        "• Dados de cadastro: nome completo, nome de usuário ou e-mail, CPF (compradores), CPF ou CNPJ da propriedade (produtores), telefone e senha (armazenada de forma protegida, nunca em texto aberto);",
        "• Dados de endereço: CEP, rua, número, bairro, cidade, UF e complemento;",
        "• Dados da propriedade (produtores): nome da propriedade, localização do portão/acesso no mapa, fotos e informações de certificação;",
        "• Dados de uso: anúncios, pedidos, avaliações, mensagens, denúncias e histórico de moderação;",
        "• Foto de perfil e demais imagens que você optar por enviar;",
        "• Dados técnicos de acesso à aplicação, quando necessários para segurança e para cumprir o art. 15 do Marco Civil da Internet (Lei nº 12.965/2014).",
      ],
    },
    {
      title: "3. PARA QUE USAMOS SEUS DADOS E COM QUAL BASE LEGAL",
      paragraphs: [
        "• Criar e gerir sua conta e viabilizar pedidos, entregas e comunicação entre produtores e compradores — execução de contrato (art. 7º, V);",
        "• Garantir a rastreabilidade vegetal e atender normas sanitárias e regulatórias, como a INC nº 02/2018 — cumprimento de obrigação legal ou regulatória (art. 7º, II);",
        "• Prevenir fraudes, abusos e contas banidas e garantir a segurança da plataforma — legítimo interesse e exercício regular de direitos (art. 7º, IX e VI);",
        "• Registrar o seu aceite a estes documentos — consentimento (art. 7º, I) e comprovação (art. 8º, §2º);",
        "• Enviar avisos sobre sua conta, pedidos e alterações dos termos.",
      ],
    },
    {
      title: "4. COM QUEM COMPARTILHAMOS",
      paragraphs: [
        "• Outros usuários, apenas no mínimo necessário para concluir a transação (por exemplo, nome e endereço de entrega ao produtor);",
        "• Prestadores de serviço de infraestrutura e de consulta de CEP, sob dever de confidencialidade e segurança;",
        "• Autoridades públicas, quando houver obrigação legal ou ordem judicial.",
        "Não vendemos seus dados pessoais.",
      ],
    },
    {
      title: "5. SEGURANÇA, ARMAZENAMENTO E RETENÇÃO",
      paragraphs: [
        "Adotamos medidas técnicas e administrativas para proteger seus dados contra acessos não autorizados, perdas e usos indevidos, e os documentos pessoais são exibidos de forma mascarada sempre que possível.",
        "Mantemos os dados enquanto sua conta estiver ativa e, depois, apenas pelo tempo necessário para cumprir obrigações legais, regulatórias e exercer direitos em processos.",
        "Ao excluir a conta, os dados deixam de ser usados na plataforma, mas certas informações podem ser mantidas pelo prazo legal, inclusive o registro de contas banidas descrito nos Termos de Uso.",
      ],
    },
    {
      title: "6. SEUS DIREITOS COMO TITULAR (ART. 18 DA LGPD)",
      paragraphs: [
        "• Confirmação da existência de tratamento e acesso aos dados;",
        "• Correção de dados incompletos, inexatos ou desatualizados;",
        "• Anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade;",
        "• Portabilidade dos dados;",
        "• Eliminação dos dados tratados com base no consentimento;",
        "• Informação sobre com quem seus dados foram compartilhados;",
        "• Informação sobre a possibilidade de não fornecer consentimento e suas consequências;",
        "• Revogação do consentimento, a qualquer momento.",
        `Para exercer seus direitos, utilize o menu "Privacidade e LGPD" na sua conta (exportação e exclusão de dados) ou escreva para ${DPO_EMAIL}. Respondemos conforme os prazos do art. 19 da LGPD.`,
      ],
    },
    {
      title: "7. PERMISSÕES DO DISPOSITIVO",
      paragraphs: [
        "O aplicativo pode solicitar acesso à câmera e à galeria (para fotos de perfil, produtos e propriedade) e à localização (para mapa e marcação do portão). Cada permissão só é utilizada para a funcionalidade correspondente e pode ser revogada nas configurações do seu aparelho.",
      ],
    },
    {
      title: "8. INTELIGÊNCIA ARTIFICIAL",
      paragraphs: [
        "Quando você usa recursos de inteligência artificial, as informações fornecidas por você (textos e imagens) podem ser processadas para gerar a resposta. As recomendações são orientativas e não constituem decisão automatizada com efeitos jurídicos sobre você (art. 20 da LGPD).",
      ],
    },
    {
      title: "9. CRIANÇAS E ADOLESCENTES",
      paragraphs: [
        "A plataforma é destinada a pessoas maiores de 18 anos ou emancipadas. Não coletamos intencionalmente dados de crianças e adolescentes (art. 14 da LGPD). Se identificarmos esse tratamento, a conta poderá ser removida.",
      ],
    },
    {
      title: "10. REGISTRO DO CONSENTIMENTO",
      paragraphs: [
        "Ao aceitar esta Política, registramos a data, a hora e a versão do documento aceito, vinculando-os à sua conta. Você pode revogar o consentimento a qualquer momento, ciente de que isso pode impedir o uso de funcionalidades que dependam dele.",
      ],
    },
    {
      title: "11. ALTERAÇÕES DESTA POLÍTICA",
      paragraphs: [
        "Esta Política pode ser atualizada para refletir mudanças legais ou no serviço. Alterações relevantes serão comunicadas no aplicativo e poderão exigir novo aceite.",
      ],
    },
    {
      title: "12. RECLAMAÇÕES",
      paragraphs: [
        `Se entender que seus direitos não foram atendidos, você pode registrar reclamação junto ao nosso DPO (${DPO_EMAIL}) e peticionar à Autoridade Nacional de Proteção de Dados (ANPD).`,
      ],
    },
  ],
  closing:
    "Você chegou ao final da Política de Privacidade. Ao tocar em \"Aceito\", você declara ter lido e compreendido este documento.",
};
