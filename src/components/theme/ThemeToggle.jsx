"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HiOutlineMoon, HiOutlineSun } from "react-icons/hi";
import { useThemeMotion } from "@/components/theme/ThemeProvider";
import styles from "./ThemeToggle.module.css";

const iconSpring = {
  type: "spring",
  stiffness: 380,
  damping: 22,
  mass: 0.7,
};

export default function ThemeToggle({ className = "" }) {
  const buttonRef = useRef(null);
  const { theme, mounted, isAnimating, toggleTheme } = useThemeMotion();
  const [rippleKey, setRippleKey] = useState(0);
  const [glow, setGlow] = useState(false);
  const isDark = theme === "dark";

  const handleClick = () => {
    if (isAnimating || !mounted) return;

    const rect = buttonRef.current?.getBoundingClientRect();
    const origin = rect
      ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
      : undefined;

    setRippleKey((k) => k + 1);
    setGlow(true);
    window.setTimeout(() => setGlow(false), 560);
    toggleTheme(origin);
  };

  return (
    <motion.button
      ref={buttonRef}
      type="button"
      className={`${styles.toggle} ${className}`.trim()}
      onClick={handleClick}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      disabled={!mounted}
      data-theme-toggle="true"
      data-glow={glow ? "true" : "false"}
      whileTap={{ scale: 0.92 }}
      transition={iconSpring}
    >
      <span
        className={styles.glow}
        aria-hidden="true"
        data-active={glow ? "true" : "false"}
      />

      <AnimatePresence>
        {rippleKey > 0 && (
          <motion.span
            key={rippleKey}
            className={styles.ripple}
            aria-hidden="true"
            initial={{ scale: 0.2, opacity: 0.55 }}
            animate={{ scale: 2.6, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            onAnimationComplete={() => setRippleKey(0)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "sun" : "moon"}
          className={styles.icon}
          data-mode={isDark ? "dark" : "light"}
          initial={{ rotate: -180, scale: 0.85 }}
          animate={{ rotate: 0, scale: 1 }}
          exit={{ rotate: 180, scale: 0.85 }}
          transition={iconSpring}
        >
          {isDark ? <HiOutlineSun /> : <HiOutlineMoon />}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
