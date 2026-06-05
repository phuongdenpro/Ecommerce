import type { ApiResponse } from "@/types/api";
import type { StoreSettings, UpdateStoreSettings } from "@/types/admin";
import { apiClient } from "@/lib/api/client";
import { unwrapData } from "@/lib/api-response";
import { pick, pickNumber } from "@/lib/normalize-api";

function normalizeSettings(raw: Record<string, unknown>): StoreSettings {
  return {
    storeName: String(pick(raw, "storeName", "StoreName") ?? ""),
    logoUrl: pick<string>(raw, "logoUrl", "LogoUrl"),
    supportEmail: pick<string>(raw, "supportEmail", "SupportEmail"),
    hotline: pick<string>(raw, "hotline", "Hotline"),
    address: pick<string>(raw, "address", "Address"),
    defaultShippingFee: pickNumber(raw, "defaultShippingFee", "DefaultShippingFee"),
    freeShippingThreshold: pickNumber(raw, "freeShippingThreshold", "FreeShippingThreshold"),
    enableCod: Boolean(pick(raw, "enableCod", "EnableCod") ?? true),
    enableBankTransfer: Boolean(pick(raw, "enableBankTransfer", "EnableBankTransfer") ?? true),
    enableOnlinePayment: Boolean(pick(raw, "enableOnlinePayment", "EnableOnlinePayment") ?? true),
  };
}

export const adminSettingsService = {
  async get() {
    const { data } = await apiClient.get<ApiResponse<Record<string, unknown>>>(
      "/admin/settings",
    );
    return normalizeSettings(unwrapData(data) as Record<string, unknown>);
  },

  async update(payload: UpdateStoreSettings) {
    const { data } = await apiClient.put<ApiResponse<Record<string, unknown>>>(
      "/admin/settings",
      payload,
    );
    return normalizeSettings(unwrapData(data) as Record<string, unknown>);
  },
};
