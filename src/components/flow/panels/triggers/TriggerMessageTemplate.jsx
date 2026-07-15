"use client";

import { FieldLabel } from "../fields/FieldChrome";
import { renderTemplate } from "../../config/triggers";
import styles from "../../styles/medicineReminder.module.css";

export default function TriggerMessageTemplate({
  id,
  label = "Message Template",
  value,
  required = false,
  variableGroups = [],
  sampleContext = {},
  onChange,
}) {
  const preview = renderTemplate(value || "", sampleContext);

  return (
    <div className={styles.field}>
      <FieldLabel htmlFor={id} required={required}>
        {label}
      </FieldLabel>

      <div className={styles.templateLayout}>
        <textarea
          id={id}
          className={styles.textarea}
          value={value ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder="Write the message using {{variables}}…"
          spellCheck
        />

        {variableGroups.length > 0 ? (
          <div className={styles.variablePanel} aria-label="Template variables">
            {variableGroups.map((group) => (
              <div key={group.label} className={styles.variableGroup}>
                <span className={styles.variableGroupLabel}>{group.label}</span>
                <div className={styles.variableChips}>
                  {group.variables.map((token) => (
                    <button
                      key={token}
                      type="button"
                      className={styles.token}
                      title={`Insert ${token}`}
                      onClick={() => onChange?.(`${value || ""}${token}`)}
                    >
                      {token}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <p className={styles.hint}>
        Variables resolve from Laravel context at runtime — never hardcode
        clinical or appointment data.
      </p>

      <div className={styles.previewMessage}>
        <p className={styles.previewMessageLabel}>Preview</p>
        <p className={styles.previewMessageBody}>
          {preview || "Your preview will appear here…"}
        </p>
      </div>
    </div>
  );
}
