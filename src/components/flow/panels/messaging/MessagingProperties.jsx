"use client";

import { useMemo, useRef, useState } from "react";
import {
  getMessagingSchema,
  getTemplateChannelForNode,
} from "../../config/messaging/schemas";
import SchemaFieldRenderer from "../shared/SchemaFieldRenderer";
import TemplatePicker from "@/components/template-picker/TemplatePicker";
import ApiVariablePicker from "@/components/variable-picker/ApiVariablePicker";
import {
  getMessagingFieldErrors,
  insertAtCursor,
} from "./messagingUx";
import { ensureValidPlaceholder } from "@/utils/workflowVariableTokens";
import styles from "../../styles/propertyPanel.module.css";

const INSERTABLE_KEYS = new Set([
  "subject",
  "body",
  "message",
  "title",
  "prompt",
  "buttons",
]);

const DEFAULT_INSERT_FIELD = {
  sendEmail: "body",
  sendPush: "body",
  sendWhatsApp: "message",
  sendSms: "message",
  sendAiChat: "prompt",
  sendAiVoice: "prompt",
};

export default function MessagingProperties({ data, onChange }) {
  const schema = getMessagingSchema(data?.nodeType);
  const patch = (partial) => onChange?.(partial);
  const triggerKey = data?.workflowTriggerKey ?? null;

  const activeFieldRef = useRef({
    key: DEFAULT_INSERT_FIELD[data?.nodeType] || "body",
    start: null,
    end: null,
  });
  const [activeFieldKey, setActiveFieldKey] = useState(
    DEFAULT_INSERT_FIELD[data?.nodeType] || "body"
  );

  const channel =
    getTemplateChannelForNode(data?.nodeType) ??
    (data?.nodeType === "sendTemplate" ? data?.channel || null : null) ??
    schema?.channel ??
    null;

  const errors = useMemo(
    () => getMessagingFieldErrors(data || {}, data?.nodeType),
    [data]
  );

  const hasTemplate = Boolean(
    String(data?.templateId ?? data?.template_id ?? "").trim()
  );
  const requireManualEmail =
    data?.nodeType === "sendEmail" && !hasTemplate;
  const requireManualPush =
    data?.nodeType === "sendPush" && !hasTemplate;

  if (!schema) {
    return (
      <div className={styles.scrollCompact}>
        <p className={styles.hint}>No messaging schema found.</p>
      </div>
    );
  }

  const rememberSelection = (key, target) => {
    activeFieldRef.current = {
      key,
      start: target?.selectionStart ?? null,
      end: target?.selectionEnd ?? null,
    };
    setActiveFieldKey(key);
  };

  const handleInsertVariable = (token) => {
    const safeToken = ensureValidPlaceholder(token);
    if (!safeToken) return;

    const preferred =
      activeFieldRef.current.key && INSERTABLE_KEYS.has(activeFieldRef.current.key)
        ? activeFieldRef.current.key
        : DEFAULT_INSERT_FIELD[data?.nodeType] || "message";

    const current = String(data?.[preferred] ?? "");
    const { value, cursor } = insertAtCursor(
      current,
      safeToken,
      activeFieldRef.current.start,
      activeFieldRef.current.end
    );

    patch({ [preferred]: value });
    activeFieldRef.current = {
      key: preferred,
      start: cursor,
      end: cursor,
    };
    setActiveFieldKey(preferred);

    // Restore cursor after React re-render.
    requestAnimationFrame(() => {
      const el = document.getElementById(`schema-${preferred}`);
      if (el && typeof el.setSelectionRange === "function") {
        el.focus();
        el.setSelectionRange(cursor, cursor);
      }
    });
  };

  const errorList = Object.values(errors);

  return (
    <div className={styles.scrollCompact}>
      {(schema.fields || []).map((field) => {
        if (field.type === "variables") return null;

        if (field.type === "templateSelect") {
          return (
            <TemplatePicker
              key={field.key}
              value={data?.[field.key] ?? ""}
              channel={channel}
              label={field.label || "Template"}
              triggerKey={triggerKey}
              nodeType={data?.nodeType}
              error={errors.templateId || null}
              onChange={(templateId) => patch({ [field.key]: templateId })}
              onFieldsFill={(fields) => patch(fields)}
            />
          );
        }

        const isInsertable = INSERTABLE_KEYS.has(field.key);

        return (
          <div
            key={field.key || field.type}
            className={activeFieldKey === field.key ? styles.fieldActive : undefined}
          >
            <SchemaFieldRenderer
              field={{
                ...field,
                required:
                  field.required ||
                  (requireManualEmail &&
                    (field.key === "subject" || field.key === "body")) ||
                  (requireManualPush &&
                    (field.key === "title" || field.key === "body")) ||
                  Boolean(errors[field.key] && field.key !== "templateId"),
              }}
              data={data}
              schema={schema}
              onChange={patch}
              error={errors[field.key] || null}
              onFocusField={
                isInsertable
                  ? (event) => rememberSelection(field.key, event.target)
                  : undefined
              }
              onSelectField={
                isInsertable
                  ? (event) => rememberSelection(field.key, event.target)
                  : undefined
              }
            />
          </div>
        );
      })}

      <ApiVariablePicker triggerKey={triggerKey} onInsert={handleInsertVariable} />

      {errorList.length ? (
        <div className={styles.validationBox} role="alert">
          <p className={styles.sectionTitle}>Validation</p>
          <ul className={styles.validationList}>
            {errorList.map((msg) => (
              <li key={msg}>{msg}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
