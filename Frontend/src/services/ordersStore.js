import AsyncStorage from "@react-native-async-storage/async-storage";
import { get, isBackendTemporarilyUnavailable, post, put } from "./api";
import { getCurrentSession } from "./authStore";
import { isValidStatus } from "@/constants/orderStatus";

const ORDERS_STORAGE_KEY = "@terra_nova/orders_v3";
const DEFAULT_ORDERS = [];

export async function initOrdersStore() {
  const existing = await AsyncStorage.getItem(ORDERS_STORAGE_KEY);
  if (!existing) {
    await AsyncStorage.setItem(
      ORDERS_STORAGE_KEY,
      JSON.stringify(DEFAULT_ORDERS)
    );
  }
}

export async function getOrdersByUser(username) {
  const session = await getCurrentSession();
  if (isBackendTemporarilyUnavailable()) {
    const raw = await AsyncStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) return [];
    const all = JSON.parse(raw);
    return all.filter(
      (o) => o.vendedorUsername.toLowerCase() === username.toLowerCase()
    );
  }
  if (session?.token) {
    try {
      const usuarioResponse = await get(
        `/api/v1/usuarios/username/${encodeURIComponent(username)}`
      );
      if (usuarioResponse.success && usuarioResponse.data?.id) {
        const vendedorId = usuarioResponse.data.id;
        const response = await get(`/api/v1/pedidos/vendedor/${vendedorId}`);
        if (response.success && response.data) {
          const remoteOrders = response.data.map((dto) => ({
            id: dto.id,
            vendedorUsername: dto.vendedorNome || username,
            produto: dto.produtoNome || "Produto Desconhecido",
            produtoId: dto.produtoId,
            quantidade: `${dto.quantidade || 1}`,
            quantidadeNum: dto.quantidade || 1,
            valor: `R$ ${(dto.valorTotal || 0).toFixed(2).replace(".", ",")}`,
            valorNumerico: dto.valorTotal || 0,
            data: dto.dataPedido
              ? new Date(dto.dataPedido).toLocaleDateString("pt-BR")
              : new Date().toLocaleDateString("pt-BR"),
            rawTimestamp: dto.dataPedido || null,
            comprador: dto.compradorNome || "Comprador",
            transportadora: dto.transportadora,
            status: dto.status || "aguardando",
            categoria: dto.categoria || "alimentos",
            compradorAvaliou: dto.compradorAvaliou,
            vendedorAvaliou: dto.vendedorAvaliou,
          }));
          return remoteOrders;
        }
      }
    } catch (e) {
      console.warn(
        "Failed to fetch remote orders for seller, falling back to local.",
        e
      );
    }
  }
  const raw = await AsyncStorage.getItem(ORDERS_STORAGE_KEY);
  if (!raw) return [];
  const all = JSON.parse(raw);
  return all.filter(
    (o) => o.vendedorUsername.toLowerCase() === username.toLowerCase()
  );
}

