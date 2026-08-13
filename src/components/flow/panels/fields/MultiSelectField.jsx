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
  const safeOptions = normalizeOptions(options);
  const selected = new Set(toValueList(values));

  const toggle = (value) => {
    const next = new Set(selected);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    const ordered = safeOptions
      .map((opt) => opt.value)
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
        {safeOptions.map((opt) => {
          const active = selected.has(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={active}
              data-active={active ? "true" : "false"}
              className={styles.chip}
              onClick={() => toggle(opt.value)}
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
