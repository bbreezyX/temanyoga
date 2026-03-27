"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { nanoid } from "nanoid";
import type { CartItem } from "@/types/api";

function getCartItemKey(item: CartItem): string {
  const accIds = (item.accessories || [])
    .map((a) => `${a.id}:${a.selectedColor ?? ""}`)
    .sort()
    .join(",");
  return `${item.productId}__${accIds}`;
}

function ensureCartLineId(item: CartItem): CartItem {
  return {
    ...item,
    cartLineId: item.cartLineId || nanoid(12),
  };
}

interface CartContextType {
  items: CartItem[];
  isLoaded: boolean;
  addItem: (item: CartItem) => void;
  replaceItem: (originalKey: string, item: CartItem) => void;
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
    return items.map((item) =>
      ensureCartLineId({
        ...item,
        accessories: (item.accessories || []).map((accessory) => ({
          ...accessory,
          selectedColor: accessory.selectedColor ?? null,
        })),
      }),
    );
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

function subscribeToHydration() {
  return () => {};
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => loadCart());
  const loaded = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );

  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    if (!loaded) return;
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => saveCart(items), 150);
    return () => clearTimeout(saveTimerRef.current);
  }, [items, loaded]);

  useEffect(() => {
    if (!loaded) return;

    function handleStorage(event: StorageEvent) {
      if (event.key !== CART_KEY) {
        return;
      }

      setItems(loadCart());
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [loaded]);

  const addItem = useCallback((item: CartItem) => {
    const newItem = ensureCartLineId({ ...item, accessories: item.accessories || [] });
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

  const replaceItem = useCallback((originalKey: string, item: CartItem) => {
    const nextItem = ensureCartLineId({ ...item, accessories: item.accessories || [] });
    const nextKey = getCartItemKey(nextItem);

    setItems((prev) => {
      const originalIndex = prev.findIndex((cartItem) => getCartItemKey(cartItem) === originalKey);
      const withoutOriginal = prev.filter((cartItem) => getCartItemKey(cartItem) !== originalKey);
      const mergeIndex = withoutOriginal.findIndex((cartItem) => getCartItemKey(cartItem) === nextKey);

      if (mergeIndex >= 0) {
        return withoutOriginal.map((cartItem, index) =>
          index === mergeIndex
            ? { ...cartItem, quantity: cartItem.quantity + nextItem.quantity }
            : cartItem,
        );
      }

      if (originalIndex === -1) {
        return [...withoutOriginal, nextItem];
      }

      const nextItems = [...withoutOriginal];
      nextItems.splice(Math.min(originalIndex, nextItems.length), 0, nextItem);
      return nextItems;
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

  const cartCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );
  const cartTotal = useMemo(
    () =>
      items.reduce((sum, i) => {
        const accTotal = (i.accessories || []).reduce((a, acc) => a + acc.price, 0);
        return sum + (i.price + accTotal) * i.quantity;
      }, 0),
    [items]
  );

  return (
    <CartContext value={{
      items,
      isLoaded: loaded,
      addItem,
      replaceItem,
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
