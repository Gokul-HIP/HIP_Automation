"use client";

import { useMemo, useRef, useState } from "react";
import { HiOutlinePlus } from "react-icons/hi";
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
  canAddManualContentAsTemplate,
  hasSelectedTemplate,
} from "./messagingUx";
import {
  buildCreateTemplatePayload,
  extractCreatedTemplateId,
} from "./messagingTemplateSave";
import AddToTemplateModal from "./AddToTemplateModal";
import { useCreateTemplate } from "@/hooks/useWorkflowApi";
import { ensureValidPlaceholder } from "@/utils/workflowVariableTokens";
import useFlowToast from "../../hooks/useFlowToast";
import FlowToast from "../../FlowToast";
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

const OPTIONAL_TEMPLATE_NODES = new Set([
  "sendEmail",
  "sendSms",
  "sendWhatsApp",
  "sendPush",
  "sendAiChat",
  "sendAiVoice",
]);

function suggestedTemplateName(nodeType, data) {
  const label = String(data?.label || "").trim();
  if (nodeType === "sendPush" && data?.title) return String(data.title).trim();
  if (nodeType === "sendEmail" && data?.subject) return String(data.subject).trim();
  if ((nodeType === "sendWhatsApp" || nodeType === "sendSms") && data?.message) {
    return String(data.message).trim().slice(0, 60);
  }
  if ((nodeType === "sendAiChat" || nodeType === "sendAiVoice") && data?.prompt) {
    return String(data.prompt).trim().slice(0, 60);
  }
  return label || "";
}

export default function MessagingProperties({ data, onChange }) {
  const schema = getMessagingSchema(data?.nodeType);
  const patch = (partial) => onChange?.(partial);
  const triggerKey = data?.workflowTriggerKey ?? null;
  const nodeType = data?.nodeType;
  const createMutation = useCreateTemplate();
  const { toast, showToast, clearToast } = useFlowToast();

  const [addOpen, setAddOpen] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const activeFieldRef = useRef({
    key: DEFAULT_INSERT_FIELD[nodeType] || "body",
    start: null,
    end: null,
  });
  const [activeFieldKey, setActiveFieldKey] = useState(
    DEFAULT_INSERT_FIELD[nodeType] || "body"
  );

  const channel =
    getTemplateChannelForNode(nodeType) ??
    (nodeType === "sendTemplate" ? data?.channel || null : null) ??
    schema?.channel ??
    null;

  const errors = useMemo(
    () => getMessagingFieldErrors(data || {}, nodeType),
    [data, nodeType]
  );

  const hasTemplate = hasSelectedTemplate(data);
  const templateOptional = OPTIONAL_TEMPLATE_NODES.has(nodeType);
  const showAddToTemplate = canAddManualContentAsTemplate(nodeType, data || {});

  const requireManualEmail = nodeType === "sendEmail" && !hasTemplate;
  const requireManualPush = nodeType === "sendPush" && !hasTemplate;
  const requireManualMessage =
    (nodeType === "sendWhatsApp" || nodeType === "sendSms") && !hasTemplate;
  const requireManualPrompt =
    (nodeType === "sendAiChat" || nodeType === "sendAiVoice") && !hasTemplate;

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
        : DEFAULT_INSERT_FIELD[nodeType] || "message";

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

    requestAnimationFrame(() => {
      const el = document.getElementById(`schema-${preferred}`);
      if (el && typeof el.setSelectionRange === "function") {
        el.focus();
        el.setSelectionRange(cursor, cursor);
      }
    });
  };

  const handleSaveTemplate = async (name) => {
    if (!channel) {
      setSaveError("Unable to resolve channel for this node.");
      return;
    }

    setSaveError(null);
    try {
      const payload = buildCreateTemplatePayload({
        nodeType,
        data: data || {},
        name,
        channel,
      });
      const created = await createMutation.mutateAsync(payload);
      const newId =
        extractCreatedTemplateId(created) ||
        (created?.id != null && String(created.id).trim() !== ""
          ? String(created.id)
          : null);

      if (!newId) {
        setSaveError(
          "Template may have been saved, but no template id was returned. Close and select it from the list."
        );
        return;
      }

      patch({ templateId: newId });
      setAddOpen(false);
      showToast("success", "Template saved. You can reuse it in other nodes.");
    } catch (err) {
      setSaveError(err?.message || "Failed to save template.");
    }
  };

  const errorList = Object.values(errors);

  return (
    <div className={styles.scrollCompact}>
      <FlowToast toast={toast} onDismiss={clearToast} />

      {(schema.fields || []).map((field) => {
        if (field.type === "variables") return null;

        if (field.type === "templateSelect") {
          return (
            <TemplatePicker
              key={field.key}
              value={data?.[field.key] ?? ""}
              channel={channel}
              label={field.label || "Template"}
              required={Boolean(field.required) && !templateOptional}
              triggerKey={triggerKey}
              nodeType={nodeType}
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
                  (requireManualMessage && field.key === "message") ||
                  (requireManualPrompt && field.key === "prompt") ||
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

      {showAddToTemplate ? (
        <button
          type="button"
          className={styles.addToTemplateBtn}
          onClick={() => {
            setSaveError(null);
            setAddOpen(true);
          }}
        >
          <HiOutlinePlus aria-hidden="true" />
          Add to Template
        </button>
      ) : null}

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

      <AddToTemplateModal
        open={addOpen}
        loading={createMutation.isPending}
        error={saveError}
        defaultName={suggestedTemplateName(nodeType, data || {})}
        onCancel={() => {
          if (!createMutation.isPending) {
            setAddOpen(false);
            setSaveError(null);
          }
        }}
        onSave={handleSaveTemplate}
      />
    </div>
  );
}
