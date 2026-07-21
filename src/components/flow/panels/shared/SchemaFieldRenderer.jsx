"use client";

import VariablePicker from "./VariablePicker";
import MessageTemplateEditor from "./MessageTemplateEditor";
import RetryPolicy from "./RetryPolicy";
import TextField from "../fields/TextField";
import SelectField from "../fields/SelectField";
import ToggleField from "../fields/ToggleField";
import NumberField from "../fields/NumberField";
import styles from "../../styles/propertyPanel.module.css";

function fieldVisible(field, data) {
  if (!field.showWhen) return true;
  return Object.entries(field.showWhen).every(
    ([key, val]) => data?.[key] === val
  );
}

/**
 * Shared schema field renderer for messaging, wait, and stub panels.
 */
export default function SchemaFieldRenderer({
  field,
  data,
  schema,
  onChange,
}) {
  const value = data?.[field.key];
  const id = `schema-${field.key || field.type}`;

  if (!fieldVisible(field, data)) return null;

  if (field.type === "retry") {
    return <RetryPolicy data={data} onChange={onChange} />;
  }

  if (field.type === "variables") {
    return (
      <VariablePicker
        groups={schema?.variableGroups || []}
        onInsert={(token) => {
          const current = data?.variables?.[field.key] ?? "";
          onChange?.({ variables: { ...(data?.variables || {}), note: `${current}${token}` } });
        }}
      />
    );
  }

  if (field.type === "templateSelect") {
    return (
      <MessageTemplateEditor
        id={id}
        label={field.label}
        value={value ?? ""}
        required={field.required}
        variableGroups={schema?.variableGroups || []}
        sampleContext={schema?.sampleContext || {}}
        onChange={(templateId) => onChange?.({ [field.key]: templateId })}
      />
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
      <NumberField
        id={id}
        label={field.label}
        value={value ?? ""}
        min={field.min}
        max={field.max}
        required={field.required}
        onChange={(next) => onChange?.({ [field.key]: next })}
      />
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
          onChange={(e) => onChange?.({ [field.key]: e.target.value })}
        />
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
        onChange={(next) => onChange?.({ [field.key]: next })}
      />
      {field.hint ? <p className={styles.hint}>{field.hint}</p> : null}
    </div>
  );
}
