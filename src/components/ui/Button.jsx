import styles from "./Button.module.css";

const VARIANTS = {
  primary: styles.primary,
  secondary: styles.secondary,
  ghost: styles.ghost,
  danger: styles.danger,
};

const SIZES = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  icon: Icon,
  iconPosition = "start",
  className = "",
  type = "button",
  ...props
}) {
  const classes = [
    styles.button,
    VARIANTS[variant] || VARIANTS.primary,
    SIZES[size] || SIZES.md,
    fullWidth ? styles.fullWidth : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={classes} {...props}>
      {Icon && iconPosition === "start" && (
        <Icon className={styles.icon} aria-hidden="true" />
      )}
      {children && <span>{children}</span>}
      {Icon && iconPosition === "end" && (
        <Icon className={styles.icon} aria-hidden="true" />
      )}
    </button>
  );
}
