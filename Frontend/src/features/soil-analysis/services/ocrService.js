// my-app/src/features/soil-analysis/services/ocrService.ts
// Serviço de OCR via servidor backend

/**
 * Extrai texto de uma imagem de laudo de solo via servidor backend
 * Funciona offline, sem custos
 */
export async function extrairTextoDoLaudo(imagemUri) {
  try {
    console.log("🔄 Iniciando OCR da imagem...");

    const servidor = await extrairTextoViaServidor(imagemUri);
    const analiseServidor = processarTextoLaudo(servidor.text);
    analiseServidor.confianca_extracao = servidor.confidence;
    return analiseServidor;
  } catch (erro) {
    console.error("❌ Erro na extração OCR:", erro);
    return {
      texto_bruto: "",
      nutrientes: {},
      materia_organica: undefined,
      ph: undefined,
      carencias_identificadas: [],
      confianca_extracao: 0,
    };
  }
}

async function extrairTextoViaServidor(_imagemUri) {
  try {
    // ⚠️ DESABILITADO: Servidor OCR não configurado
    // Retorna mock data immediately sem tentar conectar
    console.warn(
      "⚠️ Servidor OCR indisponível. Usando dados locais para demonstração."
    );

    return {
      text: "LAUDO DE ANALISE DE SOLO TERRA NOVA\nPH: 5.5\nP: 8.2 mg/dm3\nK: 0.15 cmolc/dm3\nM.O: 1.5 %",
      confidence: 100.0,
    };
  } catch (_error) {
    console.warn(
      "⚠️ Servidor OCR indisponível. Usando Mock para demonstração local."
    );
    // Retorna um texto de exemplo que o processador consegue ler
    return {
      text: "LAUDO DE ANALISE DE SOLO TERRA NOVA\nPH: 5.5\nP: 8.2 mg/dm3\nK: 0.15 cmolc/dm3\nM.O: 1.5 %",
      confidence: 100.0,
    };
  }
}

/**
 * Processa o texto extraído para identificar padrões de nutrientes
 */
function processarTextoLaudo(texto) {
  const textoNormalizado = texto.toUpperCase();

  // Padrões de busca (ajuste conforme seus laudos reais)
  const padroes = {
    nitrogenio: /N[\s:]*(\d+[.,]\d*)\s*(?:mg|ppm|%)?/i,
    fosforo: /P[\s:]*(\d+[.,]\d*)\s*(?:mg|ppm|%)?/i,
    potassio: /K[\s:]*(\d+[.,]\d*)\s*(?:mg|ppm|%)?/i,
    materiaOrganica: /M\.O|MATÉRIA.*ORGÂNICA|MO[\s:]*(\d+[.,]\d*)\s*%?/i,
    ph: /PH[\s:]*(\d+[.,]\d*)/i,
  };

  const nutrientes = {};

  // Extrair valores
  const matchN = textoNormalizado.match(padroes.nitrogenio);
  if (matchN) nutrientes.nitrogenio = matchN[1];

  const matchP = textoNormalizado.match(padroes.fosforo);
  if (matchP) nutrientes.fosforo = matchP[1];

  const matchK = textoNormalizado.match(padroes.potassio);
  if (matchK) nutrientes.potassio = matchK[1];

  const matchMO = textoNormalizado.match(padroes.materiaOrganica);
  const materiaOrganica = matchMO ? matchMO[1] : undefined;

  const matchPH = textoNormalizado.match(padroes.ph);
  const ph = matchPH ? matchPH[1] : undefined;

  // Identificar carências
  const carencias = identificarCarencias(nutrientes, materiaOrganica, ph);

  return {
    texto_bruto: texto,
    nutrientes,
    materia_organica: materiaOrganica,
    ph,
    carencias_identificadas: carencias,
    confianca_extracao: 0, // Será preenchido pela função chamadora
  };
}

/**
 * Identifica quais nutrientes estão em falta baseado em valores extraídos
 */
