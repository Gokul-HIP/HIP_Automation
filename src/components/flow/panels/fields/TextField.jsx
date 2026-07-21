"use client";

import { FieldLabel } from "./FieldChrome";
import styles from "../../styles/propertyPanel.module.css";

export default function TextField({
  id,
  label,
  value,
  required = false,
  placeholder = "",
  onChange,
}) {
  return (
    <div className={styles.field}>
      <FieldLabel htmlFor={id} required={required}>
        {label}
      </FieldLabel>
      <input
        id={id}
        type="text"
        className={styles.control}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  );
}
