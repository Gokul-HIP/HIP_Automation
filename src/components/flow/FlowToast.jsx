"use client";

import { AnimatePresence, motion } from "framer-motion";
import styles from "./styles/flow.module.css";

export default function FlowToast({ toast, onDismiss }) {
  return (
    <AnimatePresence>
      {toast ? (
        <motion.div
          className={styles.flowToast}
          data-tone={toast.type}
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          <span>{toast.message}</span>
          <button
            type="button"
            className={styles.flowToastDismiss}
            onClick={onDismiss}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
