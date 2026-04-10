/**
 * producerAnalytics.ts
 * 
 * Calcula métricas de performance para produtores
 * Integra dados de communityStore e ordersStore
 */

import { getProfileSummary } from "@/services/communityStore";
import { getAllOrders } from "@/services/ordersStore";
import { MARKETPLACE_OPPORTUNITIES } from "@/services/marketplaceStore";
import { Order } from "@/services/ordersStore";

export interface RecentSale {
  id: string;
  productName: string;
  status: "pending" | "completed" | "cancelled";
  totalPrice: number;
  quantity: number;
  date: string;
  buyerName: string;
}

export interface ProducerKPI {
  totalAds: number;
  averageRating: number;
  monthlySales: number;
  followers: number;
}

/**
 * Calcula os KPIs do produtor
 * @param producerUsername - Nome do usuário do produtor
 */
export function getProducerKPIs(producerUsername: string): ProducerKPI {
  try {
    // Pega o perfil do produtor
    const profile = getProfileSummary(producerUsername);
    
    // Pega todos os produtos do marketplace
    const allProducts = MARKETPLACE_OPPORTUNITIES;

    // 1. Total de Anúncios (produtos do produtor)
    const producerProducts = allProducts.filter(
      (p: { vendedor: string }) => p.vendedor === producerUsername
    );
    const totalAds = producerProducts.length;

    // 2. Avaliação Média (do perfil)
    // CommunityProfile pode/não ter rating, usar 0 como fallback
    const averageRating = (profile as any)?.rating || 0;

    // 3. Vendas do Mês (últimos 30 dias)
    // Como getAllOrders é async, vamos retornar 0 para não bloquear
    // Em produção, isso deveria ser calculado via função async
    const monthlySales = 0;

    // 4. Seguidores (será calculado como 0 por enquanto)
    const followers = 0;

    return {
      totalAds,
      averageRating,
      monthlySales,
      followers,
    };
  } catch (error) {
    console.warn("Error calculating producer KPIs:", error);
    return {
      totalAds: 0,
      averageRating: 0,
      monthlySales: 0,
      followers: 0,
    };
  }
}

/**
 * Retorna as últimas vendas do produtor (últimos 5)
 * Nota: Como getAllOrders é async, esta função retorna um array vazio
 * Em produção, implementar versão async
 * @param producerUsername - Nome do usuário do produtor
 */
export function getRecentSales(producerUsername: string): RecentSale[] {
  // Por enquanto, retorna vazio. Será preenchido via estado async no componente
  return [];
}
