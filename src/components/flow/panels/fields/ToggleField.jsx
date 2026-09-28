"use client";

import styles from "../../styles/propertyPanel.module.css";

export default function ToggleField({
  id,
  label,
  description,
  checked = false,
  disabled = false,
  onChange,
}) {
  return (
    <div className={styles.toggleRow} data-disabled={disabled ? "true" : "false"}>
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
        aria-disabled={disabled ? "true" : undefined}
        disabled={disabled}
        className={styles.toggle}
        data-on={checked ? "true" : "false"}
        onClick={() => {
          if (disabled) return;
          onChange?.(!checked);
        }}
      >
        <span className={styles.toggleThumb} />
      </button>
    </div>
  );
}
