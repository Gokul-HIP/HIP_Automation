"use client";

import styles from "../../styles/medicineReminder.module.css";

export function FieldLabel({ htmlFor, children, required = false }) {
  return (
    <label htmlFor={htmlFor} className={styles.label}>
      {children}
      {required ? " *" : ""}
    </label>
  );
}

export function FieldHint({ children }) {
  return <p className={styles.hint}>{children}</p>;
}
