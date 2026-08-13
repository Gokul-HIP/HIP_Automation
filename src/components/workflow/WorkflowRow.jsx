"use client";

import {
  HiOutlineEye,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineUpload,
  HiOutlineDuplicate,
} from "react-icons/hi";
import {
  formatWorkflowDate,
  getWorkflowStatusBadge,
} from "@/utils/workflowList";
import styles from "./Workflows.module.css";

const BADGE_CLASS = {
  published: styles.badgePublished,
  draft: styles.badgeDraft,
  paused: styles.badgePaused,
  archived: styles.badgeArchived,
};

export default function WorkflowRow({
  workflow,
  onView,
  onEdit,
  onDelete,
  onPublish,
  onDuplicate,
  busyAction = null,
  disabled = false,
}) {
  const badge = getWorkflowStatusBadge(workflow.status);
  const isBusy = busyAction === workflow.id;

  return (
    <tr>
      <td>
        <div className={styles.nameCell}>
          <p className={styles.nameText}>{workflow.name}</p>
          <p className={styles.idText}>ID #{workflow.id}</p>
        </div>
      </td>

      <td>{workflow.module || "—"}</td>
      <td>{workflow.trigger || "—"}</td>

      <td>
        <span className={`${styles.badge} ${BADGE_CLASS[badge.tone] || styles.badgeDraft}`}>
          {badge.label}
        </span>
      </td>

      <td className={styles.dateCell}>{formatWorkflowDate(workflow.updatedAt)}</td>

      <td className={styles.actionsCell}>
        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => onPublish?.(workflow)}
            disabled={disabled || isBusy}
            aria-label={`Publish ${workflow.name}`}
            title="Publish"
            className={`${styles.iconBtn} ${styles.iconBtnEdit}`}
          >
            <HiOutlineUpload aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => onView?.(workflow)}
            disabled={disabled || isBusy}
            aria-label={`View ${workflow.name}`}
            title="View"
            className={styles.iconBtn}
          >
            <HiOutlineEye aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => onEdit?.(workflow)}
            disabled={disabled || isBusy}
            aria-label={`Edit ${workflow.name}`}
            title="Edit"
            className={`${styles.iconBtn} ${styles.iconBtnEdit}`}
          >
            <HiOutlinePencil aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => onDuplicate?.(workflow)}
            disabled={disabled || isBusy}
            aria-label={`Duplicate ${workflow.name}`}
            title="Duplicate"
            className={`${styles.iconBtn} ${styles.iconBtnEdit}`}
          >
            <HiOutlineDuplicate aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => onDelete?.(workflow)}
            disabled={disabled || isBusy}
            aria-label={`Delete ${workflow.name}`}
            title="Delete"
            className={`${styles.iconBtn} ${styles.iconBtnDelete}`}
          >
            <HiOutlineTrash aria-hidden="true" />
          </button>
        </div>
      </td>
    </tr>
  );
}
