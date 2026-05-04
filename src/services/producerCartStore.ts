import AsyncStorage from "@react-native-async-storage/async-storage";
import { DeviceEventEmitter } from "react-native";
import { useEffect, useState } from "react";
import { MarketplaceOpportunity } from "./marketplaceStore";

export type CartItem = MarketplaceOpportunity & {
  cartQuantity: number;
};

const CART_STORAGE_KEY = "@terra_nova/producer_cart";
const EVENT_CART_UPDATED = "EVENT_PRODUCER_CART_UPDATED";

export const getProducerCartItems = async (): Promise<CartItem[]> => {
  const raw = await AsyncStorage.getItem(CART_STORAGE_KEY);
  if (!raw) return [];
  return JSON.parse(raw);
};

export const addToProducerCart = async (item: MarketplaceOpportunity, quantity: number = 1): Promise<void> => {
  const items = await getProducerCartItems();
  
  if (items.length > 0) {
    const currentVendor = items[0].vendedor;
    if (item.vendedor !== currentVendor) {
      throw new Error(`O carrinho já possui itens do vendedor "${currentVendor}". Esvazie o carrinho para adicionar produtos de outro produtor.`);
    }
  }

  const existingIndex = items.findIndex((i) => i.id === item.id);
  if (existingIndex >= 0) {
    items[existingIndex].cartQuantity += quantity;
  } else {
    items.push({ ...item, cartQuantity: quantity });
  }

  await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  DeviceEventEmitter.emit(EVENT_CART_UPDATED, items);
};

export const updateProducerCartQuantity = async (itemId: string, quantity: number): Promise<void> => {
  if (quantity <= 0) {
    return removeFromProducerCart(itemId);
  }
  const items = await getProducerCartItems();
  const existingIndex = items.findIndex((i) => i.id === itemId);
  if (existingIndex >= 0) {
    items[existingIndex].cartQuantity = quantity;
    await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    DeviceEventEmitter.emit(EVENT_CART_UPDATED, items);
  }
};

export const removeFromProducerCart = async (itemId: string): Promise<void> => {
  let items = await getProducerCartItems();
  items = items.filter(i => i.id !== itemId);
  await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  DeviceEventEmitter.emit(EVENT_CART_UPDATED, items);
};

export const clearProducerCart = async (): Promise<void> => {
  await AsyncStorage.removeItem(CART_STORAGE_KEY);
  DeviceEventEmitter.emit(EVENT_CART_UPDATED, []);
};

export function parseBRL(value: string): number {
  const numericStr = value.replace("R$", "").replace(/\./g, "").replace(",", ".").trim();
  return parseFloat(numericStr) || 0;
}

export function formatBRL(value: number): string {
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
}

export function useProducerCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    getProducerCartItems().then(setCartItems);

    const sub = DeviceEventEmitter.addListener(EVENT_CART_UPDATED, (newItems: CartItem[]) => {
      setCartItems(newItems);
    });

    return () => sub.remove();
  }, []);

  const totalItems = cartItems.reduce((acc, item) => acc + item.cartQuantity, 0);
  const vendorName = cartItems.length > 0 ? cartItems[0].vendedor : null;

  const totalValueNum = cartItems.reduce((acc, item) => {
    return acc + (parseBRL(item.preco) * item.cartQuantity);
  }, 0);

  const totalValue = formatBRL(totalValueNum);

  return {
    cartItems,
    totalItems,
    vendorName,
    totalValue,
    totalValueNum
  };
}
