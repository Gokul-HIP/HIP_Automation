"use client";

import { useMemo, useState } from "react";
import {
  HiOutlineX,
  HiOutlineTemplate,
  HiOutlineDocumentAdd,
  HiOutlineSearch,
} from "react-icons/hi";
import { useWorkflowTemplates } from "@/hooks/useWorkflowTemplateApi";
import styles from "./Workflows.module.css";

/**
 * Create Workflow chooser — Blank vs Use Template.
 * Templates are admin-managed; users only pick active blueprints to copy.
 */
export default function CreateWorkflowModal({
  open,
  onClose,
  onBlank,
  onSelectTemplate,
}) {
  const [step, setStep] = useState("chooser"); // chooser | templates
  const [search, setSearch] = useState("");

  const { data, isLoading, error } = useWorkflowTemplates({
    search: search.trim() || undefined,
    perPage: 50,
  });

  const templates = useMemo(() => data?.items ?? [], [data?.items]);

  if (!open) return null;

  const close = () => {
    setStep("chooser");
    setSearch("");
    onClose?.();
  };

  return (
    <div
      className={styles.modalOverlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-workflow-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className={`${styles.modal} ${styles.createWorkflowModal}`}>
        <div className={styles.createModalHeader}>
          <h2 id="create-workflow-title" className={styles.modalTitle}>
            {step === "chooser" ? "Create Workflow" : "Use Template"}
          </h2>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={close}
            aria-label="Close"
          >
            <HiOutlineX />
          </button>
        </div>

        {step === "chooser" ? (
          <div className={styles.createOptions}>
            <button
              type="button"
              className={styles.createOptionCard}
              onClick={() => setStep("templates")}
            >
              <span className={styles.createOptionIcon}>
                <HiOutlineTemplate aria-hidden="true" />
              </span>
              <span className={styles.createOptionTitle}>Use Template</span>
              <span className={styles.createOptionText}>
                Start from an admin-managed blueprint. Your workflow is an
                independent copy.
              </span>
            </button>

            <button
              type="button"
              className={styles.createOptionCard}
              onClick={() => {
                close();
                onBlank?.();
              }}
            >
              <span className={styles.createOptionIcon}>
                <HiOutlineDocumentAdd aria-hidden="true" />
              </span>
              <span className={styles.createOptionTitle}>
                Create My Own Workflow
              </span>
              <span className={styles.createOptionText}>
                Open a blank Workflow Builder and design from scratch.
              </span>
            </button>
          </div>
        ) : (
          <div className={styles.templatePickWrap}>
            <button
              type="button"
              className={styles.btnGhost}
              onClick={() => setStep("chooser")}
            >
              ← Back
            </button>

            <label className={styles.searchWrap}>
              <HiOutlineSearch className={styles.searchIcon} aria-hidden="true" />
              <input
                type="search"
                className={styles.searchInput}
                placeholder="Search templates…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>

            {isLoading ? (
              <p className={styles.stateText}>Loading templates…</p>
            ) : null}

            {error ? (
              <p className={styles.errorText}>{error.message}</p>
            ) : null}

            {!isLoading && !error && templates.length === 0 ? (
              <p className={styles.stateText}>
                No active templates available. Ask an administrator to publish
                one, or create your own workflow.
              </p>
            ) : null}

            <div className={styles.templateCardGrid}>
              {templates.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  className={styles.templatePickCard}
                  onClick={() => {
                    close();
                    onSelectTemplate?.(tpl);
                  }}
                >
                  <span className={styles.templatePickName}>{tpl.name}</span>
                  {tpl.description ? (
                    <span className={styles.templatePickDesc}>
                      {tpl.description}
                    </span>
                  ) : null}
                  <span className={styles.templatePickMeta}>
                    <span>{tpl.module || "—"}</span>
                    <span>{tpl.trigger || "—"}</span>
                    <span>{tpl.nodeCount ?? 0} nodes</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
