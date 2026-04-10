import { getAdminUserSummaries } from "@/services/authStore";
import { getMarketplaceItems } from "@/services/marketplaceStore";
import { getAllOrders } from "@/services/ordersStore";

/**
 * ===== KPI ANALYTICS =====
 * Dashboard metrics para admin
 */

export interface AdminKPI {
  totalUsers: number;
  totalProducers: number;
  totalBuyers: number;
  totalProducts: number;
  totalSales: number;
  producerSalesTotal: number;
  buyerPurchasesTotal: number;
  averageProductPrice: number;
  productsInStock: number;
  productsOutOfStock: number;
  topCategory: string;
}

export async function getAdminKPIs(): Promise<AdminKPI> {
  const users = await getAdminUserSummaries();
  const products = await getMarketplaceItems();
  const orders = await getAllOrders();

  const producers = users.filter((u) => u.role === "user");
  const buyers = users.filter((u) => u.role === "buyer");

  const totalSales = orders.reduce((acc, o) => acc + o.valorNumerico, 0);
  const producerSales = orders
    .filter((o) => o.vendedorUsername) // Qualquer venda tem vendedor
    .reduce((acc, o) => acc + o.valorNumerico, 0);
  const buyerPurchases = orders
    .filter((o) => o.comprador) // Qualquer compra tem comprador
    .reduce((acc, o) => acc + o.valorNumerico, 0);

  const validPrices = products
    .map((p) => parseFloat(p.preco.replace("R$ ", "")))
    .filter((price) => !isNaN(price));
  const avgPrice = validPrices.length > 0 ? validPrices.reduce((a, b) => a + b) / validPrices.length : 0;

  const inStock = products.filter((p) => p.estoqueValor > 0).length;
  const outOfStock = products.filter((p) => p.estoqueValor === 0).length;

  // Categoria mais vendida
  const categoryCounts: { [key: string]: number } = {};
  products.forEach((p) => {
    if (p.subcategoria) {
      categoryCounts[p.subcategoria] = (categoryCounts[p.subcategoria] || 0) + 1;
    }
  });
  const topCategory =
    Object.keys(categoryCounts).length > 0
      ? Object.keys(categoryCounts).reduce((a, b) =>
          categoryCounts[a] > categoryCounts[b] ? a : b
        )
      : "N/A";

  return {
    totalUsers: users.length,
    totalProducers: producers.length,
    totalBuyers: buyers.length,
    totalProducts: products.length,
    totalSales,
    producerSalesTotal: producerSales,
    buyerPurchasesTotal: buyerPurchases,
    averageProductPrice: Math.round(avgPrice * 100) / 100,
    productsInStock: inStock,
    productsOutOfStock: outOfStock,
    topCategory,
  };
}

/**
 * ===== CSV EXPORT DATA =====
 * Exportações diferenciadas por role
 */

export async function getProducersCSVData() {
  const users = await getAdminUserSummaries();
  const producers = users.filter((u) => u.role === "user");
  const orders = await getAllOrders();

  return producers.map((p) => {
    const producerOrders = orders.filter((o) => o.vendedorUsername === p.username);
    const totalVendas = producerOrders.reduce((acc, o) => acc + o.valorNumerico, 0);
    const quantidadeVendas = producerOrders.length;

    return {
      username: p.username,
      farmName: p.farmName || "N/A",
      email: "N/A", // Campo não disponível no tipo
      telefone: "N/A", // Campo não disponível no tipo
      role: "Producer (Produtor)",
      dataRegistro: "N/A", // Campo não disponível no tipo
      totalVendas: `R$ ${totalVendas.toFixed(2)}`,
      quantidadeVendas,
      ultimaVenda: producerOrders.length > 0 ? producerOrders[0].data : "N/A",
      status: "Ativo",
    };
  });
}

export async function getBuyersCSVData() {
  const users = await getAdminUserSummaries();
  const buyers = users.filter((u) => u.role === "buyer");
  const orders = await getAllOrders();

  return buyers.map((b) => {
    const buyerOrders = orders.filter((o) => o.comprador === b.username);
    const totalGasto = buyerOrders.reduce((acc, o) => acc + o.valorNumerico, 0);
    const quantidadeCompras = buyerOrders.length;

    return {
      username: b.username,
      nomeCompleto: b.fullName || "N/A",
      email: "N/A", // Campo não disponível no tipo
      telefone: "N/A", // Campo não disponível no tipo
      role: "Buyer (Comprador)",
      cidade: "N/A", // Campo não disponível no tipo
      estado: "N/A", // Campo não disponível no tipo
      dataRegistro: "N/A", // Campo não disponível no tipo
      totalGasto: `R$ ${totalGasto.toFixed(2)}`,
      quantidadeCompras,
      ultimaCompra: buyerOrders.length > 0 ? buyerOrders[0].data : "N/A",
      status: "Ativo",
    };
  });
}

export async function getProductsCSVData() {
  const products = await getMarketplaceItems();
  const orders = await getAllOrders();

  return products.map((p) => {
    const productOrders = orders.filter((o) => o.produtoId === p.id);
    const vendas = productOrders.length;
    const faturamento = productOrders.reduce((acc, o) => acc + o.valorNumerico, 0);

    return {
      produtoId: p.id,
      nome: p.produto,
      produtor: p.vendedor,
      role: "Producer (De Produtor)",
      categoria: p.categoria,
      subcategoria: p.subcategoria || "N/A",
      preco: p.preco,
      estoque: p.estoqueValor,
      certificacao: p.tipoCertificacao,
      vendas,
      faturamento: `R$ ${faturamento.toFixed(2)}`,
      dataPublicacao: p.loteCodigo || "N/A",
    };
  });
}

export async function getSalesCSVData() {
  const orders = await getAllOrders();

  return orders.map((o) => {
    return {
      pedidoId: o.id,
      tipo: o.vendedorUsername ? "Venda (Producer)" : "Compra (Buyer)",
      origem: o.vendedorUsername ? "Producer (Produtor)" : "Buyer (Comprador)",
      produtor: o.vendedorUsername || "N/A",
      comprador: o.comprador || "N/A",
      produto: o.produto,
      categoria: o.categoria,
      valor: o.valor,
      quantidade: o.quantidade,
      status: o.status,
      data: o.data,
    };
  });
}

export async function getReportsCSVData() {
  const users = await getAdminUserSummaries();

  // Simulando dados de relatórios
  return users.slice(0, 5).map((u, idx) => ({
    reportId: `REP-${idx + 1}`,
    usuario: u.username,
    role: u.role === "user" ? "Producer (Produtor)" : "Buyer (Comprador)",
    tipo: "Comportamento Suspeito",
    descricao: `Possível atividade irregular em ${u.username}`,
    dataRelatorio: new Date().toISOString().split("T")[0],
    status: "Pendente",
    prioridade: "Media",
  }));
}