export async function getOrdersByBuyer(username) {
  const session = await getCurrentSession();
  if (isBackendTemporarilyUnavailable()) {
    const raw = await AsyncStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) return [];
    const all = JSON.parse(raw);
    return all.filter(
      (o) => o.comprador.toLowerCase() === username.toLowerCase()
    );
  }
  if (session?.token) {
    try {
      const usuarioResponse = await get(
        `/api/v1/usuarios/username/${encodeURIComponent(username)}`
      );
      if (usuarioResponse.success && usuarioResponse.data?.id) {
        const compradorId = usuarioResponse.data.id;
        const response = await get(`/api/v1/pedidos/comprador/${compradorId}`);
        if (response.success && response.data) {
          const remoteOrders = response.data.map((dto) => ({
            id: dto.id,
            vendedorUsername: dto.vendedorNome || "Vendedor",
            produto: dto.produtoNome || "Produto Desconhecido",
            produtoId: dto.produtoId,
            quantidade: `${dto.quantidade || 1}`,
            quantidadeNum: dto.quantidade || 1,
            valor: `R$ ${(dto.valorTotal || 0).toFixed(2).replace(".", ",")}`,
            valorNumerico: dto.valorTotal || 0,
            data: dto.dataPedido
              ? new Date(dto.dataPedido).toLocaleDateString("pt-BR")
              : new Date().toLocaleDateString("pt-BR"),
            rawTimestamp: dto.dataPedido || null,
            comprador: username,
            transportadora: dto.transportadora,
            status: dto.status || "aguardando",
            categoria: dto.categoria || "alimentos",
            compradorAvaliou: dto.compradorAvaliou,
            vendedorAvaliou: dto.vendedorAvaliou,
          }));
          return remoteOrders;
        }
      }
    } catch (e) {
      console.warn(
        "Failed to fetch remote orders for buyer, falling back to local.",
        e
      );
    }
  }
  const raw = await AsyncStorage.getItem(ORDERS_STORAGE_KEY);
  if (!raw) return [];
  const all = JSON.parse(raw);
  const buyerOrders = all.filter(
    (o) => o.comprador.toLowerCase() === username.toLowerCase()
  );

  // Normaliza para o mesmo formato da API (achatado: 1 item por objeto)
  const flattened = [];
  for (const order of buyerOrders) {
    if (order.items && Array.isArray(order.items)) {
      for (const item of order.items) {
        flattened.push({
          ...order,
          produto: item.produto,
          quantidade: item.quantidade,
          quantidadeNum: item.quantidade,
          valor: `R$ ${(item.valor || 0).toFixed(2).replace(".", ",")}`,
          valorNumerico: item.valor || 0,
          items: undefined,
        });
      }
    } else {
      flattened.push(order); // Compatibilidade com dados antigos que eu migrei do front pro meu backend kkkkkk TE AMO COGHI <3
    }
  }
  return flattened;
}

export async function getAllOrders() {
  const session = await getCurrentSession();
  if (isBackendTemporarilyUnavailable()) {
    const raw = await AsyncStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  }
  if (session?.token) {
    try {
      const response = await get("/api/v1/pedidos");
      if (response.success && response.data) {
        return response.data.map((dto) => ({
          id: dto.id,
          vendedorUsername: dto.vendedorNome || "Vendedor",
          produto: dto.produtoNome || "Produto Desconhecido",
          produtoId: dto.produtoId,
          quantidade: `${dto.quantidade || 1}`,
          quantidadeNum: dto.quantidade || 1,
          valor: `R$ ${(dto.valorTotal || 0).toFixed(2).replace(".", ",")}`,
          valorNumerico: dto.valorTotal || 0,
          data: dto.dataPedido
            ? new Date(dto.dataPedido).toLocaleDateString("pt-BR")
            : new Date().toLocaleDateString("pt-BR"),
          comprador: dto.compradorNome || "Comprador",
          transportadora: dto.transportadora,
          status:
            dto.status === "cancelado"
              ? "finalizado"
              : dto.status || "aguardando",
          categoria: dto.categoria || "alimentos",
          compradorAvaliou: dto.compradorAvaliou,
          vendedorAvaliou: dto.vendedorAvaliou,
        }));
      }
    } catch (e) {
      console.warn("Failed to fetch all orders from backend", e);
    }
  }
  const raw = await AsyncStorage.getItem(ORDERS_STORAGE_KEY);
  if (!raw) return [];
  return JSON.parse(raw);
}

export async function createOrder(order) {
  const session = await getCurrentSession();
  if (session?.token) {
    try {
      // Lógica de sincronização se necessária
    } catch (e) {
      console.warn("Failed to sync single order", e);
    }
  }
  const raw = await AsyncStorage.getItem(ORDERS_STORAGE_KEY);
  const all = raw ? JSON.parse(raw) : [];
  const newOrder = {
    ...order,
    id: `VND${Math.floor(Math.random() * 10000)}`,
  };
  all.push(newOrder);
  await AsyncStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(all));
  return newOrder;
}

