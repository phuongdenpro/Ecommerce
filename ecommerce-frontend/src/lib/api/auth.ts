import type { ApiResponse } from "@/types/api";
import type { AuthResponse } from "@/types";
import { apiClient } from "./client";
import { unwrapData } from "@/lib/api-response";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

export const authApi = {
  async login(payload: LoginPayload) {
    const { data } = await apiClient.post<ApiResponse<AuthResponse>>(
      "/auth/login",
      payload,
    );
    return unwrapData(data);
  },

  async register(payload: RegisterPayload) {
    const { data } = await apiClient.post<ApiResponse<AuthResponse>>(
      "/auth/register",
      payload,
    );
    return unwrapData(data);
  },

  async logout(refreshToken: string) {
    await apiClient.post("/auth/logout", { refreshToken });
  },

  async changePassword(currentPassword: string, newPassword: string) {
    await apiClient.post("/auth/change-password", {
      currentPassword,
      newPassword,
    });
  },

  async forgotPassword(email: string) {
    await apiClient.post("/auth/forgot-password", { email });
  },

  async resetPassword(
    email: string,
    token: string,
    newPassword: string,
  ) {
    await apiClient.post("/auth/reset-password", {
      email,
      token,
      newPassword,
    });
  },
};
