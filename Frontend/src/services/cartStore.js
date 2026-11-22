import { getCurrentSession } from "@/services/authStore";
import { getMarketplaceItems } from "@/services/marketplaceStore"; // Removido MarketplaceOpportunity (tipo)
import { useEffect, useState } from "react";
import { DeviceEventEmitter } from "react-native";

const EVENT_CART_UPDATED = "EVENT_CART_UPDATED";

function normalizeName(value) {
  return (value || "").trim().toLowerCase();
}

async function validateOwnProductPurchase(item) {
  const session = await getCurrentSession();
  const currentUser = session?.user;
  if (!currentUser || currentUser.role !== "producer") {
    return;
  }
  const currentUsername = normalizeName(currentUser.username);
  const sellerUsername = normalizeName(item.vendedorUsername || item.vendedor);
  if (currentUsername && sellerUsername && currentUsername === sellerUsername) {
    throw new Error("O produtor não pode comprar o próprio produto.");
  }
}

// Estado em memória apenas
let inMemoryCart = [];

export const getCartItems = async () => {
  return inMemoryCart;
};

async function resolveAvailableStock(item) {
  try {
    const catalogItems = await getMarketplaceItems();
    const realItem = catalogItems.find((i) => String(i.id) === String(item.id));
    if (realItem && realItem.estoqueValor !== undefined && realItem.estoqueValor !== null) {
      return {
        stock: Math.max(0, Number(realItem.estoqueValor) || 0),
        realItem,
      };
    }
  } catch (e) {
    console.warn("Falha ao consultar estoque atualizado:", e);
  }
  return {
    stock: Math.max(0, Number(item.estoqueValor) || 0),
    realItem: null,
  };
}

export const addToCart = async (item, quantity = 1) => {
  await validateOwnProductPurchase(item);
  const localStock =
    item.estoqueValor !== undefined && item.estoqueValor !== null
      ? Math.max(0, Number(item.estoqueValor) || 0)
      : null;
  const existingBefore = inMemoryCart.find(
    (i) => String(i.id) === String(item.id)
  );
  if (localStock !== null) {
    const projected = (existingBefore?.cartQuantity || 0) + quantity;
    if (localStock <= 0 || projected > localStock) {
      throw new Error(
        `Apenas ${localStock} unidades de "${item.produto}" disponíveis no estoque.`
      );
    }
  }

  const { stock: availableStock, realItem } = await resolveAvailableStock(item);
  const itemToAdd = realItem ? { ...realItem } : { ...item, estoqueValor: availableStock };

  if (availableStock <= 0 || quantity > availableStock) {
    throw new Error(
      `Apenas ${availableStock} unidades de "${itemToAdd.produto}" disponíveis no estoque.`
    );
  }
  const items = inMemoryCart;
  if (items.length > 0) {
    const currentVendor = items[0].vendedor;
    if (itemToAdd.vendedor !== currentVendor) {
      throw new Error(
        `O carrinho já possui itens do vendedor "${currentVendor}". Esvazie o carrinho para adicionar produtos de outro produtor.`
      );
    }
  }
  const existingIndex = items.findIndex(
    (i) => String(i.id) === String(itemToAdd.id)
  );
  if (existingIndex >= 0) {
    const newQuantity = items[existingIndex].cartQuantity + quantity;
    if (newQuantity > availableStock) {
      throw new Error(
        `Apenas ${availableStock} unidades de "${itemToAdd.produto}" disponíveis no estoque. Você já tem ${items[existingIndex].cartQuantity} no carrinho.`
      );
    }
    items[existingIndex] = { ...itemToAdd, cartQuantity: newQuantity };
  } else {
    items.push({ ...itemToAdd, cartQuantity: quantity });
  }
  inMemoryCart = [...items];
  DeviceEventEmitter.emit(EVENT_CART_UPDATED, inMemoryCart);
};

export const updateCartQuantity = async (itemId, quantity) => {
  if (quantity <= 0) {
    return removeFromCart(itemId);
  }
  const items = inMemoryCart;
  const existingIndex = items.findIndex((i) => String(i.id) === String(itemId));
  if (existingIndex >= 0) {
    const item = items[existingIndex];
    if (
      item.estoqueValor !== undefined &&
      item.estoqueValor !== null &&
      quantity > Number(item.estoqueValor)
    ) {
      throw new Error(
        `Apenas ${Number(item.estoqueValor)} unidades de "${item.produto}" disponíveis no estoque.`
      );
    }
    const { stock: realEstoque, realItem } = await resolveAvailableStock(item);
    if (quantity > realEstoque) {
      throw new Error(
        `Apenas ${realEstoque} unidades de "${item.produto}" disponíveis no estoque.`
      );
    }
    if (realItem) {
      items[existingIndex] = { ...realItem, cartQuantity: quantity };
    } else {
      items[existingIndex] = {
        ...item,
        cartQuantity: quantity,
        estoqueValor: realEstoque,
      };
    }
    inMemoryCart = [...items];
    DeviceEventEmitter.emit(EVENT_CART_UPDATED, inMemoryCart);
  }
};

export const removeFromCart = async (itemId) => {
  let items = inMemoryCart;
  items = items.filter((i) => i.id !== itemId);
  inMemoryCart = [...items];
  DeviceEventEmitter.emit(EVENT_CART_UPDATED, inMemoryCart);
};

export const clearCart = async () => {
  inMemoryCart = [];
  DeviceEventEmitter.emit(EVENT_CART_UPDATED, []);
};

export function parseBRL(value) {
  const numericStr = value
    .replace("R$", "")
    .replace(/\./g, "")
    .replace(",", ".")
    .trim();
  return parseFloat(numericStr) || 0;
}

export function formatBRL(value) {
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
}

export function useCart() {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    getCartItems().then(setCartItems);
    const sub = DeviceEventEmitter.addListener(
      EVENT_CART_UPDATED,
      (newItems) => {
        setCartItems(newItems);
      }
    );
    return () => sub.remove();
  }, []);

  const totalItems = cartItems.reduce(
    (acc, item) => acc + item.cartQuantity,
    0
  );
  const vendorName = cartItems.length > 0 ? cartItems[0].vendedor : null;
  const totalValueNum = cartItems.reduce((acc, item) => {
    return acc + parseBRL(item.preco) * item.cartQuantity;
  }, 0);
  const totalValue = formatBRL(totalValueNum);

  return {
    cartItems,
    totalItems,
    vendorName,
    totalValue,
    totalValueNum,
  };
}
