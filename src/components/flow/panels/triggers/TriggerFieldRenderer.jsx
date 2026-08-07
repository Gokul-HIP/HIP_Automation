"use client";

import TextField from "../fields/TextField";
import SelectField from "../fields/SelectField";
import ToggleField from "../fields/ToggleField";
import NumberField from "../fields/NumberField";
import MultiSelectField from "../fields/MultiSelectField";
import TagsField from "../fields/TagsField";
import KeyValueField from "../fields/KeyValueField";
import TriggerMessageTemplate from "./TriggerMessageTemplate";
import TriggerRetryPolicy from "./TriggerRetryPolicy";
import styles from "../../styles/propertyPanel.module.css";

function matchesShowWhenValue(actual, expected) {
  if (Array.isArray(expected)) return expected.includes(actual);
  return actual === expected;
}

function fieldVisible(field, data) {
  if (!field.showWhen) return true;
  return Object.entries(field.showWhen).every(([key, val]) =>
    matchesShowWhenValue(data?.[key], val)
  );
}

function randomCredential(prefix = "hip") {
  const bytes =
    typeof crypto !== "undefined" && crypto.getRandomValues
      ? Array.from(crypto.getRandomValues(new Uint8Array(16)))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("")
      : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 14)}`;
  return `${prefix}_${bytes}`;
}

/**
 * Renders a single schema field. Option lists remain declarative so
 * Laravel APIs can replace `field.options` later without UI changes.
 */
export default function TriggerFieldRenderer({
  field,
  data,
  schema,
  onChange,
}) {
  const value = data?.[field.key];
  const id = `trigger-${field.key}`;

  if (!fieldVisible(field, data)) return null;

  if (
    field.type === "channels" ||
    field.type === "multiselect" ||
    field.type === "multi_select"
  ) {
    const listValues = Array.isArray(value)
      ? value
      : typeof value === "string"
        ? value.split(/[,\s]+/).map((v) => v.trim()).filter(Boolean)
        : [];
    return (
      <MultiSelectField
        id={id}
        label={field.label || "Options"}
        values={listValues}
        options={field.options || []}
        required={field.required}
        hint={
          field.hint ||
          (field.type === "channels"
            ? "Select one or more delivery channels."
            : "Select one or more options.")
        }
        onChange={(next) => onChange?.({ [field.key]: next })}
      />
    );
  }

  if (field.type === "tags") {
    return (
      <TagsField
        id={id}
        label={field.label || "Tags"}
        values={value}
        required={field.required}
        placeholder={field.placeholder || "appointment, doctor, help"}
        hint={field.hint || "Enter keywords such as appointment, doctor, help"}
        onChange={(tags) => onChange?.({ [field.key]: tags })}
      />
    );
  }

  if (field.type === "keyValue") {
    return (
      <KeyValueField
        id={id}
        label={field.label || "Payload Variables"}
        pairs={value}
        required={field.required}
        hint={field.hint}
        onChange={(pairs) => onChange?.({ [field.key]: pairs })}
      />
    );
  }

  if (field.type === "retry") {
    return <TriggerRetryPolicy data={data} onChange={onChange} />;
  }

  if (field.type === "template") {
    return (
      <TriggerMessageTemplate
        id={id}
        label={field.label || "Message Template"}
        value={value ?? ""}
        required={field.required}
        variableGroups={schema?.variableGroups || []}
        sampleContext={schema?.sampleContext || {}}
        onChange={(messageTemplate) =>
          onChange?.({ [field.key || "messageTemplate"]: messageTemplate })
        }
      />
    );
  }

  if (field.type === "variablesPreview") {
    const tokens = Array.isArray(field.tokens) ? field.tokens : [];
    return (
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>{field.label || "Variables"}</h3>
        {field.hint ? <p className={styles.sectionHint}>{field.hint}</p> : null}
        <div className={styles.variableChips}>
          {tokens.map((token) => (
            <span key={token} className={styles.tokenReadonly} title={token}>
              {token}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (field.type === "boolean") {
    return (
      <ToggleField
        id={id}
        label={field.label}
        description={field.description}
        checked={Boolean(value)}
        onChange={(next) => onChange?.({ [field.key]: next })}
      />
    );
  }

  if (field.type === "number") {
    return (
      <div className={styles.field}>
        <NumberField
          id={id}
          label={field.label}
          value={value ?? ""}
          min={field.min}
          max={field.max}
          required={field.required}
          onChange={(next) => onChange?.({ [field.key]: next })}
        />
        {field.hint ? <p className={styles.hint}>{field.hint}</p> : null}
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div className={styles.field}>
        <SelectField
          id={id}
          label={field.label}
          value={value ?? ""}
          options={field.options || []}
          required={field.required}
          onChange={(next) => onChange?.({ [field.key]: next })}
        />
        {field.hint ? <p className={styles.hint}>{field.hint}</p> : null}
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div className={styles.field}>
        <label htmlFor={id} className={styles.label}>
          {field.label}
          {field.required ? " *" : ""}
        </label>
        <textarea
          id={id}
          className={styles.textarea}
          value={value ?? ""}
          placeholder={field.placeholder || ""}
          readOnly={Boolean(field.readOnly)}
          onChange={(e) => onChange?.({ [field.key]: e.target.value })}
        />
        {field.hint ? <p className={styles.hint}>{field.hint}</p> : null}
      </div>
    );
  }

  if (field.type === "date" || field.type === "time") {
    return (
      <div className={styles.field}>
        <label htmlFor={id} className={styles.label}>
          {field.label}
          {field.required ? " *" : ""}
        </label>
        <input
          id={id}
          type={field.type}
          className={styles.control}
          value={value ?? ""}
          required={field.required}
          onChange={(e) => onChange?.({ [field.key]: e.target.value })}
        />
        {field.hint ? <p className={styles.hint}>{field.hint}</p> : null}
      </div>
    );
  }

  if (field.generate) {
    return (
      <div className={styles.field}>
        <TextField
          id={id}
          label={field.label}
          value={value ?? ""}
          required={field.required}
          placeholder={field.placeholder || ""}
          readOnly={Boolean(field.readOnly)}
          onChange={(next) => onChange?.({ [field.key]: next })}
        />
        <button
          type="button"
          className={styles.kvAdd}
          onClick={() =>
            onChange?.({
              [field.key]: randomCredential(
                field.key === "apiKey" ? "api" : "whsec"
              ),
            })
          }
        >
          Generate
        </button>
        {field.hint ? <p className={styles.hint}>{field.hint}</p> : null}
      </div>
    );
  }

  return (
    <div className={styles.field}>
      <TextField
        id={id}
        label={field.label}
        value={value ?? ""}
        required={field.required}
        placeholder={field.placeholder || ""}
        readOnly={Boolean(field.readOnly)}
        onChange={(next) => onChange?.({ [field.key]: next })}
      />
      {field.hint ? <p className={styles.hint}>{field.hint}</p> : null}
    </div>
  );
}
