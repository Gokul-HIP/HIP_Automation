import styles from "./Card.module.css";

export default function Card({
  children,
  title,
  subtitle,
  action,
  padding = "md",
  className = "",
  as: Tag = "section",
}) {
  const classes = [
    styles.card,
    styles[`padding${padding.charAt(0).toUpperCase()}${padding.slice(1)}`] ||
      styles.paddingMd,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag className={classes}>
      {(title || action) && (
        <header className={styles.header}>
          <div className={styles.heading}>
            {title && <h3 className={styles.title}>{title}</h3>}
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          {action && <div className={styles.action}>{action}</div>}
        </header>
      )}
      <div className={styles.body}>{children}</div>
    </Tag>
  );
}
