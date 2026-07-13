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
    throw new Error("Chưa cấu hình địa chỉ máy chủ API. Vui lòng liên hệ quản trị viên.");
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
    throw new ApiError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", 401);
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
  transformRequest: [
    (data, headers) => {
      // Handle FormData specially - don't set Content-Type
      if (data instanceof FormData) {
        return data;
      }
      // For JSON data, use default transform
      return JSON.stringify(data);
    },
  ],
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  config.baseURL = getApiUrl();
  const token = authStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    // Use .delete() method on AxiosHeaders to properly remove the header
    if (config.headers.delete) {
      config.headers.delete("Content-Type");
    } else {
      delete config.headers["Content-Type"];
    }
  } else {
    // Ensure JSON requests include the correct Content-Type header
    if (config.headers && typeof (config.headers as any).set === "function") {
      (config.headers as any).set("Content-Type", "application/json");
    } else if (config.headers) {
      config.headers["Content-Type"] = "application/json";
    }
  }

  if (config.method === "post" || config.method === "put") {
    console.debug("API request", {
      url: config.url,
      method: config.method,
      headers: JSON.stringify(config.headers),
      dataType: config.data instanceof FormData ? "FormData" : typeof config.data,
    });
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
      console.error(
        "API request failed",
        {
          url: original?.url,
          method: original?.method,
          status: error.response?.status,
          data: error.response?.data,
          headers: JSON.stringify(error.response?.headers),
          message: error.message,
        },
        "raw data:",
        JSON.stringify(error.response?.data),
      );
      const message =
        error.response?.data?.message || error.message || "Yêu cầu thất bại. Vui lòng thử lại.";
      throw new ApiError(message, error.response?.status, error.response?.data?.errors);
    }

    if (original.url?.includes("/auth/refresh-token")) {
      logoutAndRedirect();
      throw new ApiError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", 401);
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
