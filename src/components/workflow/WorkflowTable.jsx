"use client";

import WorkflowRow from "./WorkflowRow";
import LoadingSkeleton from "./LoadingSkeleton";
import styles from "./Workflows.module.css";

export default function WorkflowTable({
  workflows,
  loading = false,
  onView,
  onEdit,
  onDelete,
  onPublish,
  onDuplicate,
  busyAction = null,
  disabled = false,
}) {
  return (
    <div className={styles.tableCard}>
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Workflow Name</th>
              <th>Module</th>
              <th>Trigger</th>
              <th>Status</th>
              <th>Last Updated</th>
              <th className={styles.actionsCol}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <LoadingSkeleton rows={6} />
            ) : (
              workflows.map((workflow) => (
                <WorkflowRow
                  key={workflow.id}
                  workflow={workflow}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onPublish={onPublish}
                  onDuplicate={onDuplicate}
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