export async function submitCheckout(payload) {
  const session = await getCurrentSession();
  if (!session?.token) {
    return {
      success: false,
      error: "Sua sessão expirou ou você não está autenticado. Faça login novamente.",
    };
  }

  try {
    const compRes = await get(
      `/api/v1/usuarios/username/${encodeURIComponent(
        payload.compradorUsername
      )}`
    );
    if (!compRes.success || !compRes.data?.id) {
      if (compRes.status === 401 || compRes.status === 403) {
        return {
          success: false,
          error:
            "Sua sessão expirou. Saia da conta e faça login novamente para finalizar a compra.",
        };
      }
      if (compRes.status === 0) {
        return {
          success: false,
          error:
            compRes.error ||
            "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.",
        };
      }
      return {
        success: false,
        error:
          compRes.error ||
          "Não foi possível identificar sua conta no servidor. Faça login novamente.",
      };
    }

    const vendRes = await get(
      `/api/v1/usuarios/username/${encodeURIComponent(
        payload.vendedorUsername
      )}`
    );
    if (!vendRes.success || !vendRes.data?.id) {
      if (vendRes.status === 401 || vendRes.status === 403) {
        return {
          success: false,
          error:
            "Sua sessão expirou. Saia da conta e faça login novamente para finalizar a compra.",
        };
      }
      return {
        success: false,
        error:
          vendRes.error ||
          "Não foi possível localizar o produtor deste anúncio no servidor.",
      };
    }

    const checkoutReq = {
      compradorId: compRes.data.id,
      vendedorId: vendRes.data.id,
      items: payload.items.map((i) => ({
        produtoId: String(i.produtoId).startsWith("listing-")
          ? null
          : i.produtoId,
        produtoNome: i.produtoNome || null,
        categoria: i.categoria || null,
        quantidade: i.quantidade,
        valorUnitario: i.valorUnitario,
      })),
    };

    const response = await post("/api/v1/pedidos/checkout", checkoutReq);
    if (response.success) {
      return { success: true, data: response.data };
    }

    if (response.status === 409) {
      return {
        success: false,
        error:
          response.error && !/^HTTP \d+$/.test(response.error)
            ? response.error
            : "Estoque insuficiente para a quantidade selecionada. Reduza a quantidade no carrinho e tente novamente.",
      };
    }

    if (response.status === 401) {
      return {
        success: false,
        error:
          "Sua sessão expirou. Faça login novamente para finalizar a compra.",
      };
    }

    if (response.status === 403) {
      return {
        success: false,
        error:
          response.error && !/^HTTP \d+$/.test(response.error)
            ? response.error
            : "Ação não permitida. Verifique se você não está tentando comprar o próprio produto ou se sua sessão expirou.",
      };
    }

    if (response.status === 0) {
      return {
        success: false,
        error:
          response.error ||
          "Falha de conexão com o servidor. Verifique sua internet.",
      };
    }

    return {
      success: false,
      error:
        response.error && !/^HTTP \d+$/.test(response.error)
          ? response.error
          : `Não foi possível finalizar o pedido (erro ${response.status}).`,
    };
  } catch (e) {
    console.warn("Falha ao salvar no backend", e);
    return {
      success: false,
      error: "Falha de rede ao conectar com o servidor.",
    };
  }
}

