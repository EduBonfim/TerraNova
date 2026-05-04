/**
 * producerAnalytics.ts
 *
 * Calcula métricas de performance para produtores
 * Integra dados de communityStore, marketplaceStore e listingService
 */

import { getProfileSummary, getAverageRating } from "@/services/communityStore";
import { getMarketplaceItems, MARKETPLACE_OPPORTUNITIES } from "@/services/marketplaceStore";
import { getOrdersByUser, getAllOrders, initOrdersStore, type Order } from "@/services/ordersStore";
import { getUserListings } from "@/services/listingService";
import { getFollowerCount, initFollowStore } from "@/services/followStore";

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

// Helper para normalizar texto
function normalizeText(val: string | undefined): string {
  if (!val) return "";
  return val.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

/**
 * Calcula os KPIs do produtor de forma assíncrona (RECOMENDADO)
 * Busca dados reais do ordersStore e listingService
 * @param producerUsername - Nome do usuário do produtor
 */
export async function getProducerKPIsAsync(
  producerUsername: string,
): Promise<ProducerKPI> {
  try {
    await initOrdersStore();
    await initFollowStore();
    const profile = getProfileSummary(producerUsername);
    // 3. Vendas do Mês (Considerando todos os nomes vinculados)
    const allOrders = await getOrdersByUser(producerUsername);
    const displayName = normalizeText(profile?.displayName);
    const farmName = normalizeText(profile?.farmName);

    // Complementa com ordens que podem estar sob o nome de exibição
    const rawAllOrders = await getAllOrders();
    const sellerOrders = rawAllOrders.filter((o) => {
      const seller = normalizeText(o.vendedorUsername);
      return (
        seller === normalizeText(producerUsername) ||
        seller === displayName ||
        seller === farmName
      );
    });

    const allProducts = await getMarketplaceItems();
    const marketplaceAds = allProducts.filter(
      (p) => 
        normalizeText(p.vendedor) === normalizeText(producerUsername) ||
        normalizeText(p.vendedor) === displayName ||
        normalizeText(p.vendedor) === farmName
    );
    const totalAds = marketplaceAds.length;

    let averageRating = getAverageRating(producerUsername, "producer");
    if (averageRating === 0) averageRating = 4.2;

    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentFinishedOrders = sellerOrders.filter((order) => {
      // Consideramos "finalizado" e "transporte" como vendas realizadas
      if (order.status === "aguardando") return false;
      
      try {
        const parts = order.data.split("/");
        if (parts.length === 3) {
          const [day, month, year] = parts.map(Number);
          const orderDate = new Date(year, month - 1, day);
          return orderDate >= thirtyDaysAgo && orderDate <= today;
        }
        const orderDate = new Date(order.data);
        return orderDate >= thirtyDaysAgo && orderDate <= today;
      } catch {
        return false;
      }
    });

    const monthlySales = recentFinishedOrders.reduce(
      (sum, order) => sum + (order.valorNumerico || 0),
      0,
    );

    // 4. Seguidores Reais (FollowStore + Mock Base)
    const followers = await getFollowerCount(producerUsername);

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
      averageRating: 4.2, // Fallback amigável
      monthlySales: 0,
      followers: 0,
    };
  }
}

/**
 * Calcula os KPIs do produtor (SÍNCRONO - versão legada)
 */
export function getProducerKPIs(producerUsername: string): ProducerKPI {
  try {
    const profile = getProfileSummary(producerUsername);
    const allProducts = MARKETPLACE_OPPORTUNITIES;
    const localAds = getUserListings(producerUsername);

    const marketplaceAds = allProducts.filter(
      (p: { vendedor: string }) => 
        normalizeText(p.vendedor) === normalizeText(producerUsername) ||
        normalizeText(p.vendedor) === normalizeText(profile.displayName) ||
        normalizeText(p.vendedor) === normalizeText(profile.farmName)
    );
    
    const totalAds = marketplaceAds.length + localAds.length;
    const averageRating = getAverageRating(producerUsername, "producer") || 4.2;

    return {
      totalAds,
      averageRating,
      monthlySales: 0,
      followers: 0,
    };
  } catch (error) {
    return {
      totalAds: 0,
      averageRating: 0,
      monthlySales: 0,
      followers: 0,
    };
  }
}

export async function getRecentSalesAsync(producerUsername: string): Promise<RecentSale[]> {
  try {
    const orders = await getOrdersByUser(producerUsername);
    return orders
      .sort((a, b) => {
        const dateA = a.data.includes("/") 
          ? new Date(a.data.split("/").reverse().join("-")) 
          : new Date(a.data);
        const dateB = b.data.includes("/") 
          ? new Date(b.data.split("/").reverse().join("-")) 
          : new Date(b.data);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 5)
      .map(o => ({
        id: o.id,
        productName: o.produto,
        status: o.status === "finalizado" ? "completed" : o.status === "transporte" ? "pending" : "cancelled",
        totalPrice: o.valorNumerico,
        quantity: o.quantidadeNum,
        date: o.data,
        buyerName: o.comprador
      }));
  } catch (error) {
    return [];
  }
}

/**
 * Retorna as últimas vendas do produtor (últimos 5) - Legado síncrono
 */
export function getRecentSales(producerUsername: string): RecentSale[] {
  return [];
}
