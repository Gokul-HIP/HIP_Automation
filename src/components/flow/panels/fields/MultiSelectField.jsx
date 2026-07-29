"use client";

import { FieldLabel, FieldHint } from "./FieldChrome";
import styles from "../../styles/propertyPanel.module.css";

/**
 * @param {unknown} value
 * @returns {string[]}
 */
function toValueList(value) {
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    return trimmed
      .split(/[,\s]+/)
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
}

/**
 * Chip-based multi-select. Always emits string[] (never CSV text).
 */
export default function MultiSelectField({
  id,
  label,
  values = [],
  options = [],
  required = false,
  hint = "Select one or more options.",
  onChange,
}) {
  const selected = new Set(toValueList(values));

  const toggle = (value) => {
    const next = new Set(selected);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    // Preserve option order for stable JSON
    const ordered = options
      .map((opt) => String(opt.value))
      .filter((v) => next.has(v));
    const extras = [...next].filter((v) => !ordered.includes(v));
    onChange?.([...ordered, ...extras]);
  };

  return (
    <div className={styles.field}>
      <FieldLabel htmlFor={id} required={required}>
        {label}
      </FieldLabel>
      <div id={id} role="group" aria-label={label} className={styles.chipGroup}>
        {options.map((opt) => {
          const value = String(opt.value);
          const active = selected.has(value);
          return (
            <button
              key={value}
              type="button"
              aria-pressed={active}
              data-active={active ? "true" : "false"}
              className={styles.chip}
              onClick={() => toggle(value)}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {hint ? <FieldHint>{hint}</FieldHint> : null}
    </div>
  );
}
