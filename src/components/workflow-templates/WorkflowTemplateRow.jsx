"use client";

import {
  HiOutlineEye,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineDuplicate,
  HiOutlineTemplate,
} from "react-icons/hi";
import {
  formatWorkflowDate,
  getWorkflowStatusBadge,
} from "@/utils/workflowList";
import styles from "@/components/workflow/Workflows.module.css";

const BADGE_CLASS = {
  published: styles.badgePublished,
  draft: styles.badgeDraft,
  paused: styles.badgePaused,
  archived: styles.badgeArchived,
};

export default function WorkflowTemplateRow({
  template,
  onView,
  onEdit,
  onPreview,
  onDuplicate,
  onDelete,
  busyAction = null,
  disabled = false,
}) {
  const badge = getWorkflowStatusBadge(template.status);
  const isBusy = busyAction === template.id;

  return (
    <tr>
      <td>
        <div className={styles.nameCell}>
          <p className={styles.nameText}>{template.name}</p>
          <p className={styles.idText}>ID #{template.id}</p>
        </div>
      </td>
      <td>{template.module || "—"}</td>
      <td>{template.trigger || "—"}</td>
      <td>{template.nodeCount ?? 0}</td>
      <td>
        <span
          className={`${styles.badge} ${BADGE_CLASS[badge.tone] || styles.badgeDraft}`}
        >
          {badge.label === "Published" ? "Active" : badge.label}
        </span>
      </td>
      <td className={styles.dateCell}>
        {formatWorkflowDate(template.createdAt || template.updatedAt)}
      </td>
      <td className={styles.actionsCell}>
        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => onView?.(template)}
            disabled={disabled || isBusy}
            aria-label={`View ${template.name}`}
            title="View"
            className={styles.iconBtn}
          >
            <HiOutlineEye aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onEdit?.(template)}
            disabled={disabled || isBusy}
            aria-label={`Edit ${template.name}`}
            title="Edit"
            className={`${styles.iconBtn} ${styles.iconBtnEdit}`}
          >
            <HiOutlinePencil aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onPreview?.(template)}
            disabled={disabled || isBusy}
            aria-label={`Preview ${template.name}`}
            title="Preview"
            className={styles.iconBtn}
          >
            <HiOutlineTemplate aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onDuplicate?.(template)}
            disabled={disabled || isBusy}
            aria-label={`Duplicate ${template.name}`}
            title="Duplicate"
            className={`${styles.iconBtn} ${styles.iconBtnEdit}`}
          >
            <HiOutlineDuplicate aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onDelete?.(template)}
            disabled={disabled || isBusy}
            aria-label={`Delete ${template.name}`}
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
