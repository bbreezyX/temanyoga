"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { CartItem } from "@/types/api";

function getCartItemKey(item: CartItem): string {
  const accIds = (item.accessories || [])
    .map((a) => a.id)
    .sort()
    .join(",");
  return `${item.productId}__${accIds}`;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  getItemKey: (item: CartItem) => string;
}

const CartContext = createContext<CartContextType | null>(null);

const CART_KEY = "temanyoga_cart";

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CART_KEY);
    if (!stored) return [];
    const items = JSON.parse(stored) as CartItem[];
    // Migrate old cart items without accessories field
    return items.map((item) => ({
      ...item,
      accessories: item.accessories || [],
    }));
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setItems(loadCart());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveCart(items);
  }, [items, loaded]);

  const addItem = useCallback((item: CartItem) => {
    const newItem = { ...item, accessories: item.accessories || [] };
    const newKey = getCartItemKey(newItem);

    setItems((prev) => {
      const existing = prev.find((i) => getCartItemKey(i) === newKey);
      if (existing) {
        return prev.map((i) =>
          getCartItemKey(i) === newKey
            ? { ...i, quantity: i.quantity + newItem.quantity }
            : i
        );
      }
      return [...prev, newItem];
    });
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((i) => getCartItemKey(i) !== key));
  }, []);

  const updateQuantity = useCallback((key: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => getCartItemKey(i) !== key));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (getCartItemKey(i) === key ? { ...i, quantity } : i))
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = items.reduce((sum, i) => {
    const accTotal = (i.accessories || []).reduce((a, acc) => a + acc.price, 0);
    return sum + (i.price + accTotal) * i.quantity;
  }, 0);

  return (
    <CartContext value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      cartCount,
      cartTotal,
      getItemKey: getCartItemKey,
    }}>
      {children}
    </CartContext>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