export async function updateOrderStatus(orderId, newStatus) {
  if (!isValidStatus(newStatus)) {
    console.error(`❌ Invalid order status: ${newStatus}`);
    throw new Error(
      `Invalid order status: ${newStatus}. Valid: aguardando, transporte, finalizado, cancelado`
    );
  }

  const session = await getCurrentSession();
  if (session?.token) {
    try {
      const response = await get(`/api/v1/pedidos/${orderId}`);
      if (response.success && response.data) {
        const dto = response.data;
        dto.status = newStatus;
        await put(`/api/v1/pedidos/${orderId}`, dto);
      }
    } catch (e) {
      console.warn("Falha ao atualizar status remoto", e);
    }
  }
  const raw = await AsyncStorage.getItem(ORDERS_STORAGE_KEY);
  if (!raw) return;
  let all = JSON.parse(raw);
  let orderToUpdate = all.find((o) => o.id === orderId);
  if (orderToUpdate) {
    const oldStatus = orderToUpdate.status;
    orderToUpdate.status = newStatus;
    if (
      oldStatus === "aguardando" &&
      (newStatus === "transporte" || newStatus === "finalizado")
    ) {
      if (orderToUpdate.produtoId) {
        try {
          const {
            getMarketplaceItems,
            updateMarketplaceItem,
          } = require("./marketplaceStore");
          const items = await getMarketplaceItems();
          const item = items.find((i) => i.id === orderToUpdate.produtoId);
          if (item) {
            const newStock = Math.max(
              0,
              item.estoqueValor - orderToUpdate.quantidadeNum
            );
            await updateMarketplaceItem(item.id, { estoqueValor: newStock });
          }
        } catch (e) {
          console.error("Erro ao abater estoque:", e);
        }
      }
    }
    await AsyncStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(all));
  }
}
/**
 * Confirmar envio: AGUARDANDO → TRANSPORTE (Apenas vendedor)
 * @param {string} orderId - UUID do pedido
 * @returns {Promise<Object>} DTO do pedido atualizado
 * @throws {Error} Se não autorizado ou transição inválida
 */
export async function confirmShipment(orderId) {
  const session = await getCurrentSession();
  if (!session?.token) {
    throw new Error("Não autenticado");
  }

  try {
    // Endpoint dedicado de transição de status para garantir regras de negócio no backend
    const response = await post(
      `/api/v1/pedidos/${orderId}/confirmar-envio`,
      {}
    );

    if (response.success && response.data) {
      // Atualiza o status localmente para refletir a mudança imediata na UI
      const raw = await AsyncStorage.getItem(ORDERS_STORAGE_KEY);
      if (raw) {
        let all = JSON.parse(raw);
        let orderToUpdate = all.find((o) => o.id === orderId);
        if (orderToUpdate) {
          orderToUpdate.status = response.data.status || "transporte";
          await AsyncStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(all));
        }
      }
      return response.data;
    } else if (response.error) {
      throw new Error(response.error || "Erro ao confirmar envio");
    }
  } catch (error) {
    console.error("❌ Error confirming shipment:", error);
    throw error;
  }
}

/**
 * Confirmar recebimento: TRANSPORTE → FINALIZADO (Apenas comprador)
 * @param {string} orderId - UUID do pedido
 * @returns {Promise<Object>} DTO do pedido atualizado
 * @throws {Error} Se não autorizado ou transição inválida
 */
export async function confirmReceipt(orderId) {
  const session = await getCurrentSession();
  if (!session?.token) {
    throw new Error("Não autenticado");
  }

  try {
    // Endpoint dedicado de transição de status para garantir regras de negócio no backend
    const response = await post(
      `/api/v1/pedidos/${orderId}/confirmar-recebimento`,
      {}
    );

    if (response.success && response.data) {
      // Atualiza o status localmente para refletir a mudança imediata na UI
      const raw = await AsyncStorage.getItem(ORDERS_STORAGE_KEY);
      if (raw) {
        let all = JSON.parse(raw);
        let orderToUpdate = all.find((o) => o.id === orderId);
        if (orderToUpdate) {
          orderToUpdate.status = response.data.status || "finalizado";
          await AsyncStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(all));
        }
      }
      return response.data;
    } else if (response.error) {
      throw new Error(response.error || "Erro ao confirmar recebimento");
    }
  } catch (error) {
    console.error("❌ Error confirming receipt:", error);
    throw error;
  }
}

/**
 * Cancelar pedido: AGUARDANDO → CANCELADO (Apenas comprador, deve estar em AGUARDANDO)
 * @param {string} orderId - UUID do pedido
 * @param {string} motivo - Motivo do cancelamento (opcional)
 * @returns {Promise<Object>} DTO do pedido atualizado com status=cancelado
 * @throws {Error} Se não autorizado ou estado inválido (apenas AGUARDANDO pode ser cancelado)
 */
