"use client";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useUI } from "@/context/UIContext";
import styles from "./DashboardLayout.module.css";

export default function DashboardLayout({ children }) {
  const { sidebarCollapsed } = useUI();

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
    </div>
  );
}
