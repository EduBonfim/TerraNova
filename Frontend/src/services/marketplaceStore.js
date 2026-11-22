import { http, isBackendTemporarilyUnavailable, put } from "./api";
import { getCurrentSession } from "./authStore";
import {
  getAllLocalListings,
  initListingService,
  mapLocalToMarketplace,
  updateListing,
} from "./listingService";

// Compatibilidade temporária para telas legadas
export const MARKETPLACE_OPPORTUNITIES = [];

const DEFAULT_FOTO_URI =
  "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80";
const CERT_TYPES = new Set(["Organico", "Transicao", "Convencional"]);

function toNumber(value) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const normalized = value
      .replace("R$", "")
      .trim()
      .replace(".", "")
      .replace(",", ".");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function toBRL(value) {
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
}

function mapCategoria(categoria, subcategoria) {
  const cat = String(categoria || "")
    .trim()
    .toLowerCase();
  const sub = String(subcategoria || "")
    .trim()
    .toLowerCase();
  const text = `${cat} ${sub}`;
  return text.includes("insumo") ||
    text.includes("cultivo") ||
    text.includes("semente")
    ? "Cultivo"
    : "Mercado";
}

function mapCertificacao(value) {
  const cert = String(value || "").trim();
  return CERT_TYPES.has(cert) ? cert : "Convencional";
}

function getMarketplaceDedupKey(item) {
  return String(item?.loteCodigo || item?.id || "")
    .trim()
    .toLowerCase();
}

function dedupeMarketplaceItems(items) {
  const deduped = new Map();

  for (const item of items) {
    const key = getMarketplaceDedupKey(item);
    if (!key) continue;
    deduped.set(key, item);
  }
  return Array.from(deduped.values());
}

function mapBackendListingToMarketplace(item) {
  const estoqueValor = Math.max(0, Math.floor(toNumber(item?.quantidade)));
  const precoNumerico = Math.max(0, toNumber(item?.preco));
  const vendedorUsername = String(
    item?.vendedorUsername || "desconhecido"
  ).trim();
  const vendedorNome = String(
    item?.vendedorNome ||
      item?.vendedorDisplayName ||
      item?.vendedorFarmName ||
      vendedorUsername
  ).trim();

  return {
    id: String(
      item?.id ||
        `backend-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    ),
    produto: String(item?.titulo || "Produto sem título").trim(),
    vendedor: vendedorUsername,
    vendedorUsername,
    vendedorNome,
    preco: toBRL(precoNumerico),
    estoque: `${estoqueValor} unidades`,
    estoqueValor,
    categoria: mapCategoria(item?.categoria, item?.subcategoria),
    subcategoria: item?.subcategoria || undefined,
    foto: item?.fotoUrl || DEFAULT_FOTO_URI,
    esgotadoEm: item?.status === "esgotado" ? item?.atualizadoEm || null : null,
    loteCodigo: String(
      item?.loteCodigo || `LOTE-${String(item?.id || "novo").slice(0, 8)}`
    ).trim(),
    tipoCertificacao: mapCertificacao(item?.tipoCertificacao),
    numeroRegistro: item?.numeroRegistro || undefined,
    unidade: item?.unidade || undefined,
    descricao: item?.descricao || undefined,
  };
}

function toListingUpdatePayload(data) {
  return {
    titulo: data.produto,
    descricao: data.descricao,
    categoria: data.categoria === "Cultivo" ? "insumo" : "mercado",
    subcategoria: data.subcategoria,
    quantidade: data.estoqueValor,
    preco: data.preco ? toNumber(data.preco) : undefined,
    loteCodigo: data.loteCodigo,
    tipoCertificacao: data.tipoCertificacao,
    numeroRegistro: data.numeroRegistro,
    fotoUrl: data.foto,
    unidade: data.unidade,
  };
}

export async function getMarketplaceItems() {
  await initListingService();
  const localAds = getAllLocalListings().map(mapLocalToMarketplace);

  if (isBackendTemporarilyUnavailable()) {
    const mergedLocal = dedupeMarketplaceItems(localAds);
    MARKETPLACE_OPPORTUNITIES.splice(
      0,
      MARKETPLACE_OPPORTUNITIES.length,
      ...mergedLocal
    );
    return mergedLocal;
  }

  const session = await getCurrentSession();
  const response = await http("/api/v1/listings", {
    method: "GET",
    headers: session?.token ? { Authorization: `Bearer ${session.token}` } : {},
  });

  if (!response.success || !Array.isArray(response.data)) {
    const mergedLocal = dedupeMarketplaceItems(localAds);
    MARKETPLACE_OPPORTUNITIES.splice(
      0,
      MARKETPLACE_OPPORTUNITIES.length,
      ...mergedLocal
    );
    return mergedLocal;
  }

  const backendItems = response.data.map(mapBackendListingToMarketplace);
  const mergedItems = dedupeMarketplaceItems([...localAds, ...backendItems]);
  MARKETPLACE_OPPORTUNITIES.splice(
    0,
    MARKETPLACE_OPPORTUNITIES.length,
    ...mergedItems
  );
  return mergedItems;
}

// Para gerenciar estoque - retorna apenas produtos do usuário autenticado
export async function getUserOwnListings() {
  await initListingService();

  if (isBackendTemporarilyUnavailable()) {
    return [];
  }

  const session = await getCurrentSession();
  // Chamando /meus para retornar apenas listings do usuário autenticado
  const response = await http("/api/v1/listings/meus", {
    method: "GET",
    headers: session?.token ? { Authorization: `Bearer ${session.token}` } : {},
  });

  if (!response.success || !Array.isArray(response.data)) {
    return [];
  }

  return response.data.map(mapBackendListingToMarketplace);
}

export async function initMarketplaceStore() {
  await initListingService();
  try {
    await getMarketplaceItems();
  } catch {
    MARKETPLACE_OPPORTUNITIES.splice(0, MARKETPLACE_OPPORTUNITIES.length);
  }
}

export function hasOutOfStockItems(products, producerUsername) {
  if (!products || products.length === 0) return false;
  const normalizedProducer = producerUsername?.trim().toLowerCase();
  const itemsToCheck = normalizedProducer
    ? products.filter(
        (p) =>
          p.vendedorUsername?.trim().toLowerCase() === normalizedProducer ||
          p.vendedor?.trim().toLowerCase() === normalizedProducer
      )
    : products;
  return itemsToCheck.some((item) => item.estoqueValor === 0);
}

export async function checkAndCleanupExpiredAds() {
  return;
}

export async function getMarketplaceItem(id) {
  const allItems = await getMarketplaceItems();
  return allItems.find((item) => item.id === id) || null;
}

export async function updateMarketplaceItem(id, data) {
  if (id.startsWith("listing-")) {
    const updated = await updateListing(id, {
      titulo: data.produto,
      preco: data.preco,
      quantidade: data.estoqueValor?.toString(),
      fotoUri: data.foto,
      descricao: data.descricao,
    });
    return !!updated;
  }

  const session = await getCurrentSession();
  if (!session?.token) return false;

  const response = await put(
    `/api/listings/${id}`,
    toListingUpdatePayload(data),
    {
      headers: { Authorization: `Bearer ${session.token}` },
    }
  );
  return response.success;
}
