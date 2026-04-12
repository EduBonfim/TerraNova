import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Alert } from "react-native";
import {
  getProducersCSVData,
  getBuyersCSVData,
  getProductsCSVData,
  getSalesCSVData,
  getReportsCSVData,
} from "./adminAnalytics";

/**
 * Converte um array de objetos em uma string CSV formatada para Power BI.
 * @param data Array de objetos contendo os dados.
 * @returns String formatada em CSV (separada por virgula e com cabecalhos).
 */
export function convertToCSV(data: any[]): string {
  if (!data || data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const rows = data.map((obj) => {
    return headers
      .map((header) => {
        let val = obj[header];
        
        // Trata valores nulos ou indefinidos
        if (val === null || val === undefined) val = "";
        
        // Trata strings com ponto-e-virgula ou quebras de linha (envolve em aspas)
        if (typeof val === "string") {
          val = `"${val.replace(/"/g, '""').replace(/\n/g, " ")}"`;
        }
        
        return val;
      })
      .join(";");
  });

  // Adicionamos o BOM (Byte Order Mark) para que Excel/Numbers identifiquem como UTF-8
  // Usamos ponto-e-vírgula (;) pois é o padrão do Excel em português (Brasil)
  return "\ufeff" + [headers.join(";"), ...rows].join("\n");
}

/**
 * Gera o arquivo CSV e abre o seletor de compartilhamento nativo (iOS/Android)
 */
export async function exportToPlatform(filename: string, csvData: string) {
  try {
    const fileUri = FileSystem.cacheDirectory + filename;
    
    // Usando a API legada com codificação explícita
    await FileSystem.writeAsStringAsync(fileUri, csvData, { encoding: "utf8" });

    // Compartilhar
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(fileUri, {
        mimeType: "text/csv",
        dialogTitle: `Exportar ${filename}`,
        UTI: "public.comma-separated-values-text", // Melhor suporte no iOS/Numbers
      });
    } else {
      Alert.alert("Erro", "O compartilhamento não está disponível no seu dispositivo.");
    }
  } catch (error) {
    console.error("Erro ao exportar arquivo:", error);
    throw error;
  }
}

/**
 * ===== ADMIN EXPORTS =====
 * Exportações diferenciadas por role de usuário
 */

export async function exportProducersToCSV(): Promise<string> {
  const data = await getProducersCSVData();
  return convertToCSV(data);
}

export async function exportBuyersToCSV(): Promise<string> {
  const data = await getBuyersCSVData();
  return convertToCSV(data);
}

export async function exportProductsToCSV(): Promise<string> {
  const data = await getProductsCSVData();
  return convertToCSV(data);
}

export async function exportSalesToCSV(): Promise<string> {
  const data = await getSalesCSVData();
  return convertToCSV(data);
}

export async function exportReportsToCSV(): Promise<string> {
  const data = await getReportsCSVData();
  return convertToCSV(data);
}
