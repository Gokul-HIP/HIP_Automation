"use client";

import TextField from "@/components/flow/panels/fields/TextField";
import SelectField from "@/components/flow/panels/fields/SelectField";
import ToggleField from "@/components/flow/panels/fields/ToggleField";
import NumberField from "@/components/flow/panels/fields/NumberField";
import MultiSelectField from "@/components/flow/panels/fields/MultiSelectField";
import {
  TRIGGER_CHANNEL_OPTIONS,
  normalizeChannelList,
} from "@/components/flow/config/triggers/shared";
import styles from "@/components/flow/styles/propertyPanel.module.css";

function fieldVisible(field, data) {
  if (!field.showWhen) return true;
  return Object.entries(field.showWhen).every(
    ([key, val]) => data?.[key] === val
  );
}

function isMultiSelectField(field) {
  const type = String(field?.type || "").toLowerCase();
  return (
    field?.key === "channels" ||
    type === "channels" ||
    type === "multiselect" ||
    type === "multi_select" ||
    type === "multi-select"
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

        if (isMultiSelectField(field)) {
          const options =
            Array.isArray(field.options) && field.options.length
              ? field.options
              : field.key === "channels"
                ? TRIGGER_CHANNEL_OPTIONS
                : [];
          return (
            <MultiSelectField
              key={field.key}
              id={id}
              label={field.label || "Delivery Channels"}
              values={normalizeChannelList(value)}
              options={options}
              required={field.required}
              hint={field.hint || "Select one or more delivery channels."}
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
