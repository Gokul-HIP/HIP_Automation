"use client";

import { HiOutlineExclamationCircle } from "react-icons/hi";
import styles from "@/components/workflow/Workflows.module.css";

export default function DeleteTemplateModal({
  open,
  template,
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
      aria-labelledby="delete-template-title"
    >
      <div className={styles.modal}>
        <div className={styles.modalIcon}>
          <HiOutlineExclamationCircle aria-hidden="true" />
        </div>

        <h2 id="delete-template-title" className={styles.modalTitle}>
          Delete Template?
        </h2>
        <p className={styles.modalText}>
          This soft-deletes the blueprint. Existing workflows are not affected.
          {template?.name ? (
            <>
              {" "}
              <span className={styles.modalStrong}>{template.name}</span> will
              be removed from the catalog.
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
