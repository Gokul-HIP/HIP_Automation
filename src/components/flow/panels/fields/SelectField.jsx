"use client";

import { FieldLabel } from "./FieldChrome";
import styles from "../../styles/propertyPanel.module.css";

export default function SelectField({
  id,
  label,
  value,
  options = [],
  required = false,
  disabled = false,
  onChange,
}) {
  return (
    <div className={styles.field}>
      <FieldLabel htmlFor={id} required={required}>
        {label}
      </FieldLabel>
      <select
        id={id}
        className={styles.select}
        value={value ?? ""}
        disabled={disabled}
        onChange={(e) => {
          const raw = e.target.value;
          const matched = options.find((o) => String(o.value) === raw);
          onChange?.(matched ? matched.value : raw);
        }}
      >
        {options.map((opt) => (
          <option key={String(opt.value)} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
