import axios from "axios";
import { getStoredToken } from "@/services/authService";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.healthinpocket.in/api";

export class ApiError extends Error {
  constructor(message, meta = {}) {
    super(message);
    this.name = "ApiError";
    this.status = meta.status;
    this.type = meta.type;
    this.errors = meta.errors;
    this.raw = meta.raw;
  }
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data ?? {};
    const formattedErrors = Object.values(data.errors || {})
      .flat()
      .filter(Boolean)
      .join(" ");

    const message =
      formattedErrors ||
      data.message ||
      data.error ||
      error.message ||
      "Request failed";

    if (status === 401) {
      throw new ApiError("Unauthorized. Please sign in again.", {
        status: 401,
        type: "unauthorized",
        raw: data,
      });
    }

    if (status === 422) {
      throw new ApiError(message, {
        status: 422,
        type: "validation",
        errors: data.errors,
        raw: data,
      });
    }

    if (status >= 500) {
      throw new ApiError("Server error. Please try again later.", {
        status,
        type: "server",
        raw: data,
      });
    }

    if (!error.response) {
      throw new ApiError("Network error. Check your connection and try again.", {
        type: "network",
      });
    }

    throw new ApiError(message, { status, type: "error", errors: data.errors, raw: data });
  }
);

/**
 * Unwrap common Laravel response envelopes.
 * @param {unknown} response
 */
export function unwrapData(response) {
  const body = response?.data ?? response;
  if (body && typeof body === "object" && "data" in body && body.data != null) {
    return body.data;
  }
  return body;
}
