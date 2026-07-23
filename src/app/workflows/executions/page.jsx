"use client";

import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useExecutions } from "@/hooks/useWorkflowApi";
import { formatDuration } from "@/services/api/executions";
import { formatWorkflowDate } from "@/utils/workflowList";
import styles from "@/components/workflow/Workflows.module.css";

export default function WorkflowExecutionsPage() {
  const { data, isLoading, error, refetch } = useExecutions({ perPage: 50 });

  const items = data?.items ?? [];

  return (
    <DashboardLayout>
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>Execution History</h1>
          <p className={styles.subtitle}>
            Recent workflow runs from the Builder Connect API.
          </p>
          <Link href="/workflows" className={styles.btnGhost}>
            ← Back to workflows
          </Link>
        </header>

        {isLoading ? (
          <div className={styles.stateCard}>
            <span className={styles.loadingSpinner} aria-hidden="true" />
            <p className={styles.stateText}>Loading executions…</p>
          </div>
        ) : null}

        {error ? (
          <div className={styles.errorCard}>
            <p className={styles.errorText}>{error.message}</p>
            <button type="button" className={styles.btnSecondary} onClick={() => refetch()}>
              Retry
            </button>
          </div>
        ) : null}

        {!isLoading && !error ? (
          <div className={styles.tableCard}>
            <div className={styles.tableScroll}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Workflow</th>
                    <th>Trigger</th>
                    <th>Status</th>
                    <th>Started</th>
                    <th>Completed</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={6}>No executions yet.</td>
                    </tr>
                  ) : (
                    items.map((row) => (
                      <tr key={row.id}>
                        <td>{row.workflowName}</td>
                        <td>{row.trigger}</td>
                        <td>{row.status}</td>
                        <td>{formatWorkflowDate(row.startedAt)}</td>
                        <td>{formatWorkflowDate(row.completedAt)}</td>
                        <td>{formatDuration(row.durationMs)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
