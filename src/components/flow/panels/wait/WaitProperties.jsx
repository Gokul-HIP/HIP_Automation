"use client";

import { getWaitSchema } from "../../config/wait/schemas";
import SchemaFieldRenderer from "../shared/SchemaFieldRenderer";
import styles from "../../styles/propertyPanel.module.css";

export default function WaitProperties({ data, onChange }) {
  const schema = getWaitSchema(data?.nodeType);

  if (!schema) {
    return (
      <div className={styles.scroll}>
        <p className={styles.hint}>No wait schema found.</p>
      </div>
    );
  }

  const patch = (partial) => onChange?.(partial);

  return (
    <div className={styles.scroll}>
      <div className={styles.helpBox}>{schema.description}</div>

      {(schema.fields || []).map((field) => (
        <SchemaFieldRenderer
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
