"use client";

import { FieldLabel, FieldHint } from "./FieldChrome";
import styles from "../../styles/propertyPanel.module.css";

/**
 * Simple key → workflow variable builder for webhook / API payload fields.
 * Emits `{ key: string, variable: string }[]`.
 */
export default function KeyValueField({
  id,
  label,
  pairs = [],
  required = false,
  hint = "Define incoming payload fields and workflow variables.",
  keyPlaceholder = "payload.field",
  valuePlaceholder = "variable_name",
  onChange,
}) {
  const rows = Array.isArray(pairs) && pairs.length
    ? pairs
    : [{ key: "", variable: "" }];

  const update = (index, patch) => {
    const next = rows.map((row, i) => (i === index ? { ...row, ...patch } : row));
    onChange?.(next);
  };

  const addRow = () => onChange?.([...rows, { key: "", variable: "" }]);

  const removeRow = (index) => {
    const next = rows.filter((_, i) => i !== index);
    onChange?.(next.length ? next : [{ key: "", variable: "" }]);
  };

  return (
    <div className={styles.field} id={id}>
      <FieldLabel required={required}>{label}</FieldLabel>
      <div className={styles.kvList}>
        {rows.map((row, index) => (
          <div key={`kv-${index}`} className={styles.kvRow}>
            <input
              type="text"
              className={styles.control}
              value={row.key ?? ""}
              placeholder={keyPlaceholder}
              aria-label={`Payload field ${index + 1}`}
              onChange={(e) => update(index, { key: e.target.value })}
            />
            <input
              type="text"
              className={styles.control}
              value={row.variable ?? ""}
              placeholder={valuePlaceholder}
              aria-label={`Variable ${index + 1}`}
              onChange={(e) => update(index, { variable: e.target.value })}
            />
            <button
              type="button"
              className={styles.kvRemove}
              aria-label={`Remove row ${index + 1}`}
              onClick={() => removeRow(index)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button type="button" className={styles.kvAdd} onClick={addRow}>
        + Add field
      </button>
      {hint ? <FieldHint>{hint}</FieldHint> : null}
    </div>
  );
}
