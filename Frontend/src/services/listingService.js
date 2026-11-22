/**
 * Serviço de Gestão de Anúncios (Listings)
 *
 * Responsável por:
 * - Criar e gerenciar anúncios de usuários
 * - Persistir anúncios localmente em AsyncStorage
 * - Preparar payloads para sincronização com backend Spring
 * - Manter fila de sincronização para offline-first
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { httpDelete, post, put } from "./api";
import { getCurrentSession } from "./authStore";
// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTES E CHAVES DE STORAGE
// ═══════════════════════════════════════════════════════════════════════════
const LISTINGS_STORAGE_KEY = "@terra_nova/user_listings";
const SYNC_QUEUE_STORAGE_KEY = "@terra_nova/listings_sync_queue";

// ═══════════════════════════════════════════════════════════════════════════
// ESTADO EM MEMÓRIA
// ═══════════════════════════════════════════════════════════════════════════
let localListings = {};
let syncQueue = [];
const FALLBACK_LISTING_IMAGES = [
  "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1518843875459-f738682238a6?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1453749404628-eb2b4f30e3f2?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80",
];
function hashText(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}
function resolveFallbackListingImage(payload) {
  const key = `${payload.tipo}:${payload.subcategoria}:${payload.titulo}`
    .trim()
    .toLowerCase();
  return FALLBACK_LISTING_IMAGES[
    hashText(key) % FALLBACK_LISTING_IMAGES.length
  ];
}
// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÕES PÚBLICAS - CRIAÇÃO E GESTÃO DE ANÚNCIOS
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Inicializa o serviço de anúncios carregando dados do AsyncStorage
 */
export async function initListingService() {
  try {
    // Carrega anúncios locais
    const listingsJson = await AsyncStorage.getItem(LISTINGS_STORAGE_KEY);
    if (listingsJson) {
      localListings = JSON.parse(listingsJson);
    }
    // Carrega fila de sincronização
    const queueJson = await AsyncStorage.getItem(SYNC_QUEUE_STORAGE_KEY);
    if (queueJson) {
      syncQueue = JSON.parse(queueJson);
    }
    console.log("✓ Serviço de anúncios inicializado (offline-first)");
    // Aciona o motor de sincronização em background
    getCurrentSession().then((session) => {
      if (session?.token) {
        syncAllPendingListings(session.token).catch((e) =>
          console.warn(
            "[ListingService] Erro na sincronizacao de background:",
            e
          )
        );
      }
    });
  } catch (error) {
    console.warn("⚠️ Erro ao inicializar serviço de anúncios:", error);
    // Não falha - funciona offline mesmo sem dados
  }
}
/**
 * Cria um novo anúncio e armazena localmente
 *
 * @param username - Username do criador do anúncio
 * @param payload - Dados do anúncio
 * @returns O anúncio criado com ID
 */
