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
import { MarketplaceOpportunity } from "./marketplaceStore";

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS E INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Tipo de anúncio criado por um usuário (antes de persistência no backend)
 */
export type CreateListingPayload = {
  titulo: string;
  descricao?: string;
  tipo: "insumo" | "colheita" | "mercado";
  subcategoria: string;
  quantidade: string;
  preco: string;
  isDoacao: boolean;
  loteCodigo: string;
  tipoCertificacao: "Organico" | "Transicao" | "Convencional";
  numeroRegistro?: string;
  fotoUri?: string | null;
};

/**
 * Anúncio armazenado localmente com metadados
 */
export type LocalListing = CreateListingPayload & {
  id: string;
  vendedor: string; // username do criador
  criadoEm: string; // ISO timestamp
  sincronizadoEm?: string | null; // ISO timestamp da última sincronização
  statusSync: "pending" | "synced" | "error";
  ultimoErro?: string;
};

/**
 * Payload para injeção no backend Spring
 * Estrutura pronta para POST /api/listings
 */
export type ListingBackendPayload = {
  titulo: string;
  descricao: string;
  categoria: "insumo" | "colheita" | "mercado";
  subcategoria: string;
  quantidade: number;
  preco: number;
  isDoacao: boolean;
  vendedorUsername: string;
  loteCodigo: string;
  tipoCertificacao: "Organico" | "Transicao" | "Convencional";
  numeroRegistro: string | null;
  fotoUrl: string | null;
  criadoEm: string;
};

/**
 * Fila de sincronização para manter anúncios pendentes
 */
type SyncQueue = {
  listingId: string;
  payload: ListingBackendPayload;
  tentativas: number;
  proximaTentativaEm: string; // ISO timestamp
}[];

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTES E CHAVES DE STORAGE
// ═══════════════════════════════════════════════════════════════════════════

const LISTINGS_STORAGE_KEY = "@terra_nova/user_listings";
const SYNC_QUEUE_STORAGE_KEY = "@terra_nova/listings_sync_queue";

// ⚠️ Backend não configurado - app funciona 100% offline
// Remover comentário quando backend estiver pronto
// const BACKEND_API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:8080";

// ═══════════════════════════════════════════════════════════════════════════
// ESTADO EM MEMÓRIA
// ═══════════════════════════════════════════════════════════════════════════

let localListings: Record<string, LocalListing> = {};
let syncQueue: SyncQueue = [];

// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÕES PÚBLICAS - CRIAÇÃO E GESTÃO DE ANÚNCIOS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Inicializa o serviço de anúncios carregando dados do AsyncStorage
 */
export async function initListingService(): Promise<void> {
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
    
    console.log("✓ Serviço de anúncios inicializado (offline)");
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
export async function createListing(
  username: string,
  payload: CreateListingPayload
): Promise<LocalListing> {
  // Gera ID único
  const id = `listing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();

  const listing: LocalListing = {
    id,
    vendedor: username,
    criadoEm: now,
    statusSync: "pending",
    ...payload,
  };

  // Armazena em memória
  localListings[id] = listing;

  // Persiste em AsyncStorage
  await persistListingsToStorage();

  // Cria item na fila de sincronização
  const backendPayload = convertToBackendPayload(listing);
  await addToSyncQueue(id, backendPayload);

  console.log(`✓ Anúncio criado localmente: ${id}`);
  return listing;
}

/**
 * Obtém todos os anúncios de um usuário
 */
export function getUserListings(username: string): LocalListing[] {
  return Object.values(localListings).filter(
    (listing) => listing.vendedor === username
  );
}

/**
 * Obtém um anúncio específico
 */
export function getListing(listingId: string): LocalListing | null {
  return localListings[listingId] || null;
}

/**
 * Deleta um anúncio localmente
 */
export async function deleteListing(listingId: string): Promise<void> {
  delete localListings[listingId];
  await persistListingsToStorage();

  // Remove da fila de sync também
  syncQueue = syncQueue.filter((item) => item.listingId !== listingId);
  await persistSyncQueueToStorage();
}

/**
 * Atualiza status de sincronização de um anúncio
 */
export async function updateListingSyncStatus(
  listingId: string,
  status: "pending" | "synced" | "error",
  erro?: string
): Promise<void> {
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
export function getSyncQueue(): SyncQueue {
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
export async function syncListingToBackend(
  listingId: string,
  authToken: string
): Promise<boolean> {
  // ⚠️ Backend não configurado - sincronização desabilitada temporariamente
  console.warn(`⚠️ Backend não configurado. Anúncio ${listingId} permanece offline.`);
  
  // Apenas marca como erro com mensagem informativa
  await updateListingSyncStatus(
    listingId,
    "error",
    "Backend não configurado. Anúncio armazenado localmente."
  );
  
  return false;
}

/**
 * Sincroniza todos os anúncios pendentes
 */
export async function syncAllPendingListings(authToken: string): Promise<number> {
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
function convertToBackendPayload(listing: LocalListing): ListingBackendPayload {
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
    criadoEm: listing.criadoEm,
  };
}

/**
 * Adiciona item à fila de sincronização
 */
async function addToSyncQueue(
  listingId: string,
  payload: ListingBackendPayload
): Promise<void> {
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
async function persistListingsToStorage(): Promise<void> {
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
async function persistSyncQueueToStorage(): Promise<void> {
  try {
    await AsyncStorage.setItem(
      SYNC_QUEUE_STORAGE_KEY,
      JSON.stringify(syncQueue)
    );
  } catch (error) {
    console.error("Erro ao salvar fila de sincronização:", error);
  }
}
