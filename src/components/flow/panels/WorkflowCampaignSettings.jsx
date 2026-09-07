"use client";

import styles from "../styles/flow.module.css";

/**
 * Workflow-level campaign fields (not a node type).
 * Used by firstAppointmentNurturing and other suppress-on-booking campaigns.
 */
export default function WorkflowCampaignSettings({
  campaignKey = "",
  suppressOnAppointment = false,
  onCampaignKeyChange,
  onSuppressOnAppointmentChange,
  readOnly = false,
}) {
  return (
    <div className={styles.fields}>
      <div className={styles.helpBox}>
        Campaign settings apply to the whole workflow. Set a stable{" "}
        <strong>Campaign Key</strong> (for example{" "}
        <code>first_appointment_nurturing</code>) so booking an appointment can
        cancel remaining reminders without hardcoding a workflow id.
      </div>

      <div>
        <label htmlFor="workflow-campaign-key" className={styles.fieldLabel}>
          Campaign Key
          {suppressOnAppointment ? " *" : ""}
        </label>
        <input
          id="workflow-campaign-key"
          type="text"
          className={styles.field}
          value={campaignKey}
          placeholder="first_appointment_nurturing"
          readOnly={readOnly}
          disabled={readOnly}
          onChange={(e) => onCampaignKeyChange?.(e.target.value)}
        />
      </div>

      <div className={styles.boolRow}>
        <label
          htmlFor="workflow-suppress-appointment"
          className={styles.fieldLabel}
        >
          Cancel on appointment booked
        </label>
        <button
          id="workflow-suppress-appointment"
          type="button"
          role="switch"
          aria-checked={Boolean(suppressOnAppointment)}
          className={styles.toggle}
          data-on={suppressOnAppointment ? "true" : "false"}
          disabled={readOnly}
          onClick={() =>
            onSuppressOnAppointmentChange?.(!suppressOnAppointment)
          }
        >
          <span className={styles.toggleThumb} />
        </button>
      </div>
    </div>
  );
}
