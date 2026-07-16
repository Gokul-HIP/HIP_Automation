"use client";

import {
  HiOutlineEye,
  HiOutlinePencil,
  HiOutlineTrash,
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

      <td>
        <span className={`${styles.badge} ${BADGE_CLASS[badge.tone] || styles.badgeDraft}`}>
          {badge.label}
        </span>
      </td>

      <td>{workflow.createdBy}</td>

      <td className={styles.dateCell}>
        {formatWorkflowDate(workflow.createdAt)}
      </td>

      <td className={styles.dateCell}>
        {formatWorkflowDate(workflow.updatedAt)}
      </td>

      <td className={styles.actionsCell}>
        <div className={styles.actions}>
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
