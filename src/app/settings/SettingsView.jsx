"use client";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useUI } from "@/context/UIContext";
import styles from "./settings.module.css";

export default function SettingsView() {
  const {
    theme,
    setTheme,
    locale,
    setLocale,
    sidebarCollapsed,
    setSidebarCollapsed,
  } = useUI();

  return (
    <div className="pageShell">
      <header>
        <h1 className="pageTitle">Settings</h1>
        <p className="pageSubtitle">
          Theme, language, and layout preferences — all driven by CSS variables.
        </p>
      </header>

      <div className={styles.grid}>
        <Card title="Appearance" subtitle="Switch themes without changing components">
          <div className={styles.row}>
            <Button
              variant={theme === "dark" ? "primary" : "secondary"}
              onClick={() => setTheme("dark")}
            >
              Dark
            </Button>
            <Button
              variant={theme === "light" ? "primary" : "secondary"}
              onClick={() => setTheme("light")}
            >
              Light
            </Button>
          </div>
        </Card>

        <Card
          title="Language & Direction"
          subtitle="Arabic enables RTL via dir attribute"
        >
          <div className={styles.row}>
            <Button
              variant={locale === "en" ? "primary" : "secondary"}
              onClick={() => setLocale("en")}
            >
              English (LTR)
            </Button>
            <Button
              variant={locale === "ar" ? "primary" : "secondary"}
              onClick={() => setLocale("ar")}
            >
              العربية (RTL)
            </Button>
          </div>
        </Card>

        <Card title="Sidebar" subtitle="Desktop collapse preference">
          <div className={styles.row}>
            <Button
              variant={!sidebarCollapsed ? "primary" : "secondary"}
              onClick={() => setSidebarCollapsed(false)}
            >
              Expanded
            </Button>
            <Button
              variant={sidebarCollapsed ? "primary" : "secondary"}
              onClick={() => setSidebarCollapsed(true)}
            >
              Collapsed
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
