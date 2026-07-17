import {
  normalizeAuthUser,
  normalizeLoginResponse,
  resolveOrganizationId,
  resolveUserId,
} from "@/utils/organization";

const BASE_URL = "https://api.healthinpocket.in/api";

export const AUTH_TOKEN_KEY = "crm-auth-token";
export const AUTH_USER_KEY = "crm-auth-user";
export const AUTH_ORG_KEY = "crm-auth-organization-id";
export const AUTH_USER_ID_KEY = "crm-auth-user-id";
export const AUTH_COOKIE = "crm-token";
export const AUTH_USER_COOKIE = "crm-user";
export const AUTH_ORG_COOKIE = "crm-organization-id";
export const AUTH_USER_ID_COOKIE = "crm-user-id";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function writeCookie(name, value) {
  if (typeof document === "undefined") return;
  // Clear first so a stale value cannot linger
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

function clearCookie(name) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

function readCookie(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  if (!match) return null;
  try {
    return decodeURIComponent(match.slice(name.length + 1)) || null;
  } catch {
    return match.slice(name.length + 1) || null;
  }
}

export function encodeUserCookie(user) {
  const json = JSON.stringify(user ?? {});
  if (typeof Buffer !== "undefined") {
    return Buffer.from(json, "utf8").toString("base64");
  }
  return btoa(json);
}

export function decodeUserCookie(raw) {
  if (!raw) return null;

  let value = raw;
  try {
    value = decodeURIComponent(raw);
  } catch {
    value = raw;
  }

  // Current format: base64(JSON)
  try {
    const json =
      typeof Buffer !== "undefined"
        ? Buffer.from(value, "base64").toString("utf8")
        : atob(value);
    return JSON.parse(json);
  } catch {
    // Legacy plain JSON cookie
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function setAuthCookie(token) {
  writeCookie(AUTH_COOKIE, token);
}

export function setAuthUserCookie(user) {
  writeCookie(AUTH_USER_COOKIE, encodeUserCookie(user));
}

export function clearAuthCookie() {
  clearCookie(AUTH_COOKIE);
  clearCookie(AUTH_USER_COOKIE);
  clearCookie(AUTH_ORG_COOKIE);
  clearCookie(AUTH_USER_ID_COOKIE);
}

export function saveAuthSession({ token, user }) {
  if (typeof window === "undefined") return;

  const normalizedUser = normalizeAuthUser(user) ?? user;
  const organizationId = resolveOrganizationId(normalizedUser);
  const userId = resolveUserId(normalizedUser);

  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(normalizedUser));

  // Never delete an already-stored org/user id here — only logout clears them.
  // A session refresh with a stale user object must not wipe good values.
  if (organizationId != null) {
    localStorage.setItem(AUTH_ORG_KEY, String(organizationId));
    writeCookie(AUTH_ORG_COOKIE, String(organizationId));
  }

  if (userId) {
    localStorage.setItem(AUTH_USER_ID_KEY, String(userId));
    writeCookie(AUTH_USER_ID_COOKIE, String(userId));
  }

  setAuthCookie(token);
  setAuthUserCookie(normalizedUser);
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(AUTH_ORG_KEY);
  localStorage.removeItem(AUTH_USER_ID_KEY);
  clearAuthCookie();
}

export function getStoredToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getStoredUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Returns the complete authenticated user from storage.
 * Always prefer this when building API payloads.
 * @returns {{
 *   id: string | null,
 *   email: string | null,
 *   first_name: string | null,
 *   last_name: string | null,
 *   organization_id: number | null,
 * } | null}
 */
export function getCurrentUser() {
  if (typeof window === "undefined") return null;

  const stored = getStoredUser() ?? decodeUserCookie(readCookie(AUTH_USER_COOKIE));
  const user = normalizeAuthUser(stored) ?? {};

  // Fallback chain: user object → localStorage key → cookie
  const organizationId =
    resolveOrganizationId(user) ??
    resolveOrganizationId({ organization_id: localStorage.getItem(AUTH_ORG_KEY) }) ??
    resolveOrganizationId({ organization_id: readCookie(AUTH_ORG_COOKIE) });

  const userId =
    resolveUserId(user) ??
    localStorage.getItem(AUTH_USER_ID_KEY) ??
    readCookie(AUTH_USER_ID_COOKIE);

  if (!stored && organizationId == null && !userId) return null;

  return {
    ...user,
    id: userId ?? null,
    email: user.email ?? null,
    first_name: user.first_name ?? null,
    last_name: user.last_name ?? null,
    organization_id: organizationId,
  };
}

export function getStoredOrganizationId() {
  if (typeof window === "undefined") return null;
  return getCurrentUser()?.organization_id ?? null;
}

export function getStoredUserId() {
  if (typeof window === "undefined") return null;
  return getCurrentUser()?.id ?? null;
}

export function getUserDisplayName(user) {
  if (!user) return "User";
  const name = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
  return name || user.email || "User";
}

export async function loginRequest({ email, password }) {
  const response = await fetch(`${BASE_URL}/automation/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const raw = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(raw?.message || "Login failed");
  }

  const data = normalizeLoginResponse(raw);

  if (!data?.token) {
    throw new Error(raw?.message || "Login failed: no token received");
  }

  // Always keep the complete user object from the login API.
  const user = normalizeAuthUser(data.user ?? raw.user, {
    ...raw,
    ...data,
    organization_id:
      raw?.user?.organization_id ??
      data?.user?.organization_id ??
      data?.organization_id,
  });

  if (!user) {
    throw new Error("Login failed: no user received");
  }

  return {
    ...data,
    token: data.token,
    user,
    organization_id: user.organization_id,
  };
}

export async function logoutRequest(token) {
  if (!token) return;

  const response = await fetch(`${BASE_URL}/automation/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    console.warn(data?.message || "Logout request failed");
  }
}
