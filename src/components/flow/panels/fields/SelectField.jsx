"use client";

import { FieldLabel } from "./FieldChrome";
import styles from "../../styles/propertyPanel.module.css";

/**
 * @param {unknown[]} options
 * @returns {{ value: string, label: string }[]}
 */
function normalizeOptions(options = []) {
  const seen = new Set();
  const next = [];
  for (const opt of options) {
    if (opt == null) continue;
    if (typeof opt === "string" || typeof opt === "number") {
      const value = String(opt);
      if (seen.has(value)) continue;
      seen.add(value);
      next.push({ value, label: value });
      continue;
    }
    if (typeof opt !== "object") continue;
    const raw = opt.value ?? opt.id ?? opt.key ?? opt.slug ?? opt.name;
    if (raw == null || raw === "") continue;
    const value = String(raw);
    if (seen.has(value)) continue;
    seen.add(value);
    next.push({
      value,
      label: String(opt.label ?? opt.title ?? opt.name ?? opt.text ?? value),
    });
  }
  return next;
}

export default function SelectField({
  id,
  label,
  value,
  options = [],
  required = false,
  disabled = false,
  onChange,
}) {
  const safeOptions = normalizeOptions(options);

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
          const matched = safeOptions.find((o) => o.value === raw);
          onChange?.(matched ? matched.value : raw);
        }}
      >
        {safeOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
