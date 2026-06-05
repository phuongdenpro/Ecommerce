export type AdminTheme = "light" | "dark";

const STORAGE_KEY = "shopvn-admin-theme";

export function getAdminTheme(): AdminTheme {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "dark" ? "dark" : "light";
}

export function setAdminTheme(theme: AdminTheme) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, theme);
  applyAdminTheme(theme);
}

export function applyAdminTheme(theme: AdminTheme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
}

// Shop (customer) theme utilities
export type ShopTheme = "light" | "dark";

const SHOP_STORAGE_KEY = "shopvn-theme";

export function getShopTheme(): ShopTheme {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(SHOP_STORAGE_KEY);
  return stored === "dark" ? "dark" : "light";
}

export function setShopTheme(theme: ShopTheme) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SHOP_STORAGE_KEY, theme);
  applyShopTheme(theme);
}

export function applyShopTheme(theme: ShopTheme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
}
