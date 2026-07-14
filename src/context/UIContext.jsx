"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const UIContext = createContext(null);

const STORAGE_KEYS = {
  sidebarCollapsed: "crm-sidebar-collapsed",
  locale: "crm-locale",
};

export function UIProvider({ children, logo = null }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [locale, setLocaleState] = useState("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const storedCollapsed = localStorage.getItem(STORAGE_KEYS.sidebarCollapsed);
    const storedLocale = localStorage.getItem(STORAGE_KEYS.locale);

    if (storedCollapsed != null) {
      setSidebarCollapsed(storedCollapsed === "true");
    }
    if (storedLocale) {
      setLocaleState(storedLocale);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(STORAGE_KEYS.sidebarCollapsed, String(sidebarCollapsed));
  }, [sidebarCollapsed, mounted]);

  useEffect(() => {
    if (!mounted) return;
    const dir = locale === "ar" ? "rtl" : "ltr";
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", locale);
    localStorage.setItem(STORAGE_KEYS.locale, locale);
  }, [locale, mounted]);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  const openMobileSidebar = useCallback(() => setMobileSidebarOpen(true), []);
  const closeMobileSidebar = useCallback(() => setMobileSidebarOpen(false), []);
  const toggleMobileSidebar = useCallback(
    () => setMobileSidebarOpen((prev) => !prev),
    []
  );

  const setLocale = useCallback((next) => setLocaleState(next), []);

  const value = useMemo(
    () => ({
      logo,
      sidebarCollapsed,
      toggleSidebar,
      setSidebarCollapsed,
      mobileSidebarOpen,
      openMobileSidebar,
      closeMobileSidebar,
      toggleMobileSidebar,
      locale,
      setLocale,
      mounted,
    }),
    [
      logo,
      sidebarCollapsed,
      toggleSidebar,
      setSidebarCollapsed,
      mobileSidebarOpen,
      openMobileSidebar,
      closeMobileSidebar,
      toggleMobileSidebar,
      locale,
      setLocale,
      mounted,
    ]
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) {
    throw new Error("useUI must be used within UIProvider");
  }
  return ctx;
}
