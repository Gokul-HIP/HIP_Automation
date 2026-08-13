"use client";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useUI } from "@/context/UIContext";
import { useThemeMotion } from "@/components/theme/ThemeProvider";
import styles from "./settings.module.css";

export default function SettingsView() {
  const { locale, setLocale, sidebarCollapsed, setSidebarCollapsed } = useUI();
  const { theme, setThemeWithMotion, isAnimating } = useThemeMotion();

  return (
    <div className="pageShell">
      <header>
        <h1 className="pageTitle">Settings</h1>
        <p className="pageSubtitle">
          Theme colors morph via CSS variables — the dashboard never disappears.
        </p>
      </header>

      <div className={styles.grid}>
        <Card title="Appearance" subtitle="Circular clip-path reveal — dashboard stays visible">
          <div className={styles.row}>
            <Button
              variant={theme === "dark" ? "primary" : "secondary"}
              onClick={(e) =>
                setThemeWithMotion("dark", {
                  x: e.clientX,
                  y: e.clientY,
                })
              }
              disabled={isAnimating}
            >
              Dark
            </Button>
            <Button
              variant={theme === "light" ? "primary" : "secondary"}
              onClick={(e) =>
                setThemeWithMotion("light", {
                  x: e.clientX,
                  y: e.clientY,
                })
              }
              disabled={isAnimating}
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
