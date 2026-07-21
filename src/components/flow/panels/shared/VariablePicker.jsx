"use client";

import styles from "../../styles/propertyPanel.module.css";

export default function VariablePicker({ groups = [], onInsert }) {
  if (!groups.length) return null;

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Variable Picker</h3>
      <p className={styles.sectionHint}>
        Insert runtime variables from patient, clinical, and flow context.
      </p>
      <div className={styles.variablePanel}>
        {groups.map((group) => (
          <div key={group.label} className={styles.variableGroup}>
            <span className={styles.variableGroupLabel}>{group.label}</span>
            <div className={styles.variableChips}>
              {group.variables.map((token) => (
                <button
                  key={token}
                  type="button"
                  className={styles.token}
                  onClick={() => onInsert?.(token)}
                >
                  {token}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
