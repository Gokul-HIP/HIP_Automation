"use client";

import { renderTemplate } from "../../config/triggers";
import { FieldLabel } from "../fields/FieldChrome";
import { ensureValidPlaceholder } from "@/utils/workflowVariableTokens";
import styles from "../../styles/propertyPanel.module.css";

export default function MessageTemplateEditor({
  id,
  label = "Template",
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
          placeholder="Select or paste template ID / body with {{variables}}…"
          spellCheck
        />

        {variableGroups.length > 0 ? (
          <div className={styles.variablePanel} aria-label="Template variables">
            {variableGroups.map((group) => (
              <div key={group.label} className={styles.variableGroup}>
                <span className={styles.variableGroupLabel}>{group.label}</span>
                <div className={styles.variableChips}>
                  {group.variables.map((variable) => {
                    const rawToken =
                      typeof variable === "string"
                        ? variable
                        : String(variable?.token || variable?.key || "");
                    const token = ensureValidPlaceholder(rawToken);
                    const chipLabel =
                      typeof variable === "string"
                        ? variable
                        : String(variable?.label || token);
                    return (
                      <button
                        key={token || chipLabel}
                        type="button"
                        className={styles.token}
                        title={`Insert ${token}`}
                        onClick={() =>
                          token && onChange?.(`${value || ""}${token}`)
                        }
                      >
                        {chipLabel}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <p className={styles.hint}>
        Templates are managed in Template Manager. Variables resolve at runtime.
      </p>

      <div className={styles.previewMessage}>
        <p className={styles.previewMessageLabel}>Preview</p>
        <p className={styles.previewMessageBody}>
          {preview || "Template preview will appear here…"}
        </p>
      </div>
    </div>
  );
}
