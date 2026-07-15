"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useTheme } from "@wrksz/themes/client";
import { LayoutGroup } from "framer-motion";

const ThemeMotionContext = createContext(null);

const DURATION_MS = 560;

function getMaxRadius(x, y) {
  if (typeof window === "undefined") return 2000;
  const { innerWidth: w, innerHeight: h } = window;
  return (
    Math.ceil(
      Math.max(
        Math.hypot(x, y),
        Math.hypot(w - x, y),
        Math.hypot(x, h - y),
        Math.hypot(w - x, h - y)
      )
    ) + 24
  );
}

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function supportsViewTransition() {
  return typeof document !== "undefined" && "startViewTransition" in document;
}

function ThemeMotionInner({ children }) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [reveal, setReveal] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeTheme = !mounted
    ? "dark"
    : resolvedTheme || theme || "dark";

  const applyTheme = useCallback(
    (nextTheme) => {
      setTheme(nextTheme);
      document.documentElement.setAttribute("data-theme", nextTheme);
    },
    [setTheme]
  );

  const clearRevealClasses = useCallback(() => {
    const root = document.documentElement;
    root.classList.remove(
      "theme-transitioning",
      "theme-reveal-active",
      "theme-vt-instant"
    );
    setReveal(null);
    setIsAnimating(false);
  }, []);

  const startThemeChange = useCallback(
    (nextTheme, origin) => {
      if (!nextTheme || nextTheme === activeTheme || isAnimating) return;

      const root = document.documentElement;
      const reduced = prefersReducedMotion();

      if (reduced) {
        applyTheme(nextTheme);
        return;
      }

      const x = origin?.x ?? window.innerWidth - 72;
      const y = origin?.y ?? 36;
      const radius = getMaxRadius(x, y);

      root.style.setProperty("--theme-reveal-x", `${x}px`);
      root.style.setProperty("--theme-reveal-y", `${y}px`);
      root.style.setProperty("--theme-reveal-r", `${radius}px`);

      setIsAnimating(true);
      setReveal({ id: Date.now(), nextTheme, x, y, radius });
      root.classList.add("theme-transitioning", "theme-reveal-active");

      const finish = () => {
        window.setTimeout(clearRevealClasses, 40);
      };

      if (supportsViewTransition()) {
        root.classList.add("theme-vt-instant");
        void root.offsetWidth;

        const transition = document.startViewTransition(() => {
          applyTheme(nextTheme);
        });

        transition.finished.then(finish).catch(finish);
        return;
      }

      void root.offsetWidth;
      applyTheme(nextTheme);
      window.setTimeout(finish, DURATION_MS);
    },
    [activeTheme, isAnimating, applyTheme, clearRevealClasses]
  );

  const toggleTheme = useCallback(
    (origin) => {
      startThemeChange(activeTheme === "dark" ? "light" : "dark", origin);
    },
    [activeTheme, startThemeChange]
  );

  const value = useMemo(
    () => ({
      theme: activeTheme,
      mounted,
      isAnimating,
      reveal,
      durationMs: DURATION_MS,
      toggleTheme,
      setThemeWithMotion: startThemeChange,
    }),
    [activeTheme, mounted, isAnimating, reveal, toggleTheme, startThemeChange]
  );

  return (
    <ThemeMotionContext.Provider value={value}>
      <LayoutGroup id="crm-theme">{children}</LayoutGroup>
    </ThemeMotionContext.Provider>
  );
}

export function ThemeMotionProvider({ children }) {
  return <ThemeMotionInner>{children}</ThemeMotionInner>;
}

export function ThemeProvider({ children }) {
  return <ThemeMotionProvider>{children}</ThemeMotionProvider>;
}

export function useThemeMotion() {
  const ctx = useContext(ThemeMotionContext);
  if (!ctx) {
    throw new Error("useThemeMotion must be used within ThemeMotionProvider");
  }
  return ctx;
}
