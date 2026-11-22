import { getAverageRating, getProfileSummary } from "@/services/communityStore";
import {
  MARKETPLACE_OPPORTUNITIES,
  getUserOwnListings,
} from "@/services/marketplaceStore";
import { getOrdersByUser } from "@/services/ordersStore";
import { getUserListings } from "@/services/listingService";
import { http } from "@/services/api";

function normalizeText(val) {
  if (!val) return "";
  return val
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export async function getProducerKPIsAsync(producerUsername) {
  try {
    // Chama endpoint real que retorna KPIs com vendas do mês
    const response = await http(`/api/v1/producers/${producerUsername}/kpis`);

    if (response.success && response.data) {
      const data = response.data;
      return {
        totalAds: data.totalAds || 0,
        averageRating: data.averageRating || 0,
        monthlySales: data.monthlySales || 0,
        followers: data.followers || 0,
      };
    }

    // Fallback se endpoint falhar
    const ownListings = await getUserOwnListings();
    const totalAds = ownListings.length;
    const localAverage = getAverageRating(producerUsername, "producer");

    return {
      totalAds,
      averageRating: localAverage,
      monthlySales: 0,
      followers: 0,
    };
  } catch (error) {
    console.warn("Error fetching producer KPIs:", error);

    // Fallback final: usar dados locais
    try {
      const ownListings = await getUserOwnListings();
      return {
        totalAds: ownListings.length,
        averageRating: getAverageRating(producerUsername, "producer"),
        monthlySales: 0,
        followers: 0,
      };
    } catch {
      return {
        totalAds: 0,
        averageRating: 0,
        monthlySales: 0,
        followers: 0,
      };
    }
  }
}

export function getProducerKPIs(producerUsername) {
  try {
    const profile = getProfileSummary(producerUsername);
    const allProducts = MARKETPLACE_OPPORTUNITIES;
    const localAds = getUserListings(producerUsername);
    const marketplaceAds = allProducts.filter(
      (p) =>
        normalizeText(p.vendedor) === normalizeText(producerUsername) ||
        normalizeText(p.vendedor) === normalizeText(profile.displayName) ||
        normalizeText(p.vendedor) === normalizeText(profile.farmName)
    );
    const totalAds = marketplaceAds.length + localAds.length;
    const averageRating = getAverageRating(producerUsername, "producer");
    return {
      totalAds,
      averageRating,
      monthlySales: 0,
      followers: 0,
    };
  } catch (_error) {
    return {
      totalAds: 0,
      averageRating: 0,
      monthlySales: 0,
      followers: 0,
    };
  }
}

export async function getRecentSalesAsync(producerUsername) {
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
      .map((order) => ({
        id: order.id,
        productName: order.produto,
        status:
          order.status === "finalizado"
            ? "completed"
            : order.status === "transporte"
            ? "pending"
            : "cancelled",
        totalPrice: order.valorNumerico,
        quantity: order.quantidadeNum,
        date: order.data,
        buyerName: order.comprador,
      }));
  } catch (_error) {
    return [];
  }
}

export function getRecentSales(_producerUsername) {
  return [];
}
