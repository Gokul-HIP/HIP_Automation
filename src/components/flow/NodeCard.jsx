"use client";

import { motion } from "framer-motion";
import { getCategoryById } from "./config/workflowCategories";
import styles from "./styles/nodeCard.module.css";

export default function NodeCard({ item, onAdd }) {
  const Icon = item.icon;
  const category = getCategoryById(item.category);

  return (
    <motion.button
      type="button"
      className={styles.card}
      data-tone={item.tone || "primary"}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      onClick={() => onAdd?.(item.type)}
    >
      <span className={styles.iconWrap} aria-hidden="true">
        <Icon />
      </span>
      <span className={styles.meta}>
        <span className={styles.title}>{item.title}</span>
        <span className={styles.description}>{item.description}</span>
        <span className={styles.category}>
          {category?.label || item.category}
        </span>
      </span>
    </motion.button>
  );
}
