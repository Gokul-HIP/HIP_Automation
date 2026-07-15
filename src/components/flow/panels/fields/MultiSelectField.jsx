"use client";

import { FieldLabel, FieldHint } from "./FieldChrome";
import styles from "../../styles/medicineReminder.module.css";

export default function MultiSelectField({
  id,
  label,
  values = [],
  options = [],
  required = false,
  onChange,
}) {
  const selected = new Set(values);

  const toggle = (value) => {
    const next = new Set(selected);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    onChange?.(Array.from(next));
  };

  return (
    <div className={styles.field}>
      <FieldLabel htmlFor={id} required={required}>
        {label}
      </FieldLabel>
      <div id={id} role="group" aria-label={label} className={styles.chipGroup}>
        {options.map((opt) => {
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
      <FieldHint>Select one or more delivery channels.</FieldHint>
    </div>
  );
}
