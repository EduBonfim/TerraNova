import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { DeviceEventEmitter } from "react-native";
import { getMarketplaceItems, MarketplaceOpportunity } from "./marketplaceStore";

export type CartItem = MarketplaceOpportunity & {
  cartQuantity: number;
};

const CART_STORAGE_KEY = "@terra_nova/buyer_cart";
const EVENT_CART_UPDATED = "EVENT_CART_UPDATED";

export const getCartItems = async (): Promise<CartItem[]> => {
  const raw = await AsyncStorage.getItem(CART_STORAGE_KEY);
  if (!raw) return [];
  return JSON.parse(raw);
};

export const addToCart = async (
  item: MarketplaceOpportunity,
  quantity: number = 1,
): Promise<void> => {
  // Validar estoque disponível
  if (quantity > item.estoqueValor) {
    throw new Error(
      `Apenas ${item.estoqueValor} unidades de "${item.produto}" disponíveis no estoque.`,
    );
  }

  const items = await getCartItems();

  if (items.length > 0) {
    const currentVendor = items[0].vendedor;
    if (item.vendedor !== currentVendor) {
      throw new Error(
        `O carrinho já possui itens do vendedor "${currentVendor}". Esvazie o carrinho para adicionar produtos de outro produtor.`,
      );
    }
  }

  const existingIndex = items.findIndex((i) => i.id === item.id);
  if (existingIndex >= 0) {
    // Validar que a quantidade total no carrinho não ultrapasse o estoque
    const newQuantity = items[existingIndex].cartQuantity + quantity;
    if (newQuantity > item.estoqueValor) {
      throw new Error(
        `Apenas ${item.estoqueValor} unidades de "${item.produto}" disponíveis. Você já tem ${items[existingIndex].cartQuantity} no carrinho.`,
      );
    }
    items[existingIndex].cartQuantity = newQuantity;
  } else {
    items.push({ ...item, cartQuantity: quantity });
  }

  await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  DeviceEventEmitter.emit(EVENT_CART_UPDATED, items);
};

export const updateCartQuantity = async (
  itemId: string,
  quantity: number,
): Promise<void> => {
  if (quantity <= 0) {
    return removeFromCart(itemId);
  }

  const items = await getCartItems();
  const existingIndex = items.findIndex((i) => i.id === itemId);
  if (existingIndex >= 0) {
    const item = items[existingIndex];

    const catalogItems = await getMarketplaceItems();
    const realItem = catalogItems.find((i) => i.id === itemId);
    const realEstoque = realItem ? realItem.estoqueValor : (item.estoqueValor || 0);

    // Validar se a quantidade não ultrapassa o estoque disponível
    if (quantity > realEstoque) {
      throw new Error(
        `Apenas ${realEstoque} unidades de "${item.produto}" disponíveis no estoque.`,
      );
    }

    // Atualiza com os dados mais recentes do catálogo
    if (realItem) {
      items[existingIndex] = { ...realItem, cartQuantity: quantity };
    } else {
      item.cartQuantity = quantity;
      item.estoqueValor = realEstoque;
    }
    
    await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    DeviceEventEmitter.emit(EVENT_CART_UPDATED, items);
  }
};

export const removeFromCart = async (itemId: string): Promise<void> => {
  let items = await getCartItems();
  items = items.filter((i) => i.id !== itemId);
  await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  DeviceEventEmitter.emit(EVENT_CART_UPDATED, items);
};

export const clearCart = async (): Promise<void> => {
  await AsyncStorage.removeItem(CART_STORAGE_KEY);
  DeviceEventEmitter.emit(EVENT_CART_UPDATED, []);
};

export function parseBRL(value: string): number {
  const numericStr = value
    .replace("R$", "")
    .replace(/\./g, "")
    .replace(",", ".")
    .trim();
  return parseFloat(numericStr) || 0;
}

export function formatBRL(value: number): string {
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
}

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    getCartItems().then(setCartItems);

    const sub = DeviceEventEmitter.addListener(
      EVENT_CART_UPDATED,
      (newItems: CartItem[]) => {
        setCartItems(newItems);
      },
    );

    return () => sub.remove();
  }, []);

  const totalItems = cartItems.reduce(
    (acc, item) => acc + item.cartQuantity,
    0,
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
