"use client";

import { FieldLabel } from "./FieldChrome";
import styles from "../../styles/propertyPanel.module.css";

export default function NumberField({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  required = false,
  onChange,
}) {
  return (
    <div className={styles.field}>
      <FieldLabel htmlFor={id} required={required}>
        {label}
      </FieldLabel>
      <input
        id={id}
        type="number"
        className={styles.numberInput}
        value={value ?? ""}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const next = e.target.value === "" ? "" : Number(e.target.value);
          onChange?.(next);
        }}
      />
    </div>
  );
}
