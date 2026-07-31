"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import ThemeReveal from "@/components/theme/ThemeReveal";
import { useUI } from "@/context/UIContext";
import { isEmbedMode } from "@/utils/embedMode";
import styles from "./DashboardLayout.module.css";

export default function DashboardLayout({ children }) {
  const { sidebarCollapsed } = useUI();
  const [embed, setEmbed] = useState(false);

  useEffect(() => {
    const inEmbed = isEmbedMode();
    setEmbed(inEmbed);
    if (inEmbed && typeof window !== "undefined" && window.parent !== window) {
      window.parent.postMessage({ type: "hip:builder-ready" }, "*");
    }
  }, []);

  if (embed) {
    return (
      <div className={styles.shell} data-embed="true" style={{ minHeight: "100vh" }}>
        <main style={{ padding: 0, height: "100vh", overflow: "hidden" }}>
          {children}
        </main>
      </div>
    );
  }

  return (
    <div
      className={`${styles.shell} dashboardShell`}
      data-sidebar-collapsed={sidebarCollapsed ? "true" : "false"}
    >
      <Sidebar />
      <div className={`${styles.main} dashboardMain`}>
        <Header />
        <main className={`${styles.content} dashboardContent`}>{children}</main>
      </div>
      <ThemeReveal />
    </div>
  );
}
