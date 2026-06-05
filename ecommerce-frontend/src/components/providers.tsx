"use client";

import { useEffect } from "react";
import { Toaster } from "sonner";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { authStorage } from "@/lib/auth-storage";

export function Providers({ children }: { children: React.ReactNode }) {
  const hydrate = useAuthStore((s) => s.hydrate);
  const user = useAuthStore((s) => s.user);
  const fetchCart = useCartStore((s) => s.fetchCart);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (user && authStorage.isAuthenticated()) {
      fetchCart();
    }
  }, [user, fetchCart]);

  return (
    <>
      {children}
      <Toaster position="top-right" richColors closeButton />
    </>
  );
}
