"use client";

import TextField from "@/components/flow/panels/fields/TextField";
import SelectField from "@/components/flow/panels/fields/SelectField";
import ToggleField from "@/components/flow/panels/fields/ToggleField";
import NumberField from "@/components/flow/panels/fields/NumberField";
import styles from "@/components/flow/styles/propertyPanel.module.css";

function fieldVisible(field, data) {
  if (!field.showWhen) return true;
  return Object.entries(field.showWhen).every(
    ([key, val]) => data?.[key] === val
  );
}

export default function ApiSchemaForm({ fields = [], data, onChange }) {
  const patch = (partial) => onChange?.({ ...partial });

  return (
    <div className={styles.scroll}>
      {fields.map((field) => {
        if (!field.key || !fieldVisible(field, data)) return null;
        const value = data?.[field.key];
        const id = `api-field-${field.key}`;

        if (field.type === "boolean") {
          return (
            <ToggleField
              key={field.key}
              id={id}
              label={field.label}
              description={field.hint}
              checked={Boolean(value)}
              onChange={(next) => patch({ [field.key]: next })}
            />
          );
        }

        if (field.type === "number") {
          return (
            <NumberField
              key={field.key}
              id={id}
              label={field.label}
              value={value ?? ""}
              min={field.min}
              max={field.max}
              required={field.required}
              onChange={(next) => patch({ [field.key]: next })}
            />
          );
        }

        if (field.type === "select") {
          return (
            <div key={field.key} className={styles.field}>
              <SelectField
                id={id}
                label={field.label}
                value={value ?? ""}
                options={field.options || []}
                required={field.required}
                onChange={(next) => patch({ [field.key]: next })}
              />
              {field.hint ? <p className={styles.hint}>{field.hint}</p> : null}
            </div>
          );
        }

        if (field.type === "textarea") {
          return (
            <div key={field.key} className={styles.field}>
              <label htmlFor={id} className={styles.label}>
                {field.label}
                {field.required ? " *" : ""}
              </label>
              <textarea
                id={id}
                className={styles.textarea}
                value={value ?? ""}
                placeholder={field.placeholder || ""}
                onChange={(e) => patch({ [field.key]: e.target.value })}
              />
              {field.hint ? <p className={styles.hint}>{field.hint}</p> : null}
            </div>
          );
        }

        return (
          <div key={field.key} className={styles.field}>
            <TextField
              id={id}
              label={field.label}
              value={value ?? ""}
              required={field.required}
              placeholder={field.placeholder || ""}
              onChange={(next) => patch({ [field.key]: next })}
            />
            {field.hint ? <p className={styles.hint}>{field.hint}</p> : null}
          </div>
        );
      })}
    </div>
  );
}
