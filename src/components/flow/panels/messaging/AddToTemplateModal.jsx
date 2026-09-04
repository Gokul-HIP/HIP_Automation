"use client";

import { useState } from "react";
import styles from "@/components/workflow/Workflows.module.css";
import panelStyles from "@/components/flow/styles/propertyPanel.module.css";

/**
 * Modal to save current messaging-node manual content as a reusable template.
 * Uses existing workflow modal styling (no new dialog library).
 * Remounts when opened so name resets without an effect.
 */
export default function AddToTemplateModal({
  open,
  loading = false,
  error = null,
  defaultName = "",
  onCancel,
  onSave,
}) {
  if (!open) return null;

  return (
    <AddToTemplateModalForm
      loading={loading}
      error={error}
      defaultName={defaultName}
      onCancel={onCancel}
      onSave={onSave}
    />
  );
}

function AddToTemplateModalForm({
  loading = false,
  error = null,
  defaultName = "",
  onCancel,
  onSave,
}) {
  const [name, setName] = useState(defaultName || "");
  const [localError, setLocalError] = useState(null);

  const handleSave = () => {
    const trimmed = String(name || "").trim();
    if (!trimmed) {
      setLocalError("Template name is required.");
      return;
    }
    setLocalError(null);
    onSave?.(trimmed);
  };

  const displayError = localError || error;

  return (
    <div
      className={styles.modalOverlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-to-template-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onCancel?.();
      }}
    >
      <div className={styles.modal}>
        <h2 id="add-to-template-title" className={styles.modalTitle}>
          Add to Template
        </h2>
        <p className={styles.modalText}>
          This will save the content entered in this node as a reusable
          template.
        </p>

        <div className={panelStyles.field} style={{ textAlign: "left", marginTop: 12 }}>
          <label className={panelStyles.label} htmlFor="add-template-name">
            Template Name *
          </label>
          <input
            id="add-template-name"
            type="text"
            className={`${panelStyles.control} ${
              displayError ? panelStyles.controlError : ""
            }`}
            value={name}
            disabled={loading}
            placeholder="Appointment Confirmation"
            autoFocus
            onChange={(e) => {
              setName(e.target.value);
              if (localError) setLocalError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSave();
              }
            }}
          />
          {displayError ? (
            <p className={panelStyles.fieldError}>{displayError}</p>
          ) : null}
        </div>

        <div className={styles.modalActions}>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className={styles.btnSecondary}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className={styles.btnPrimary}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <span className={styles.btnSpinner} aria-hidden="true" />
                Saving…
              </>
            ) : (
              "Save Template"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
