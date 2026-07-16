"use client";

import styles from "./Workflows.module.css";

export default function LoadingSkeleton({ rows = 5 }) {
  return Array.from({ length: rows }).map((_, index) => (
    <tr key={`skeleton-${index}`} aria-hidden="true">
      <td>
        <div className={`${styles.skeletonBlock} ${styles.skeletonBlockWide}`} />
        <div className={styles.skeletonBlockSm} />
      </td>
      <td>
        <div className={styles.skeletonBadge} />
      </td>
      <td>
        <div
          className={`${styles.skeletonBlock} ${styles.skeletonBlockNarrow}`}
        />
      </td>
      <td>
        <div className={`${styles.skeletonBlock} ${styles.skeletonBlockMd}`} />
      </td>
      <td>
        <div className={`${styles.skeletonBlock} ${styles.skeletonBlockMd}`} />
      </td>
      <td className={styles.actionsCell}>
        <div className={styles.actions}>
          <div className={styles.skeletonIcon} />
          <div className={styles.skeletonIcon} />
          <div className={styles.skeletonIcon} />
        </div>
      </td>
    </tr>
  ));
}
