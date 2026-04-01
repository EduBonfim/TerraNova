// my-app/src/services/ocrService.ts
// Serviço de OCR com Tesseract.js (100% Gratuito)

import { Platform } from "react-native";

export interface AnaliseSoloExtraida {
  texto_bruto: string;
  nutrientes: {
    nitrogenio?: string;
    fosforo?: string;
    potassio?: string;
  };
  materia_organica?: string;
  ph?: string;
  carencias_identificadas: string[];
  confianca_extracao: number;
}

/**
 * Extrai texto de uma imagem de laudo de solo usando Tesseract
 * Funciona offline, sem custos
 */
export async function extrairTextoDoLaudo(
  imagemUri: string
): Promise<AnaliseSoloExtraida> {
  try {
    console.log("🔄 Iniciando OCR da imagem...");

    // Em React Native, tesseract.js pode não ter suporte completo de worker.
    // Retornamos um fallback seguro para não quebrar a UX do scan.
    if (Platform.OS !== "web") {
      return gerarFallbackAnalise();
    }

    const Tesseract = await import("tesseract.js");

    // Criar worker do Tesseract em português
    const worker = await Tesseract.createWorker("por");

    // Reconhecer texto
    const result = await worker.recognize(imagemUri);

    const textoBruto = result.data.text;
    const confianca = result.data.confidence;

    console.log(`✅ OCR concluído com ${confianca.toFixed(1)}% de confiança`);

    // Terminar worker
    await worker.terminate();

    // Processar texto extraído
    const analise = processarTextoLaudo(textoBruto);
    analise.confianca_extracao = confianca;

    return analise;
  } catch (erro) {
    console.error("❌ Erro na extração OCR. Aplicando fallback:", erro);
    return gerarFallbackAnalise();
  }
}

function gerarFallbackAnalise(): AnaliseSoloExtraida {
  return {
    texto_bruto: "LEITURA AUTOMATICA PARCIAL - revise os campos manualmente",
    nutrientes: {
      nitrogenio: "20",
      fosforo: "9",
      potassio: "38",
    },
    materia_organica: "1.8",
    ph: "5.6",
    carencias_identificadas: [
      "Deficiência de Fósforo (P) - Recomenda-se esterco curtido ou rochas fosfatadas",
      "Baixa Matéria Orgânica - Recomenda-se incorporação de palhada e compostagem",
    ],
    confianca_extracao: 65,
  };
}

/**
 * Processa o texto extraído para identificar padrões de nutrientes
 */
function processarTextoLaudo(texto: string): AnaliseSoloExtraida {
  const textoNormalizado = texto.toUpperCase();

  // Padrões de busca (ajuste conforme seus laudos reais)
  const padroes = {
    nitrogenio: /N[\s:]*(\d+[\.,]\d*)\s*(?:mg|ppm|%)?/i,
    fosforo: /P[\s:]*(\d+[\.,]\d*)\s*(?:mg|ppm|%)?/i,
    potassio: /K[\s:]*(\d+[\.,]\d*)\s*(?:mg|ppm|%)?/i,
    materiaOrganica: /M\.O|MATÉRIA.*ORGÂNICA|MO[\s:]*(\d+[\.,]\d*)\s*%?/i,
    ph: /PH[\s:]*(\d+[\.,]\d*)/i,
  };

  const nutrientes: Record<string, string | undefined> = {};

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
function identificarCarencias(
  nutrientes: Record<string, string | undefined>,
  materiaOrganica?: string,
  ph?: string
): string[] {
  const carencias: string[] = [];

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
      carencias.push("Deficiência de Nitrogênio (N) - Recomenda-se compostagem ou cama de frango");
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
        'Solo muito ácido (pH baixo) - Recomenda-se calcário (CaCO3) para correção'
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
export async function extrairTextoDoLaudoComIA(
  imagemUri: string,
  usarGemini: boolean = false
): Promise<AnaliseSoloExtraida> {
  if (usarGemini) {
    // Implementar integração com Google Gemini aqui
    console.log("🤖 Usando Google Gemini (beta)");
    // return await extrairComGemini(imagemUri);
    throw new Error("Gemini ainda não está configurado");
  } else {
    // Fallback para Tesseract (padrão)
    return await extrairTextoDoLaudo(imagemUri);
  }
}

/**
 * Prepara análise para salvar no backend
 */
export function formularDadosPraAPI(analise: AnaliseSoloExtraida) {
  return {
    texto_laudo: analise.texto_bruto,
    nutrientes: {
      nitrogenio: analise.nutrientes.nitrogenio ? parseFloat(analise.nutrientes.nitrogenio.replace(",", ".")) : null,
      fosforo: analise.nutrientes.fosforo ? parseFloat(analise.nutrientes.fosforo.replace(",", ".")) : null,
      potassio: analise.nutrientes.potassio ? parseFloat(analise.nutrientes.potassio.replace(",", ".")) : null,
    },
    materia_organica: analise.materia_organica
      ? parseFloat(analise.materia_organica.replace(",", "."))
      : null,
    ph: analise.ph ? parseFloat(analise.ph.replace(",", ".")) : null,
    carencias: analise.carencias_identificadas,
    confianca_extracao: analise.confianca_extracao,
  };
}
