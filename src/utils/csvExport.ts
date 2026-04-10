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
        
        // Trata strings com virgulas ou quebras de linha (envolve em aspas)
        if (typeof val === "string") {
          val = `"${val.replace(/"/g, '""').replace(/\n/g, " ")}"`;
        }
        
        return val;
      })
      .join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

/**
 * Simula o download ou gera um log para copia do CSV.
 * Em React Native puro, poderiamos usar Expo-FileSystem e Sharing.
 */
export async function exportToPlatform(filename: string, csvData: string) {
  // Para demonstração, faremos um log limpo
  console.log(`--- [EXPORT: ${filename}] ---`);
  console.log(csvData);
  console.log(`--- [FIM EXPORT] ---`);
  
  // Em um ambiente real com Expo:
  // const fileUri = FileSystem.cacheDirectory + filename;
  // await FileSystem.writeAsStringAsync(fileUri, csvData, { encoding: FileSystem.EncodingType.UTF8 });
  // await Sharing.shareAsync(fileUri);
}

/**
 * ===== ADMIN EXPORTS =====
 * Exportações diferenciadas por role de usuário
 */

import {
  getProducersCSVData,
  getBuyersCSVData,
  getProductsCSVData,
  getSalesCSVData,
  getReportsCSVData,
} from "./adminAnalytics";

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