export async function createListing(username, payload) {
  // Gera ID único
  const id = `listing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();
  const resolvedFotoUri =
    payload.fotoUri || resolveFallbackListingImage(payload);
  const listing = {
    id,
    vendedor: username,
    vendedorNome: payload.vendedorNome?.trim() || undefined,
    criadoEm: now,
    statusSync: "pending",
    ...payload,
    esgotadoEm: payload.quantidade === "0" ? now : payload.esgotadoEm,
    fotoUri: resolvedFotoUri,
  };
  // Armazena em memória
  localListings[id] = listing;
  // Persiste em AsyncStorage
  await persistListingsToStorage();
  // Cria item na fila de sincronização
  const backendPayload = convertToBackendPayload(listing);
  await addToSyncQueue(id, backendPayload);
  // Tenta sincronizar imediatamente quando houver sessao ativa.
  // Se falhar, o item permanece como pending para tentativas futuras.
  try {
    const session = await getCurrentSession();
    if (session?.token) {
      const syncSuccess = await syncListingToBackend(id, session.token);
      if (syncSuccess) {
        console.log(`✓ Anúncio sincronizado com backend: ${id}`);
      } else {
        console.warn(
          `⚠️ Falha ao sincronizar anúncio ${id} com backend (será tentado novamente)`
        );
      }
    } else {
      console.log(
        `ℹ️ Sem sessão ativa - anúncio salvo localmente, sincronizará quando conectado`
      );
    }
  } catch (error) {
    console.error(`❌ Erro ao sincronizar anúncio ${id}:`, error);
    // Mantem fluxo offline-first sem interromper publicacao local.
  }
  console.log(`✓ Anúncio criado localmente e salvo em AsyncStorage: ${id}`);
  return listing;
}
export function getUserListings(username) {
  return Object.values(localListings).filter(
    (listing) => listing.vendedor === username
  );
}
/**
 * Obtém todos os anúncios locais (de todos os usuários criados no dispositivo)
 */
export function getAllLocalListings() {
  return Object.values(localListings);
}
/**
 * Converte um anúncio local para o formato do Marketplace
 */
export function mapLocalToMarketplace(listing) {
  return {
    id: listing.id,
    produto: listing.titulo,
    vendedor: listing.vendedor, // Aqui o vendedor já é o username no LocalListing
    vendedorUsername: listing.vendedor,
    vendedorNome: listing.vendedorNome || listing.vendedor,
    preco: listing.preco.startsWith("R$")
      ? listing.preco
      : `R$ ${listing.preco}`,
    estoque: `${listing.quantidade} unidades`,
    estoqueValor: parseInt(listing.quantidade) || 0,
    categoria: listing.tipo === "colheita" ? "Mercado" : "Cultivo",
    subcategoria: listing.subcategoria,
    foto: listing.fotoUri || resolveFallbackListingImage(listing),
    loteCodigo: listing.loteCodigo,
    tipoCertificacao: listing.tipoCertificacao,
    numeroRegistro: listing.numeroRegistro,
    unidade: listing.unidade,
    descricao: listing.descricao || "Produto de qualidade selecionada.",
    esgotadoEm: listing.esgotadoEm || null,
  };
}
/**
 * Obtém um anúncio específico
 */
export function getListing(listingId) {
  return localListings[listingId] || null;
}
/**
 * Atualiza um anúncio existente
 */
export async function updateListing(listingId, payload) {
  const listing = localListings[listingId];
  if (!listing) return null;
  const updatedListing = {
    ...listing,
    ...payload,
    statusSync: "pending", // Reseta sync ao editar
  };
  if (payload.quantidade === "0" && listing.quantidade !== "0") {
    updatedListing.esgotadoEm = new Date().toISOString();
  } else if (payload.quantidade && payload.quantidade !== "0") {
    updatedListing.esgotadoEm = undefined;
  }
  localListings[listingId] = updatedListing;
  await persistListingsToStorage();
  // Call API for update
  try {
    const session = await getCurrentSession();
    if (session?.token) {
      // If listingId is a backend ID (not starting with 'listing-')
      if (!listingId.startsWith("listing-")) {
        const backendPayload = convertToBackendPayload(updatedListing);
        await put(`/api/v1/listings/${listingId}`, backendPayload);
        updatedListing.statusSync = "synced";
        updatedListing.sincronizadoEm = new Date().toISOString();
        await persistListingsToStorage();
      } else {
        // Still local, so queue it as a create
        const backendPayload = convertToBackendPayload(updatedListing);
        await addToSyncQueue(listingId, backendPayload);
      }
    } else {
      const backendPayload = convertToBackendPayload(updatedListing);
      await addToSyncQueue(listingId, backendPayload);
    }
  } catch (error) {
    console.warn("Falha ao atualizar anúncio no backend:", error);
    const backendPayload = convertToBackendPayload(updatedListing);
    await addToSyncQueue(listingId, backendPayload);
  }
  return updatedListing;
}
/**
 * Deleta um anúncio localmente
 */
export async function deleteListing(listingId) {
  // Delete local data
  delete localListings[listingId];
  await persistListingsToStorage();
  syncQueue = syncQueue.filter((item) => item.listingId !== listingId);
  await persistSyncQueueToStorage();
  // Call API
  try {
    const session = await getCurrentSession();
    if (session?.token) {
      // O endpoint de delete ainda não havia sido referenciado no frontend.
      // Tentaremos remover tanto localmente quanto no backend.
      await httpDelete(`/api/v1/listings/${listingId}`);
    }
  } catch (error) {
    console.warn("Falha ao deletar anúncio no backend:", error);
  }
}
/**
 * Limpa todos os anúncios locais cacheados (usado no logout)
 */
export async function clearAllListingsCache() {
  localListings = {};
  syncQueue = [];
  await AsyncStorage.removeItem(LISTINGS_STORAGE_KEY);
  await AsyncStorage.removeItem(SYNC_QUEUE_STORAGE_KEY);
  console.log("✓ Cache de anúncios locais limpo no logout");
}
/**
 * Atualiza status de sincronização de um anúncio
 */
export async function updateListingSyncStatus(listingId, status, erro) {
  const listing = localListings[listingId];
  if (!listing) return;
  listing.statusSync = status;
  if (status === "synced") {
    listing.sincronizadoEm = new Date().toISOString();
  }
  if (erro) {
    listing.ultimoErro = erro;
  }
  await persistListingsToStorage();
}
// ═══════════════════════════════════════════════════════════════════════════
// SINCRONIZAÇÃO COM BACKEND
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Obtém a fila de sincronização (anúncios pendentes)
 */
export function getSyncQueue() {
  return [...syncQueue];
}
/**
 * Sincroniza um anúncio com o backend
 *
 * @param listingId - ID do anúncio a sincronizar
 * @param authToken - Token JWT do usuário (obtido do AuthContext)
 * @returns true se sincronização foi sucesso
 *
 * ⚠️ ATUALMENTE DESABILITADO: Sem backend configurado
 */
export async function syncListingToBackend(listingId, authToken) {
  const listing = localListings[listingId];
  if (!listing) {
    return false;
  }
  const backendPayload = convertToBackendPayload(listing);
  const response = await post("/api/v1/listings", backendPayload, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
  if (!response.success) {
    await updateListingSyncStatus(
      listingId,
      "error",
      response.error || "Falha ao sincronizar com o backend"
    );
    return false;
  }
  const backendListing = response.data;
  if (backendListing?.id && backendListing.id !== listingId) {
    delete localListings[listingId];
    localListings[backendListing.id] = {
      ...listing,
      id: backendListing.id,
      statusSync: "synced",
      sincronizadoEm: new Date().toISOString(),
      ultimoErro: undefined,
    };
  } else {
    await updateListingSyncStatus(listingId, "synced");
  }
  await persistListingsToStorage();
  syncQueue = syncQueue.filter((item) => item.listingId !== listingId);
  await persistSyncQueueToStorage();
  return true;
}
/**
 * Sincroniza todos os anúncios pendentes
 */
export async function syncAllPendingListings(authToken) {
  let sucessos = 0;
  for (const queueItem of syncQueue) {
    const success = await syncListingToBackend(queueItem.listingId, authToken);
    if (success) sucessos++;
  }
  return sucessos;
}
// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÕES AUXILIARES PRIVADAS
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Converte LocalListing para formato esperado pelo backend
 */
function convertToBackendPayload(listing) {
  return {
    titulo: listing.titulo,
    descricao: listing.descricao || "",
    categoria: listing.tipo,
    subcategoria: listing.subcategoria,
    quantidade: parseInt(listing.quantidade) || 0,
    preco: parseFloat(listing.preco.replace("R$ ", "").replace(",", ".")) || 0,
    isDoacao: listing.isDoacao,
    vendedorUsername: listing.vendedor,
    loteCodigo: listing.loteCodigo,
    tipoCertificacao: listing.tipoCertificacao,
    numeroRegistro: listing.numeroRegistro || null,
    fotoUrl: listing.fotoUri || null,
    vendedorNome: listing.vendedorNome || null,
    criadoEm: listing.criadoEm,
  };
}
/**
 * Adiciona item à fila de sincronização
 */
async function addToSyncQueue(listingId, payload) {
  syncQueue.push({
    listingId,
    payload,
    tentativas: 0,
    proximaTentativaEm: new Date().toISOString(),
  });
  await persistSyncQueueToStorage();
}
/**
 * Persiste anúncios locais em AsyncStorage
 */
async function persistListingsToStorage() {
  try {
    await AsyncStorage.setItem(
      LISTINGS_STORAGE_KEY,
      JSON.stringify(localListings)
    );
  } catch (error) {
    console.error("Erro ao salvar anúncios:", error);
  }
}
/**
 * Persiste fila de sincronização em AsyncStorage
 */
async function persistSyncQueueToStorage() {
  try {
    await AsyncStorage.setItem(
      SYNC_QUEUE_STORAGE_KEY,
      JSON.stringify(syncQueue)
    );
  } catch (error) {
    console.error("Erro ao salvar fila de sincronização:", error);
  }
}
