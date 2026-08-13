"use client";

import { findTriggerSchema } from "@/services/api/triggers";
import { useTriggers } from "@/hooks/useWorkflowApi";
import ApiSchemaForm from "./ApiSchemaForm";
import styles from "@/components/flow/styles/propertyPanel.module.css";

export default function ApiTriggerProperties({ data, onChange }) {
  const { data: catalog, isLoading, error } = useTriggers();
  const triggerKey = data?.triggerKey ?? data?.nodeType;
  const trigger = catalog ? findTriggerSchema(catalog.triggers, triggerKey) : null;

  if (isLoading) {
    return (
      <div className={styles.scroll}>
        <p className={styles.hint}>Loading trigger schema…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.scroll}>
        <p className={styles.hint}>Failed to load trigger schema.</p>
      </div>
    );
  }

  if (!trigger) {
    return (
      <div className={styles.scroll}>
        <p className={styles.hint}>No API schema found for this trigger.</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.helpBox}>{trigger.description || trigger.name}</div>
      <ApiSchemaForm
        fields={trigger.schema?.fields ?? []}
        data={data}
        onChange={onChange}
      />
    </>
  );
}
