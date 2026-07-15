"use client";

import ToggleField from "../fields/ToggleField";
import SelectField from "../fields/SelectField";
import NumberField from "../fields/NumberField";
import { RETRY_INTERVAL_OPTIONS } from "../../config/triggers";
import styles from "../../styles/medicineReminder.module.css";

export default function TriggerRetryPolicy({ data, onChange }) {
  const enabled = Boolean(data?.repeatReminder);

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Retry Policy</h3>
      <ToggleField
        id="trigger-retry-toggle"
        label="Repeat Reminder"
        description="Retry delivery until acknowledged or max retries reached."
        checked={enabled}
        onChange={(repeatReminder) => onChange?.({ repeatReminder })}
      />
      {enabled ? (
        <div className={styles.row2}>
          <SelectField
            id="trigger-retry-interval"
            label="Retry Interval"
            value={data?.retryInterval ?? 15}
            options={RETRY_INTERVAL_OPTIONS}
            required
            onChange={(retryInterval) => onChange?.({ retryInterval })}
          />
          <NumberField
            id="trigger-max-retry"
            label="Maximum Retry Count"
            value={data?.maxRetryCount ?? 2}
            min={1}
            max={20}
            required
            onChange={(maxRetryCount) => onChange?.({ maxRetryCount })}
          />
        </div>
      ) : null}
    </div>
  );
}
