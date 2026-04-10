import AsyncStorage from "@react-native-async-storage/async-storage";

export type OrderStatus = "aguardando" | "transporte" | "finalizado";

export type Order = {
  id: string;
  vendedorUsername: string; // O vendedor (usuario logado)
  produto: string;
  produtoId?: string; // ID do produto no marketplace para baixar estoque
  quantidade: string;
  quantidadeNum: number; // Valor numérico para estoque
  valor: string;
  valorNumerico: number;
  data: string;
  comprador: string;
  transportadora?: string;
  status: OrderStatus;
  categoria: "alimentos" | "insumos" | "sementes" | "cultivo";
};

const ORDERS_STORAGE_KEY = "@terra_nova/orders_v2";

const DEFAULT_ORDERS: Order[] = [
  // 5 entregues (finalizados)
  { id: "VND001", vendedorUsername: "Sitio1", produto: "Milho Amarelo Premium", produtoId: "m1", quantidade: "50 kg", quantidadeNum: 50, valor: "R$ 450,00", valorNumerico: 450, data: "25/03/2025", comprador: "Mercado Central", status: "finalizado", categoria: "sementes" },
  { id: "VND002", vendedorUsername: "Sitio1", produto: "Feijão Carioca", produtoId: "m2", quantidade: "80 kg", quantidadeNum: 80, valor: "R$ 960,00", valorNumerico: 960, data: "24/03/2025", comprador: "Cooperativa Rural", status: "finalizado", categoria: "alimentos" },
  { id: "VND003", vendedorUsername: "Sitio1", produto: "Adubo NPK", produtoId: "c1", quantidade: "25 kg", quantidadeNum: 25, valor: "R$ 320,00", valorNumerico: 320, data: "20/03/2025", comprador: "João Silva", status: "finalizado", categoria: "insumos" },
  { id: "VND004", vendedorUsername: "Sitio2", produto: "Tomate Italiano", produtoId: "m3", quantidade: "15 kg", quantidadeNum: 15, valor: "R$ 65,00", valorNumerico: 65, data: "22/03/2025", comprador: "Restaurante Bio", status: "finalizado", categoria: "alimentos" },
  { id: "VND005", vendedorUsername: "Sitio3", produto: "Abóbora Cabotiá", produtoId: "m5", quantidade: "100 kg", quantidadeNum: 100, valor: "R$ 380,00", valorNumerico: 380, data: "18/03/2025", comprador: "Quitanda da Maria", status: "finalizado", categoria: "alimentos" },

  // 3 pendentes (aguardando)
  { id: "VND006", vendedorUsername: "Sitio1", produto: "Soja em Grão", produtoId: "m9_1", quantidade: "1000 kg", quantidadeNum: 1000, valor: "R$ 2.250,00", valorNumerico: 2250, data: "01/04/2025", comprador: "Export Agri", status: "aguardando", categoria: "sementes" },
  { id: "VND007", vendedorUsername: "Sitio4", produto: "Laranja Pera", produtoId: "m8_1", quantidade: "200 kg", quantidadeNum: 200, valor: "R$ 350,00", valorNumerico: 350, data: "02/04/2025", comprador: "Indústria Suco", status: "aguardando", categoria: "alimentos" },
  { id: "VND008", vendedorUsername: "Sitio5", produto: "Sorgo Granífero", produtoId: "m10_1", quantidade: "500 kg", quantidadeNum: 500, valor: "R$ 1.100,00", valorNumerico: 1100, data: "01/04/2025", comprador: "Ração Forte", status: "aguardando", categoria: "sementes" },

  // 2 em transporte
  { id: "VND009", vendedorUsername: "Sitio1", produto: "Milho Híbrido", produtoId: "c2", quantidade: "200 kg", quantidadeNum: 200, valor: "R$ 1.800,00", valorNumerico: 1800, data: "30/03/2025", comprador: "Agro S.A.", status: "transporte", transportadora: "TransLog Express", categoria: "sementes" },
  { id: "VND010", vendedorUsername: "Sitio2", produto: "Defensivo Orgânico", produtoId: "c3", quantidade: "10 L", quantidadeNum: 10, valor: "R$ 850,00", valorNumerico: 850, data: "31/03/2025", comprador: "Sitio Esperança", status: "transporte", transportadora: "Sedex Agro", categoria: "insumos" },
];

export async function initOrdersStore() {
  const existing = await AsyncStorage.getItem(ORDERS_STORAGE_KEY);
  if (!existing) {
    await AsyncStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(DEFAULT_ORDERS));
  }
}

export async function getOrdersByUser(username: string): Promise<Order[]> {
  const raw = await AsyncStorage.getItem(ORDERS_STORAGE_KEY);
  if (!raw) return [];
  const all: Order[] = JSON.parse(raw);
  return all.filter(o => o.vendedorUsername === username);
}

export async function getAllOrders(): Promise<Order[]> {
  const raw = await AsyncStorage.getItem(ORDERS_STORAGE_KEY);
  if (!raw) return [];
  return JSON.parse(raw);
}

export async function createOrder(order: Omit<Order, "id">) {
  const raw = await AsyncStorage.getItem(ORDERS_STORAGE_KEY);
  const all: Order[] = raw ? JSON.parse(raw) : [];
  
  const newOrder: Order = {
    ...order,
    id: `VND${Math.floor(Math.random() * 10000)}`,
  };

  all.push(newOrder);
  await AsyncStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(all));

  // Se já for criado como transporte ou finalizado, abate estoque
  if ((newOrder.status === "transporte" || newOrder.status === "finalizado") && newOrder.produtoId) {
    // TODO: Implementar abatimento de estoque ao criar ordem
    // await updateProductStock(newOrder.produtoId, newOrder.quantidadeNum);
  }

  return newOrder;
}

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
  const raw = await AsyncStorage.getItem(ORDERS_STORAGE_KEY);
  if (!raw) return;

  let all: Order[] = JSON.parse(raw);
  let orderToUpdate = all.find(o => o.id === orderId);

  if (orderToUpdate) {
    const oldStatus = orderToUpdate.status;
    orderToUpdate.status = newStatus;
    
    // Se mudou de aguardando para transporte/finalizado, abate o estoque
    if (oldStatus === "aguardando" && (newStatus === "transporte" || newStatus === "finalizado")) {
      if (orderToUpdate.produtoId) {
        // TODO: Implementar abatimento de estoque ao atualizar status do pedido
        // await updateProductStock(orderToUpdate.produtoId, orderToUpdate.quantidadeNum);
      }
    }

    await AsyncStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(all));
  }
}
