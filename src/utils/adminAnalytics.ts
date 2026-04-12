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
  averageOrderValue: number;
  conversionRate: number; // Placeholder/Simulation
  growthRate: number; // Placeholder/Simulation
  topPerformingProduct: { name: string; sales: number };
}

import { getUsers } from "@/services/authStore";

export async function getAdminKPIs(): Promise<AdminKPI> {
  const users = await getUsers();
  const products = await getMarketplaceItems();
  const orders = await getAllOrders();

  const producers = users.filter((u) => u.role === "user");
  const buyers = users.filter((u) => u.role === "buyer");

  const totalSales = orders.reduce((acc, o) => acc + o.valorNumerico, 0);
  const producerSales = orders
    .filter((o) => o.vendedorUsername)
    .reduce((acc, o) => acc + o.valorNumerico, 0);
  const buyerPurchases = orders
    .filter((o) => o.comprador)
    .reduce((acc, o) => acc + o.valorNumerico, 0);

  const avgOrderValue = orders.length > 0 ? totalSales / orders.length : 0;

  const validPrices = products
    .map((p) => parseFloat(p.preco.replace("R$ ", "").replace(".", "").replace(",", ".")))
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

  // Top Performing Product
  const productSalesMap: { [key: string]: number } = {};
  orders.forEach((o) => {
    productSalesMap[o.produto] = (productSalesMap[o.produto] || 0) + o.valorNumerico;
  });
  const topProduct = Object.keys(productSalesMap).length > 0 
    ? Object.keys(productSalesMap).reduce((a, b) => productSalesMap[a] > productSalesMap[b] ? a : b)
    : "Nenhum";

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
    averageOrderValue: Math.round(avgOrderValue * 100) / 100,
    conversionRate: 12.5, // Simulado
    growthRate: 15.2, // Simulado
    topPerformingProduct: { name: topProduct, sales: productSalesMap[topProduct] || 0 }
  };
}

/**
 * ===== CSV EXPORT DATA =====
 * Exportações enriquecidas com todos os detalhes disponíveis
 */

export async function getProducersCSVData() {
  const users = await getUsers();
  const producers = users.filter((u) => u.role === "user");
  const orders = await getAllOrders();

  return producers.map((p) => {
    const producerOrders = orders.filter((o) => o.vendedorUsername === p.username);
    const totalVendas = producerOrders.reduce((acc, o) => acc + o.valorNumerico, 0);
    const quantidadeVendas = producerOrders.length;

    return {
      "ID do Usuário": p.username,
      "Nome Completo": p.fullName || "Não informado",
      "Nome da Fazenda": p.farmName || "N/A",
      "Documento": p.farmDocument || "N/A",
      "Tipo de Doc": p.farmDocumentType?.toUpperCase() || "N/A",
      "E-mail": p.email || "N/A",
      "Telefone": p.phone || "N/A",
      "Cidade": p.address?.city || "N/A",
      "Estado": p.address?.state || "N/A",
      "CEP": p.address?.cep || "N/A",
      "LGPD Aceito Em": p.lgpdAcceptedAt || "N/A",
      "Total Faturado": `R$ ${totalVendas.toFixed(2)}`,
      "Quantidade de Pedidos": quantidadeVendas,
      "Ticket Médio": `R$ ${quantidadeVendas > 0 ? (totalVendas / quantidadeVendas).toFixed(2) : "0.00"}`,
      "Última Venda": producerOrders.length > 0 ? producerOrders[0].data : "Nunca",
      "Status": "Ativo",
    };
  });
}

export async function getBuyersCSVData() {
  const users = await getUsers();
  const buyers = users.filter((u) => u.role === "buyer");
  const orders = await getAllOrders();

  return buyers.map((b) => {
    const buyerOrders = orders.filter((o) => o.comprador.toLowerCase() === b.username.toLowerCase());
    const totalGasto = buyerOrders.reduce((acc, o) => acc + o.valorNumerico, 0);
    const quantidadeCompras = buyerOrders.length;

    return {
      "ID do Comprador": b.username,
      "Nome Completo": b.fullName || "Não informado",
      "CPF": b.cpf || "N/A",
      "E-mail": b.email || "N/A",
      "Telefone": b.phone || "N/A",
      "Cidade": b.address?.city || "N/A",
      "Estado": b.address?.state || "N/A",
      "CEP": b.address?.cep || "N/A",
      "LGPD Aceito Em": b.lgpdAcceptedAt || "N/A",
      "Total Consumido": `R$ ${totalGasto.toFixed(2)}`,
      "Quantidade de Itens": quantidadeCompras,
      "Ticket Médio": `R$ ${quantidadeCompras > 0 ? (totalGasto / quantidadeCompras).toFixed(2) : "0.00"}`,
      "Última Compra": buyerOrders.length > 0 ? buyerOrders[0].data : "Nunca",
      "Status": "Ativo",
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
      "ID do Produto": p.id,
      "Nome do Produto": p.produto,
      "Produtor Vendedor": p.vendedor,
      "Categoria": p.categoria,
      "Subcategoria": p.subcategoria || "N/A",
      "Preço Base": p.preco,
      "Unidade": p.unidade || "N/A",
      "Estoque Atual": p.estoqueValor,
      "Certificação": p.tipoCertificacao,
      "Total Vendas (Qtd)": vendas,
      "Faturamento Total": `R$ ${faturamento.toFixed(2)}`,
      "Eficiência de Estoque": p.estoqueValor > 0 ? `${((vendas / (vendas + p.estoqueValor)) * 100).toFixed(1)}%` : "100%",
      "Lote": p.loteCodigo || "N/A",
    };
  });
}

export async function getSalesCSVData() {
  const orders = await getAllOrders();

  return orders.map((o) => {
    return {
      "ID do Pedido": o.id,
      "Data da Transação": o.data,
      "ID do Vendedor": o.vendedorUsername || "N/A",
      "ID do Comprador": o.comprador || "N/A",
      "Nome do Produto": o.produto,
      "Categoria": o.categoria,
      "Preço Unitário": o.valor,
      "Quantidade": o.quantidade,
      "Valor Total": `R$ ${o.valorNumerico.toFixed(2)}`,
      "Status Logístico": o.status,
      "Transportadora": o.transportadora || "Própria/Não informada",
    };
  });
}

export async function getReportsCSVData() {
  const users = await getUsers();

  // Simulando dados de relatórios enriquecidos
  return users.slice(0, 10).map((u, idx) => ({
    "ID da Ocorrência": `REP-${2025}${idx.toString().padStart(3, "0")}`,
    "Data de Aberura": new Date().toISOString().split("T")[0],
    "Usuário Envolvido": u.username,
    "Perfil": u.role === "user" ? "Produtor" : "Comprador",
    "Motivo da Denúncia": idx % 2 === 0 ? "Qualidade do Lote" : "Atraso na Entrega",
    "Severidade": idx % 3 === 0 ? "Alta" : "Média",
    "Evidências Anexadas": idx % 2 === 0 ? "Sim" : "Não",
    "Descrição": `Investigação automática de rotina para o usuário ${u.fullName || u.username}`,
    "Status de Resolução": "Em Análise",
  }));
}

