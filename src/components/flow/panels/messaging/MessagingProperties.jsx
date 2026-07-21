"use client";

import { getMessagingSchema } from "../../config/messaging/schemas";
import SchemaFieldRenderer from "../shared/SchemaFieldRenderer";
import VariablePicker from "../shared/VariablePicker";
import styles from "../../styles/propertyPanel.module.css";

export default function MessagingProperties({ data, onChange }) {
  const schema = getMessagingSchema(data?.nodeType);

  if (!schema) {
    return (
      <div className={styles.scroll}>
        <p className={styles.hint}>No messaging schema found.</p>
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

      <VariablePicker
        groups={schema.variableGroups || []}
        onInsert={(token) => {
          const body = data?.messageBody || data?.templateId || "";
          patch({ templateId: `${body}${token}` });
        }}
      />
    </div>
  );
}
