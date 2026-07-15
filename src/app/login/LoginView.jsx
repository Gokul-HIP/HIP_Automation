"use client";

import { useState } from "react";
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineArrowRight,
  HiOutlineSparkles,
} from "react-icons/hi";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { useUI } from "@/context/UIContext";
import styles from "./login.module.css";

export default function LoginView() {
  const { logo } = useUI();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    // Login API will be wired here later
  };

  return (
    <div className={styles.page}>
      <div className={styles.themeToggleWrap}>
        <ThemeToggle />
      </div>

      <section className={styles.formPanel}>
        <div className={styles.formWrap}>
          <div className={styles.brandRow}>
            <div className={styles.brandMark}>
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logo}
                  alt="HealthinPocket"
                  className={styles.brandMarkImg}
                />
              ) : (
                <span className={styles.brandMarkFallback} aria-label="HealthinPocket">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    width="32"
                    height="32"
                    aria-hidden="true"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
              )}
            </div>
          </div>

          <h1 className={styles.heading}>Welcome back</h1>
          <p className={styles.subheading}>
            Sign in to keep an eye on today&apos;s pipeline, conversations, and
            reports.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="login-email">
                Email address
              </label>
              <div className={styles.inputWrap}>
                <HiOutlineMail className={styles.leadingIcon} aria-hidden="true" />
                <input
                  id="login-email"
                  className={styles.input}
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="alex.morgan@healthinpocket.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="login-password">
                Password
              </label>
              <div className={styles.inputWrap}>
                <HiOutlineLockClosed
                  className={styles.leadingIcon}
                  aria-hidden="true"
                />
                <input
                  id="login-password"
                  className={`${styles.input} ${styles.inputWithToggle}`}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className={styles.toggleVisibility}
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <HiOutlineEyeOff aria-hidden="true" />
                  ) : (
                    <HiOutlineEye aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <div className={styles.rowBetween}>
              <label className={styles.remember}>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Remember me
              </label>
              <button type="button" className={styles.forgot}>
                Forgot password?
              </button>
            </div>

            <button type="submit" className={styles.btnPrimary}>
              Sign in
              <HiOutlineArrowRight aria-hidden="true" />
            </button>
          </form>

          <div className={styles.divider}>OR CONTINUE WITH</div>

          {/* <button type="button" className={styles.btnOauth}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.6 5.6 0 0 1-2.4 3.68v3h3.87c2.27-2.09 3.55-5.17 3.55-8.92Z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.07 7.94-2.9l-3.87-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.11A12 12 0 0 0 12 24Z"
              />
              <path
                fill="#FBBC05"
                d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.6H1.27a12 12 0 0 0 0 10.8l4-3.11Z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.6l4 3.11C6.22 6.86 8.87 4.75 12 4.75Z"
              />
            </svg>
            Continue with Google
          </button> */}

          <p className={styles.signupLine}>
            Don&apos;t have an account?{" "}
            <button type="button" className={styles.signupLink}>
              Contact your admin
            </button>
          </p>
        </div>
      </section>

      <aside className={styles.brandPanel} aria-hidden="true">
        <span className={`${styles.decoDot} ${styles.decoDotD1}`} />
        <span className={`${styles.decoDot} ${styles.decoDotD2}`} />
        <span className={`${styles.decoDot} ${styles.decoDotD3}`} />
        <span className={`${styles.decoLine} ${styles.decoLineL1}`} />
        <span className={`${styles.decoLine} ${styles.decoLineL2}`} />

        <div className={styles.heroCopy}>
          <span className={styles.heroEyebrow}>
            <HiOutlineSparkles aria-hidden="true" />
            Good afternoon
          </span>
          <h2 className={styles.heroTitle}>
            Your whole clinic pipeline, at a glance.
          </h2>
          <p className={styles.heroSub}>
            Track contacts, conversations, and revenue in one dashboard built
            for healthcare teams.
          </p>
        </div>

        <div className={styles.vitalsCard}>
          <div className={styles.vitalsHead}>
            <span className={styles.vitalsLabel}>Pipeline Health</span>
            <span className={styles.vitalsLive}>
              <span className={styles.vitalsDot} />
              Live
            </span>
          </div>
          <svg
            className={styles.vitalsGraph}
            viewBox="0 0 340 64"
            preserveAspectRatio="none"
          >
            <path
              className={styles.vitalsLine}
              d="M0,40 L40,40 L52,40 L60,12 L70,54 L80,40 L110,40 L122,40 L130,20 L140,44 L150,40 L200,40 L212,40 L220,10 L230,54 L240,40 L270,40 L282,40 L290,24 L300,40 L340,40"
            />
          </svg>
          <div className={styles.vitalsFoot}>
            <div>
              <div className={styles.vitalsNumber}>94%</div>
              <div className={styles.vitalsCaption}>+4.2% vs last week</div>
            </div>
            <div className={styles.vitalsDelta}>↗ Stable</div>
          </div>
        </div>
      </aside>
    </div>
  );
}
