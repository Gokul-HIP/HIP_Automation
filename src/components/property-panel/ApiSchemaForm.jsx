"use client";

import TextField from "@/components/flow/panels/fields/TextField";
import SelectField from "@/components/flow/panels/fields/SelectField";
import ToggleField from "@/components/flow/panels/fields/ToggleField";
import NumberField from "@/components/flow/panels/fields/NumberField";
import MultiSelectField from "@/components/flow/panels/fields/MultiSelectField";
import TagsField from "@/components/flow/panels/fields/TagsField";
import {
  TRIGGER_CHANNEL_OPTIONS,
  BOOKING_SOURCE_OPTIONS,
  REGISTRATION_SOURCE_OPTIONS,
  MESSAGE_CHANNEL_OPTIONS,
  MESSAGE_TYPE_OPTIONS,
  CANCELLED_BY_OPTIONS,
  REWARD_UPDATE_OPTIONS,
  PAYMENT_MODE_OPTIONS,
  normalizeChannelList,
} from "@/components/flow/config/triggers/shared";
import styles from "@/components/flow/styles/propertyPanel.module.css";

function fieldVisible(field, data) {
  if (!field.showWhen) return true;
  return Object.entries(field.showWhen).every(([key, val]) => {
    const actual = data?.[key];
    if (Array.isArray(val)) return val.includes(actual);
    return actual === val;
  });
}

function isMultiSelectField(field) {
  const type = String(field?.type || "").toLowerCase();
  return (
    field?.key === "channels" ||
    field?.key === "source" ||
    field?.key === "registrationSource" ||
    field?.key === "channel" ||
    field?.key === "messageType" ||
    field?.key === "cancelledBy" ||
    field?.key === "paymentMode" ||
    type === "channels" ||
    type === "multiselect" ||
    type === "multi_select" ||
    type === "multi-select"
  );
}

function multiSelectFallbackOptions(field) {
  const fromField = normalizeOptions(field.options);
  if (fromField.length) return fromField;
  switch (field.key) {
    case "channels":
      return TRIGGER_CHANNEL_OPTIONS;
    case "source":
      return BOOKING_SOURCE_OPTIONS;
    case "registrationSource":
      return REGISTRATION_SOURCE_OPTIONS;
    case "channel":
      return MESSAGE_CHANNEL_OPTIONS;
    case "messageType":
      return MESSAGE_TYPE_OPTIONS;
    case "cancelledBy":
      return CANCELLED_BY_OPTIONS;
    case "updateType":
      return REWARD_UPDATE_OPTIONS;
    case "paymentMode":
      return PAYMENT_MODE_OPTIONS;
    default:
      return [];
  }
}

function normalizeOptions(options = []) {
  const seen = new Set();
  const next = [];
  for (const opt of options || []) {
    if (opt == null) continue;
    if (typeof opt === "string" || typeof opt === "number") {
      const value = String(opt);
      if (seen.has(value)) continue;
      seen.add(value);
      next.push({ value, label: value });
      continue;
    }
    if (typeof opt !== "object") continue;
    const raw = opt.value ?? opt.id ?? opt.key ?? opt.slug ?? opt.name;
    if (raw == null || raw === "") continue;
    const value = String(raw);
    if (seen.has(value)) continue;
    seen.add(value);
    next.push({
      value,
      label: String(opt.label ?? opt.title ?? opt.name ?? opt.text ?? value),
    });
  }
  return next;
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
          return (
            <MultiSelectField
              key={field.key}
              id={id}
              label={field.label || "Options"}
              values={normalizeChannelList(value)}
              options={multiSelectFallbackOptions(field)}
              required={field.required}
              hint={field.hint || "Select one or more options."}
              onChange={(next) => patch({ [field.key]: next })}
            />
          );
        }

        if (field.type === "tags" || field.key === "tags") {
          return (
            <TagsField
              key={field.key}
              id={id}
              label={field.label || "Tags"}
              values={value}
              required={field.required}
              placeholder={field.placeholder || "appointment, doctor, help"}
              hint={field.hint || "Enter keywords such as appointment, doctor, help"}
              onChange={(tags) => patch({ [field.key]: tags })}
            />
          );
        }

        if (field.type === "select") {
          const selectOptions = normalizeOptions(field.options);
          return (
            <div key={field.key} className={styles.field}>
              <SelectField
                id={id}
                label={field.label}
                value={value ?? ""}
                options={selectOptions}
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
