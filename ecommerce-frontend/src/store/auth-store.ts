"use client";

import { create } from "zustand";
import type { UserBrief } from "@/types";
import { authStorage } from "@/lib/auth-storage";
import { authApi } from "@/lib/api/auth";
import type { AuthResponse } from "@/types";

interface AuthState {
  user: UserBrief | null;
  isHydrated: boolean;
  hydrate: () => void;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (
    fullName: string,
    email: string,
    password: string,
    phoneNumber?: string,
  ) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  setUser: (user: UserBrief) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isHydrated: false,

  hydrate: () => {
    const user = authStorage.getUser();
    set({ user, isHydrated: true });
  },

  login: async (email, password) => {
    const auth = await authApi.login({ email, password });
    authStorage.saveAuth(auth);
    set({ user: auth.user });
    return auth;
  },

  register: async (fullName, email, password, phoneNumber) => {
    const auth = await authApi.register({ fullName, email, password, phoneNumber });
    authStorage.saveAuth(auth);
    set({ user: auth.user });
    return auth;
  },

  logout: async () => {
    const refreshToken = authStorage.getRefreshToken();
    try {
      if (refreshToken) await authApi.logout(refreshToken);
    } finally {
      authStorage.clear();
      set({ user: null });
    }
  },

  setUser: (user) => set({ user }),
}));
