import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import type { ApiResponse } from "@/types/api";
import type { AuthResponse } from "@/types";
import { authStorage } from "@/lib/auth-storage";
import { unwrapData } from "@/lib/api-response";
import { ApiError } from "@/lib/api-error";

export { ApiError };

function getApiUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!base) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
  }
  return `${base.replace(/\/$/, "")}/api`;
}

let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  refreshQueue.forEach((p) => {
    if (error) p.reject(error);
    else if (token) p.resolve(token);
  });
  refreshQueue = [];
}

async function refreshAccessToken(): Promise<string> {
  const accessToken = authStorage.getAccessToken();
  const refreshToken = authStorage.getRefreshToken();
  if (!accessToken || !refreshToken) {
    throw new ApiError("Session expired", 401);
  }

  const { data } = await axios.post<ApiResponse<AuthResponse>>(
    `${getApiUrl()}/auth/refresh-token`,
    { accessToken, refreshToken },
  );

  const auth = unwrapData(data);
  authStorage.updateTokens(auth.accessToken, auth.refreshToken);
  authStorage.setUser(auth.user);
  return auth.accessToken;
}

function logoutAndRedirect() {
  authStorage.clear();
  if (typeof window !== "undefined") {
    const path = window.location.pathname;
    if (path.startsWith("/admin")) {
      window.location.href = "/login?redirect=/admin";
    } else if (!path.startsWith("/login") && !path.startsWith("/register")) {
      window.location.href = "/login";
    }
  }
}

export const apiClient: AxiosInstance = axios.create({
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  config.baseURL = getApiUrl();
  const token = authStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status !== 401 || !original || original._retry) {
      const message =
        error.response?.data?.message || error.message || "Request failed";
      throw new ApiError(message, error.response?.status, error.response?.data?.errors);
    }

    if (original.url?.includes("/auth/refresh-token")) {
      logoutAndRedirect();
      throw new ApiError("Session expired", 401);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({
          resolve: (token: string) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(original));
          },
          reject,
        });
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const newToken = await refreshAccessToken();
      processQueue(null, newToken);
      original.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(original);
    } catch (refreshError) {
      processQueue(refreshError, null);
      logoutAndRedirect();
      throw refreshError;
    } finally {
      isRefreshing = false;
    }
  },
);
