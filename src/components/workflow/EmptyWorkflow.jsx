"use client";

import { HiOutlineCollection, HiOutlinePlus } from "react-icons/hi";
import styles from "./Workflows.module.css";

export default function EmptyWorkflow({ onCreate, disabled = false }) {
  return (
    <div className={styles.stateCard}>
      <div className={styles.stateIcon}>
        <HiOutlineCollection aria-hidden="true" />
      </div>

      <h2 className={styles.stateTitle}>No workflows found</h2>
      <p className={styles.stateText}>
        Create your first hospital automation workflow to manage reminders,
        reports, and patient communications from one place.
      </p>

      <button
        type="button"
        onClick={onCreate}
        disabled={disabled}
        className={styles.btnPrimary}
      >
        <HiOutlinePlus aria-hidden="true" />
        Create Workflow
      </button>
    </div>
  );
}
