import type { ApiResponse } from "@/types/api";
import type { UserProfile } from "@/types";
import { apiClient } from "./client";
import { unwrapData } from "@/lib/api-response";

export const usersApi = {
  async getProfile() {
    const { data } = await apiClient.get<ApiResponse<UserProfile>>("/users/profile");
    return unwrapData(data);
  },

  async updateProfile(payload: {
    fullName: string;
    phoneNumber?: string;
    avatarUrl?: string;
  }) {
    const { data } = await apiClient.put<ApiResponse<UserProfile>>(
      "/users/profile",
      payload,
    );
    return unwrapData(data);
  },
};
