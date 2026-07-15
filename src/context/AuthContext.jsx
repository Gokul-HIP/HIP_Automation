"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  clearAuthSession,
  getStoredToken,
  getStoredUser,
  getUserDisplayName,
  loginRequest,
  logoutRequest,
  saveAuthSession,
} from "@/services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const storedToken = getStoredToken();
    const storedUser = getStoredUser();
    // Refresh cookies so SSR (WelcomeCard) can read the user
    if (storedToken && storedUser) {
      saveAuthSession({ token: storedToken, user: storedUser });
    }
    setToken(storedToken);
    setUser(storedUser);
    setReady(true);
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const data = await loginRequest({ email, password });
    saveAuthSession({ token: data.token, user: data.user });
    setToken(data.token);
    setUser(data.user);
    router.replace("/dashboard");
    router.refresh();
    return data;
  }, [router]);

  const logout = useCallback(async () => {
    const current = token || getStoredToken();
    try {
      await logoutRequest(current);
    } finally {
      clearAuthSession();
      setToken(null);
      setUser(null);
      router.replace("/login");
      router.refresh();
    }
  }, [token, router]);

  const value = useMemo(
    () => ({
      token,
      user,
      ready,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [token, user, ready, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

export { getUserDisplayName };