export async function cancelOrder(orderId, motivo = null) {
  const session = await getCurrentSession();
  if (!session?.token) {
    throw new Error("Não autenticado");
  }

  try {
    // Valida estado atual antes de tentar cancelar
    let url = `/api/v1/pedidos/${orderId}/cancelar`;
    if (motivo) {
      url += `?motivo=${encodeURIComponent(motivo)}`;
    }

    // Endpoint dedicado de cancelamento para garantir regras de negócio no backend (ex: só permite cancelar se estiver em AGUARDANDO)
    const response = await post(url, {});

    if (response.success && response.data) {
      // Atualiza o status localmente para refletir a mudança imediata na UI
      const raw = await AsyncStorage.getItem(ORDERS_STORAGE_KEY);
      if (raw) {
        let all = JSON.parse(raw);
        let orderToUpdate = all.find((o) => o.id === orderId);
        if (orderToUpdate) {
          orderToUpdate.status = response.data.status || "cancelado";
          await AsyncStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(all));
        }
      }
      return response.data;
    } else if (response.error) {
      throw new Error(response.error || "Erro ao cancelar pedido");
    }
  } catch (error) {
    console.error("❌ Error cancelling order:", error);
    throw error;
  }
}

/**
 *
 * Sistema bidirecional: COMPRADOR_AVALIA_PRODUTOR
 *
 * @param {string} orderId - UUID do pedido
 * @param {number} nota - Avaliação de 1-5
 * @param {string} comentario - Comentário opcional
 * @returns {Promise<Object>} Objeto da avaliação criada
 * @throws {Error} Se não autorizado, estado inválido ou avaliação duplicada
 */
export async function submitBuyerReview(orderId, nota, comentario = null) {
  const session = await getCurrentSession();
  if (!session?.token) {
    throw new Error("Não autenticado");
  }

  const payload = {
    nota: parseInt(nota, 10),
    comentario: comentario || "",
  };

  const response = await post(
    `/api/v1/pedidos/${orderId}/avaliacoes/comprador`,
    payload
  );

  // 400 significa "já avaliou este pedido" - trata silenciosamente
  if (response.status === 400) {
    return { alreadyReviewed: true };
  }

  if (response.success && response.data) {
    return response.data;
  }

  throw new Error(response.error || "Falha ao enviar avaliação do comprador.");
}

/**
 * Enviar avaliação do vendedor sobre o comprador
 * Sistema bidirecional: PRODUTOR_AVALIA_COMPRADOR
 *
 * @param {string} orderId - UUID do pedido
 * @param {number} nota - Avaliação de 1-5
 * @param {string} comentario - Comentário opcional
 * @returns {Promise<Object>} Objeto da avaliação criada
 * @throws {Error} Se não autorizado, estado inválido ou avaliação duplicada
 */
export async function submitSellerReview(orderId, nota, comentario = null) {
  const session = await getCurrentSession();
  if (!session?.token) {
    throw new Error("Não autenticado");
  }

  const payload = {
    nota: parseInt(nota, 10),
    comentario: comentario || "",
  };

  const response = await post(
    `/api/v1/pedidos/${orderId}/avaliacoes/produtor`,
    payload
  );

  // 400 significa "já avaliou este pedido" - trata silenciosamente
  if (response.status === 400) {
    return { alreadyReviewed: true };
  }

  if (response.success && response.data) {
    return response.data;
  }

  throw new Error(response.error || "Falha ao enviar avaliação do vendedor.");
}

/**
 * Obter todas as avaliações de um pedido
 * Retorna tanto as avaliações do comprador quanto do vendedor se existirem
 *
 * @param {string} orderId - UUID do pedido
 * @returns {Promise<Array>} Array com objetos de avaliação
 * @throws {Error} Se não autenticado ou pedido não encontrado
 */
export async function getOrderReviews(orderId) {
  const session = await getCurrentSession();
  if (!session?.token) {
    throw new Error("Não autenticado");
  }

  try {
    const response = await get(`/api/v1/pedidos/${orderId}/avaliacoes`);

    if (response.success && Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error("❌ Error fetching order reviews:", error);
    return [];
  }
}
