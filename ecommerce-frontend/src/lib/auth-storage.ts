import type { AuthResponse, UserBrief } from "@/types";

const ACCESS_KEY = "ecommerce_access_token";
const REFRESH_KEY = "ecommerce_refresh_token";
const USER_KEY = "ecommerce_user";
const ROLE_COOKIE = "ecommerce_role";
const AUTH_COOKIE = "ecommerce_authenticated";

function setCookie(name: string, value: string, maxAgeDays = 7) {
  if (typeof document === "undefined") return;
  const maxAge = maxAgeDays * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function clearCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0`;
}

export const authStorage = {
  saveAuth(auth: AuthResponse) {
    localStorage.setItem(ACCESS_KEY, auth.accessToken);
    localStorage.setItem(REFRESH_KEY, auth.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
    setCookie(ROLE_COOKIE, auth.user.role);
    setCookie(AUTH_COOKIE, "1");
  },

  updateTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem(ACCESS_KEY, accessToken);
    localStorage.setItem(REFRESH_KEY, refreshToken);
  },

  getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ACCESS_KEY);
  },

  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(REFRESH_KEY);
  },

  getUser(): UserBrief | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UserBrief;
    } catch {
      return null;
    }
  },

  setUser(user: UserBrief) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setCookie(ROLE_COOKIE, user.role);
  },

  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    clearCookie(ROLE_COOKIE);
    clearCookie(AUTH_COOKIE);
  },

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  },
};
