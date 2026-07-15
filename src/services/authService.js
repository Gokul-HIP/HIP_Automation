const BASE_URL = "https://api.healthinpocket.in/api";

export const AUTH_TOKEN_KEY = "crm-auth-token";
export const AUTH_USER_KEY = "crm-auth-user";
export const AUTH_COOKIE = "crm-token";
export const AUTH_USER_COOKIE = "crm-user";

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
}

export function saveAuthSession({ token, user }) {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  setAuthCookie(token);
  setAuthUserCookie(user);
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
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

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || "Login failed");
  }

  if (!data?.token) {
    throw new Error(data?.message || "Login failed: no token received");
  }

  return data;
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
