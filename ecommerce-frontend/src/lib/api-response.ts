import type { ApiResponse, PagedResult } from "@/types/api";
import { ApiError } from "@/lib/api-error";

/** Unwrap `data` from a standard API response. Throws if not successful. */
export function unwrapData<T>(response: ApiResponse<T>): T {
  if (!response.success || response.data === null || response.data === undefined) {
    const message =
      response.message ||
      (typeof response.errors === "string"
        ? response.errors
        : "Request failed");
    throw new ApiError(message, 400, response.errors);
  }
  return response.data;
}

/** Unwrap paginated `data` (PagedResult inside ApiResponse.data). */
export function unwrapPagedData<T>(
  response: ApiResponse<PagedResult<T>>,
): PagedResult<T> {
  return unwrapData(response);
}

/** Safe unwrap — returns null instead of throwing. */
export function unwrapDataOrNull<T>(response: ApiResponse<T>): T | null {
  if (!response.success || response.data === null || response.data === undefined) {
    return null;
  }
  return response.data;
}
