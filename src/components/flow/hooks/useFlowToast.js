"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const AUTO_DISMISS_MS = 4200;

/**
 * Lightweight toast state for workflow API feedback.
 * @returns {{ toast: { type: string, message: string } | null, showToast: (type: string, message: string) => void, clearToast: () => void }}
 */
export default function useFlowToast() {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const clearToast = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setToast(null);
  }, []);

  const showToast = useCallback(
    (type, message) => {
      clearToast();
      setToast({ type, message });
      timerRef.current = setTimeout(() => {
        setToast(null);
        timerRef.current = null;
      }, AUTO_DISMISS_MS);
    },
    [clearToast]
  );

  useEffect(() => clearToast, [clearToast]);

  return { toast, showToast, clearToast };
}
