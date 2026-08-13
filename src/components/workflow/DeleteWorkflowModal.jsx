"use client";

import { HiOutlineExclamationCircle } from "react-icons/hi";
import styles from "./Workflows.module.css";

export default function DeleteWorkflowModal({
  open,
  workflow,
  loading = false,
  onCancel,
  onConfirm,
}) {
  if (!open) return null;

  return (
    <div
      className={styles.modalOverlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-workflow-title"
    >
      <div className={styles.modal}>
        <div className={styles.modalIcon}>
          <HiOutlineExclamationCircle aria-hidden="true" />
        </div>

        <h2 id="delete-workflow-title" className={styles.modalTitle}>
          Delete Workflow?
        </h2>
        <p className={styles.modalText}>
          This action cannot be undone.
          {workflow?.name ? (
            <>
              {" "}
              <span className={styles.modalStrong}>{workflow.name}</span> will
              be permanently removed.
            </>
          ) : null}
        </p>

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
            onClick={onConfirm}
            disabled={loading}
            className={styles.btnDanger}
          >
            {loading ? (
              <>
                <span className={styles.btnSpinner} aria-hidden="true" />
                Deleting…
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
