"use client";

import { getTriggerSchema } from "../../config/triggers";
import TriggerContextCard from "./TriggerContextCard";
import TriggerFieldRenderer from "./TriggerFieldRenderer";
import styles from "../../styles/medicineReminder.module.css";

/**
 * Generic, reusable Properties panel for all Trigger nodes.
 * Field definitions come from trigger schemas — backend APIs can
 * later inject dynamic option lists without redesigning the UI.
 */
export default function TriggerProperties({ data, onChange }) {
  const schema = getTriggerSchema(data?.nodeType);

  if (!schema) {
    return (
      <div className={styles.scroll}>
        <p className={styles.hint}>No trigger schema found for this node.</p>
      </div>
    );
  }

  const patch = (partial) => {
    const next = { ...partial };
    // Keep BaseNode badge in sync with execution status
    if (Object.prototype.hasOwnProperty.call(partial, "executionStatus")) {
      next.status = partial.executionStatus;
    }
    onChange?.(next);
  };

  return (
    <div className={styles.scroll}>
      <div className={styles.helpBox}>{schema.description}</div>

      <TriggerContextCard schema={schema} />

      {(schema.fields || []).map((field) => (
        <TriggerFieldRenderer
          key={field.key || field.type}
          field={field}
          data={data}
          schema={schema}
          onChange={patch}
        />
      ))}
    </div>
  );
}
