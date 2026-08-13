"use client";

import { ensureValidPlaceholder } from "@/utils/workflowVariableTokens";
import styles from "../../styles/propertyPanel.module.css";

/**
 * @param {{ label?: string, token?: string } | string} variable
 */
function getVariableParts(variable) {
  if (typeof variable === "string") {
    const token = ensureValidPlaceholder(variable);
    return { label: variable, token };
  }
  const token = ensureValidPlaceholder(variable?.token || variable?.key || "");
  const label = String(variable?.label || token);
  return { label, token };
}

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
              {group.variables.map((variable) => {
                const { label, token } = getVariableParts(variable);
                return (
                  <button
                    key={token || label}
                    type="button"
                    className={styles.token}
                    title={`Insert ${token}`}
                    onClick={() => token && onInsert?.(token)}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
