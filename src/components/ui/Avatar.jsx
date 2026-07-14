import styles from "./Avatar.module.css";

const SIZES = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
};

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function Avatar({
  name = "User",
  src,
  size = "md",
  status,
  className = "",
}) {
  const classes = [
    styles.avatar,
    SIZES[size] || SIZES.md,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} title={name}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className={styles.image} />
      ) : (
        <span className={styles.initials}>{getInitials(name)}</span>
      )}
      {status && (
        <span
          className={styles.status}
          data-status={status}
          aria-label={status}
        />
      )}
    </span>
  );
}
