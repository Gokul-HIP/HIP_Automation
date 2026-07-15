"use client";

import TextField from "../fields/TextField";
import SelectField from "../fields/SelectField";
import MultiSelectField from "../fields/MultiSelectField";
import ToggleField from "../fields/ToggleField";
import NumberField from "../fields/NumberField";
import TriggerMessageTemplate from "./TriggerMessageTemplate";
import TriggerRetryPolicy from "./TriggerRetryPolicy";
import styles from "../../styles/medicineReminder.module.css";

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

  if (field.type === "retry") {
    return <TriggerRetryPolicy data={data} onChange={onChange} />;
  }

  if (field.type === "channels") {
    return (
      <MultiSelectField
        id={id}
        label={field.label}
        values={Array.isArray(value) ? value : []}
        options={field.options || []}
        required={field.required}
        onChange={(channels) => onChange?.({ channels })}
      />
    );
  }

  if (field.type === "template") {
    return (
      <TriggerMessageTemplate
        id={id}
        label={field.label}
        value={value ?? ""}
        required={field.required}
        variableGroups={schema.variableGroups || []}
        sampleContext={schema.sampleContext || {}}
        onChange={(messageTemplate) => onChange?.({ messageTemplate })}
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
        {field.dynamic ? (
          <p className={styles.hint}>Options can be loaded from Laravel later.</p>
        ) : null}
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
      {field.dynamic ? (
        <p className={styles.hint}>Value can be overridden by Laravel later.</p>
      ) : null}
    </div>
  );
}
