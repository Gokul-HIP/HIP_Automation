"use client";

import styles from "../../styles/propertyPanel.module.css";

export default function ToggleField({
  id,
  label,
  description,
  checked = false,
  onChange,
}) {
  return (
    <div className={styles.toggleRow}>
      <div className={styles.toggleCopy}>
        <label htmlFor={id} className={styles.toggleTitle}>
          {label}
        </label>
        {description ? (
          <span className={styles.toggleDesc}>{description}</span>
        ) : null}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        className={styles.toggle}
        data-on={checked ? "true" : "false"}
        onClick={() => onChange?.(!checked)}
      >
        <span className={styles.toggleThumb} />
      </button>
    </div>
  );
}
