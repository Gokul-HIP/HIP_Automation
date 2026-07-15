import { HiOutlineArrowRight, HiOutlineSparkles } from "react-icons/hi";
import Button from "@/components/ui/Button";
import { getServerDisplayName, getTimeGreeting } from "@/lib/serverAuth";
import styles from "./Dashboard.module.css";

export default async function WelcomeCard({
  name,
  message = "Here’s what’s happening across your pipeline today.",
}) {
  const greeting = getTimeGreeting();
  const displayName = name ?? (await getServerDisplayName());

  return (
    <section
      className={`${styles.welcomeCard} themeMotionCard`}
      data-theme-motion="card"
    >
      <div className={styles.welcomeContent}>
        <span className={styles.welcomeEyebrow}>
          <HiOutlineSparkles aria-hidden="true" />
          {greeting}
        </span>
        <h1 className={styles.welcomeTitle}>Welcome back, {displayName}</h1>
        <p className={styles.welcomeMessage}>{message}</p>
        <div className={styles.welcomeActions}>
          <Button icon={HiOutlineArrowRight} iconPosition="end">
            View reports
          </Button>
          <Button variant="secondary">Create campaign</Button>
        </div>
      </div>

      <div className={styles.welcomeVisual} aria-hidden="true">
        <svg
          className={styles.networkSvg}
          viewBox="0 0 320 260"
          role="img"
        >
          <defs>
            <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--primary-light)" />
              <stop
                offset="100%"
                stopColor="var(--primary-color)"
                stopOpacity="0"
              />
            </radialGradient>
          </defs>

          <g className={styles.orbitGroup}>
            <circle className={styles.orbitRing} cx="160" cy="130" r="88" />
            <circle className={styles.orbitRing} cx="160" cy="130" r="58" />
          </g>

          <path className={styles.linkLine} d="M160,130 L242,86" />
          <path className={styles.linkLine} d="M160,130 L232,178" />
          <path className={styles.linkLine} d="M160,130 L96,64" />
          <path className={styles.linkLine} d="M160,130 L78,190" />
          <path className={styles.linkLine} d="M160,130 L160,42" />

          <circle
            className={styles.haloNode}
            cx="160"
            cy="130"
            r="46"
            fill="url(#nodeGlow)"
          />
          <circle className={styles.coreNode} cx="160" cy="130" r="22" />

          {[
            [242, 86],
            [232, 178],
            [96, 64],
            [78, 190],
            [160, 42],
          ].map(([cx, cy], i) => (
            <circle
              key={i}
              className={styles.satelliteNode}
              cx={cx}
              cy={cy}
              r="7"
            />
          ))}
        </svg>

        <div className={styles.welcomePanel}>
          <span className={styles.welcomePanelLabel}>Pipeline health</span>
          <strong className={styles.welcomePanelValue}>94%</strong>
          <span className={styles.welcomePanelHint}>+4.2% vs last week</span>
        </div>
      </div>
    </section>
  );
}
