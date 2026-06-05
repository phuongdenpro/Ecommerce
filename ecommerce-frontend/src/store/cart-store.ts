"use client";

import { create } from "zustand";
import type { Cart } from "@/types";
import { cartApi } from "@/lib/api/cart";

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearLocal: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  cart: null,
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const cart = await cartApi.getCart();
      set({ cart });
    } catch {
      set({ cart: null });
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: async (productId, quantity = 1) => {
    const cart = await cartApi.addItem(productId, quantity);
    set({ cart });
  },

  updateItem: async (itemId, quantity) => {
    const cart = await cartApi.updateItem(itemId, quantity);
    set({ cart });
  },

  removeItem: async (itemId) => {
    const cart = await cartApi.removeItem(itemId);
    set({ cart });
  },

  clearLocal: () => set({ cart: null }),
}));
