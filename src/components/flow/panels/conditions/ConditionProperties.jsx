"use client";

import { getConditionSchema } from "../../config/conditions/schemas";
import ConditionBuilder from "./ConditionBuilder";
import SchemaFieldRenderer from "../shared/SchemaFieldRenderer";
import styles from "../../styles/propertyPanel.module.css";

export default function ConditionProperties({ data, onChange }) {
  const schema = getConditionSchema(data?.nodeType);

  if (!schema) {
    return (
      <div className={styles.scroll}>
        <p className={styles.hint}>No condition schema found.</p>
      </div>
    );
  }

  const patch = (partial) => onChange?.(partial);

  return (
    <div className={styles.scroll}>
      <div className={styles.helpBox}>{schema.description}</div>

      {(schema.fields || []).map((field) => {
        if (field.type === "conditionBuilder") {
          return (
            <ConditionBuilder
              key={field.key}
              data={data}
              onChange={patch}
            />
          );
        }

        return (
          <SchemaFieldRenderer
            key={field.key || field.type}
            field={field}
            data={data}
            schema={schema}
            onChange={patch}
          />
        );
      })}
    </div>
  );
}
