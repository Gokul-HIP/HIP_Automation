import styles from "./Badge.module.css";

const TONES = {
  default: styles.default,
  primary: styles.primary,
  success: styles.success,
  danger: styles.danger,
  warning: styles.warning,
  info: styles.info,
};

export default function Badge({
  children,
  tone = "default",
  soft = true,
  className = "",
}) {
  const classes = [
    styles.badge,
    soft ? styles.soft : styles.solid,
    TONES[tone] || TONES.default,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <span className={classes}>{children}</span>;
}