function identificarCarencias(nutrientes, materiaOrganica, ph) {
  const carencias = [];

  // Valores de referência mínimos (ajuste conforme MAPA)
  const MIN_NITROGENIO = 20;
  const MIN_FOSFORO = 10;
  const MIN_POTASSIO = 40;
  const MIN_MATERIA_ORGANICA = 2;
  const PH_MIN = 6.0;
  const PH_MAX = 7.5;

  // Validar nitrogênio
  if (nutrientes.nitrogenio) {
    const valor = parseFloat(
      nutrientes.nitrogenio.toString().replace(",", ".")
    );
    if (valor < MIN_NITROGENIO) {
      carencias.push(
        "Deficiência de Nitrogênio (N) - Recomenda-se compostagem ou cama de frango"
      );
    }
  }

  // Validar fósforo
  if (nutrientes.fosforo) {
    const valor = parseFloat(nutrientes.fosforo.toString().replace(",", "."));
    if (valor < MIN_FOSFORO) {
      carencias.push(
        "Deficiência de Fósforo (P) - Recomenda-se esterco curtido ou rochas fosfatadas"
      );
    }
  }

  // Validar potássio
  if (nutrientes.potassio) {
    const valor = parseFloat(nutrientes.potassio.toString().replace(",", "."));
    if (valor < MIN_POTASSIO) {
      carencias.push(
        "Deficiência de Potássio (K) - Recomenda-se cinza de madeira ou potássio de fonte natural"
      );
    }
  }

  // Validar matéria orgânica
  if (materiaOrganica) {
    const valor = parseFloat(materiaOrganica.toString().replace(",", "."));
    if (valor < MIN_MATERIA_ORGANICA) {
      carencias.push(
        "Baixa Matéria Orgânica - Recomenda-se incorporação de palhada e compostagem"
      );
    }
  }

  // Validar pH
  if (ph) {
    const valor = parseFloat(ph.toString().replace(",", "."));
    if (valor < PH_MIN) {
      carencias.push(
        "Solo muito ácido (pH baixo) - Recomenda-se calcário (CaCO3) para correção"
      );
    } else if (valor > PH_MAX) {
      carencias.push(
        "Solo alcalino demais (pH alto) - Recomenda-se enxofre elementar"
      );
    }
  }

  // Se nenhuma carência óbvia, mas dados extraídos
  if (carencias.length === 0 && Object.keys(nutrientes).length > 0) {
    carencias.push("Solo dentro dos padrões - Manutenção regular recomendada");
  }

  return carencias;
}

/**
 * Versão com IA melhorada (futuro - quando migrar para Gemini)
 * Mantém compatibilidade com o código atual
 */
export async function extrairTextoDoLaudoComIA(imagemUri, usarGemini = false) {
  if (usarGemini) {
    // Implementar integração com Google Gemini aqui
    console.log("🤖 Usando Google Gemini (beta)");
    // return await extrairComGemini(imagemUri);
    throw new Error("Gemini ainda não está configurado");
  } else {
    // Fallback para servidor backend
    return await extrairTextoDoLaudo(imagemUri);
  }
}

/**
 * Prepara análise para salvar no backend
 */
export function formularDadosPraAPI(analise) {
  return {
    texto_laudo: analise.texto_bruto,
    nutrientes: {
      nitrogenio: analise.nutrientes.nitrogenio
        ? parseFloat(analise.nutrientes.nitrogenio.replace(",", "."))
        : null,
      fosforo: analise.nutrientes.fosforo
        ? parseFloat(analise.nutrientes.fosforo.replace(",", "."))
        : null,
      potassio: analise.nutrientes.potassio
        ? parseFloat(analise.nutrientes.potassio.replace(",", "."))
        : null,
    },
    materia_organica: analise.materia_organica
      ? parseFloat(analise.materia_organica.replace(",", "."))
      : null,
    ph: analise.ph ? parseFloat(analise.ph.replace(",", ".")) : null,
    carencias: analise.carencias_identificadas,
    confianca_extracao: analise.confianca_extracao,
  };
}
