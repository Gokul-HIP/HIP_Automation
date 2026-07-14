import styles from "./Logo.module.css";

export default function Logo({ collapsed = false }) {
  return (
    <div className={styles.logo} data-collapsed={collapsed ? "true" : "false"}>
      <span className={styles.mark} aria-hidden="true">
        H
      </span>
      {!collapsed && (
        <span className={styles.text}>
          <span className={styles.brand}>HIP</span>
          <span className={styles.sub}>Automation</span>
        </span>
      )}
    </div>
  );
}
