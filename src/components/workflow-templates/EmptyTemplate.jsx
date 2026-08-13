"use client";

import { HiOutlineTemplate } from "react-icons/hi";
import styles from "@/components/workflow/Workflows.module.css";

export default function EmptyTemplate() {
  return (
    <div className={styles.stateCard}>
      <div className={styles.stateIcon}>
        <HiOutlineTemplate aria-hidden="true" />
      </div>
      <h2 className={styles.stateTitle}>No workflow templates yet</h2>
      <p className={styles.stateText}>
        Templates are managed only from the Backend Admin (Automation → Workflow
        Templates). Frontend users can only use active templates when creating a
        workflow.
      </p>
    </div>
  );
}
