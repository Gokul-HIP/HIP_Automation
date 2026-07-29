"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTemplates, useTemplatePreview } from "@/hooks/useWorkflowApi";
import { mapTemplatePreviewToNodeFields } from "@/services/api/templates";
import { channelDisplayName } from "@/components/flow/panels/messaging/messagingUx";
import styles from "@/components/flow/styles/propertyPanel.module.css";

function hasPreviewContent(preview) {
  if (!preview) return false;
  return Boolean(
    preview.subject ||
      preview.title ||
      preview.body ||
      preview.message ||
      preview.buttons ||
      preview.preview
  );
}

function previewFromTemplateMeta(template) {
  if (!template) return null;
  return {
    name: template.name ?? null,
    title: template.title ?? null,
    subject: template.subject ?? null,
    body: template.body ?? null,
    message: template.message ?? template.body ?? null,
    buttons: template.buttons ?? null,
    priority: template.priority ?? null,
    preview: [template.subject, template.title, template.body || template.message]
      .filter(Boolean)
      .join("\n\n"),
  };
}

function PreviewCard({ preview, templateName, error, loading, expanded, onToggle }) {
  if (loading && !hasPreviewContent(preview)) {
    return (
      <div className={styles.previewCard} aria-busy="true">
        <div className={styles.previewCardHeader}>
          <span className={styles.previewMessageLabel}>Template Preview</span>
        </div>
        <div className={styles.previewCardBody}>
          <div className={styles.skeletonStack}>
            <div className={styles.skeletonLine} style={{ width: "55%" }} />
            <div className={styles.skeletonLine} style={{ width: "90%" }} />
            <div className={styles.skeletonLine} style={{ width: "72%" }} />
          </div>
        </div>
      </div>
    );
  }

  if (error && !hasPreviewContent(preview)) {
    return (
      <div className={styles.previewCard}>
        <div className={styles.previewCardHeader}>
          <span className={styles.previewMessageLabel}>Template Preview</span>
        </div>
        <div className={styles.previewCardBody}>
          <p className={styles.fieldError}>Unable to preview template.</p>
        </div>
      </div>
    );
  }

  if (!hasPreviewContent(preview) && !templateName) return null;

  const rows = [
    preview?.subject ? { label: "Subject", value: preview.subject } : null,
    preview?.title ? { label: "Title", value: preview.title } : null,
    preview?.body || preview?.message
      ? { label: "Body", value: preview.body || preview.message }
      : null,
    preview?.buttons ? { label: "Buttons", value: preview.buttons } : null,
  ].filter(Boolean);

  return (
    <div className={styles.previewCard}>
      <button
        type="button"
        className={styles.previewCardHeaderBtn}
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <span className={styles.previewTitle}>
          <span aria-hidden="true">📧</span>
          {templateName || preview?.name || "Template"}
        </span>
        <span className={styles.previewToggle}>{expanded ? "Hide" : "Show"}</span>
      </button>

      {expanded ? (
        <div className={styles.previewCardBody}>
          {rows.length === 0 ? (
            <p className={styles.previewMessageBody}>
              {preview?.preview || "No preview content returned."}
            </p>
          ) : (
            rows.map((row) => (
              <div key={row.label} className={styles.previewRow}>
                <span className={styles.previewRowLabel}>{row.label}</span>
                <p className={styles.previewMessageBody}>{row.value}</p>
              </div>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Template selector locked to a single channel (derived from the messaging node type).
 */
export default function TemplatePicker({
  value,
  channel = null,
  label = "Template",
  triggerKey = null,
  nodeType = null,
  error = null,
  onChange,
  onFieldsFill,
}) {
  const [preview, setPreview] = useState(null);
  const [previewError, setPreviewError] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const lastHandledId = useRef(null);
  const lastFilledId = useRef(null);

  const enabled = Boolean(channel);
  const {
    data: templates = [],
    isLoading,
    isError,
    isFetching,
  } = useTemplates(channel);
  const previewMutation = useTemplatePreview();

  const selectedTemplate = useMemo(
    () => templates.find((tpl) => String(tpl.id) === String(value)) ?? null,
    [templates, value]
  );

  const fillOnce = (templateId, nextPreview, templateMeta) => {
    const id = String(templateId || "");
    if (!id || lastFilledId.current === id) return;
    const fill = mapTemplatePreviewToNodeFields(
      nodeType,
      nextPreview,
      templateMeta || {}
    );
    if (Object.keys(fill).length) {
      onFieldsFill?.(fill);
      lastFilledId.current = id;
    }
  };

  const loadPreview = async (templateId, templateMeta = null, fillFields = true) => {
    if (!templateId) {
      lastHandledId.current = null;
      lastFilledId.current = null;
      setPreview(null);
      setPreviewError(false);
      return null;
    }

    lastHandledId.current = String(templateId);
    setPreviewError(false);

    const fromList = previewFromTemplateMeta(templateMeta);
    if (hasPreviewContent(fromList)) {
      setPreview(fromList);
      setExpanded(true);
    }

    try {
      const result = await previewMutation.mutateAsync({
        id: templateId,
        payload: triggerKey ? { trigger: triggerKey } : {},
      });
      const merged = {
        ...(fromList || {}),
        ...result,
        name: result?.name || templateMeta?.name || fromList?.name || null,
      };
      setPreview(merged);
      setExpanded(true);
      if (fillFields) fillOnce(templateId, merged, templateMeta);
      return merged;
    } catch {
      if (hasPreviewContent(fromList)) {
        if (fillFields) fillOnce(templateId, fromList, templateMeta);
        return fromList;
      }
      setPreviewError(true);
      return null;
    }
  };

  const handleSelect = async (templateId) => {
    onChange?.(templateId);
    if (!templateId) {
      lastHandledId.current = null;
      lastFilledId.current = null;
      setPreview(null);
      setPreviewError(false);
      return;
    }

    lastFilledId.current = null;
    const meta = templates.find((tpl) => String(tpl.id) === String(templateId));
    await loadPreview(templateId, meta, true);
  };

  useEffect(() => {
    if (!value) {
      lastHandledId.current = null;
      setPreview(null);
      setPreviewError(false);
      return;
    }

    if (!selectedTemplate) return;
    if (String(lastHandledId.current) === String(value)) return;
    if (previewMutation.isPending) return;

    loadPreview(value, selectedTemplate, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, selectedTemplate?.id]);

  if (!enabled) {
    return (
      <div className={styles.field}>
        <label className={styles.label}>{label}</label>
        <p className={styles.hint}>Unable to resolve channel for this node.</p>
      </div>
    );
  }

  const templatesLoading = isLoading || (isFetching && templates.length === 0);
  const channelLabel = channelDisplayName(channel);

  if (!templatesLoading && !isError && templates.length === 0) {
    const isVoice = String(channel || "").toLowerCase() === "voice";
    return (
      <div className={styles.field}>
        <label className={styles.label}>{label}</label>
        <div className={styles.emptyTemplateBox}>
          <p className={styles.sectionHint}>
            {isVoice
              ? "Voice templates are not implemented yet."
              : `No templates available for ${channelLabel}.`}
          </p>
          <button
            type="button"
            className={styles.retryBtn}
            disabled
            title={
              isVoice
                ? "Voice templates are not implemented yet."
                : "Template creation is not available in the builder yet."
            }
          >
            Create Template
          </button>
        </div>
        {error ? <p className={styles.fieldError}>{error}</p> : null}
      </div>
    );
  }

  return (
    <div className={styles.templateLayout}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="template-select">
          {label}
          {" *"}
        </label>
        <select
          id="template-select"
          className={`${styles.select} ${error ? styles.controlError : ""}`}
          value={value ?? ""}
          disabled={templatesLoading || isError}
          onChange={(e) => handleSelect(e.target.value)}
        >
          <option value="">
            {templatesLoading ? "Loading templates…" : "Select template…"}
          </option>
          {templates.map((tpl) => (
            <option key={tpl.id} value={tpl.id}>
              {tpl.name}
            </option>
          ))}
        </select>

        {templatesLoading ? (
          <p className={styles.hint}>Loading templates…</p>
        ) : null}

        {isError ? (
          <p className={styles.fieldError}>
            Failed to load templates for {channelLabel}.
          </p>
        ) : null}

        {error ? <p className={styles.fieldError}>{error}</p> : null}
      </div>

      {value ? (
        <PreviewCard
          preview={preview}
          templateName={selectedTemplate?.name}
          error={previewError}
          loading={previewMutation.isPending && !hasPreviewContent(preview)}
          expanded={expanded}
          onToggle={() => setExpanded((v) => !v)}
        />
      ) : null}
    </div>
  );
}
