"use client";

import SelectField from "../fields/SelectField";
import TextField from "../fields/TextField";
import styles from "../../styles/propertyPanel.module.css";

export default function EndProperties({ data, onChange }) {
  const patch = (partial) => onChange?.(partial);

  return (
    <div className={styles.scroll}>
      <div className={styles.helpBox}>
        Marks the end of a workflow branch. Every published workflow should
        include at least one End node.
      </div>

      <TextField
        id="end-label"
        label="Display Name"
        value={data?.label ?? "End"}
        required
        onChange={(label) => patch({ label })}
      />

      <SelectField
        id="end-outcome"
        label="Outcome"
        value={data?.outcome || "completed"}
        options={[
          { value: "completed", label: "Completed" },
          { value: "cancelled", label: "Cancelled" },
          { value: "failed", label: "Failed" },
        ]}
        onChange={(outcome) => patch({ outcome })}
      />
    </div>
  );
}
