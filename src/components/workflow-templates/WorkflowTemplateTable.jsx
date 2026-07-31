"use client";

import WorkflowTemplateRow from "./WorkflowTemplateRow";
import LoadingSkeleton from "@/components/workflow/LoadingSkeleton";
import styles from "@/components/workflow/Workflows.module.css";

export default function WorkflowTemplateTable({
  templates,
  loading = false,
  onView,
  onEdit,
  onPreview,
  onDuplicate,
  onDelete,
  busyAction = null,
  disabled = false,
}) {
  return (
    <div className={styles.tableCard}>
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Module</th>
              <th>Trigger</th>
              <th>Nodes</th>
              <th>Status</th>
              <th>Created Date</th>
              <th className={styles.actionsCol}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <LoadingSkeleton rows={6} />
            ) : (
              templates.map((template) => (
                <WorkflowTemplateRow
                  key={template.id}
                  template={template}
                  onView={onView}
                  onEdit={onEdit}
                  onPreview={onPreview}
                  onDuplicate={onDuplicate}
                  onDelete={onDelete}
                  busyAction={busyAction}
                  disabled={disabled}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
