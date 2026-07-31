"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { LayoutGroup, motion } from "framer-motion";
import {
  HiOutlineHome,
  HiOutlineInbox,
  HiOutlineLightningBolt,
  HiOutlineChatAlt2,
  HiOutlineCog,
  HiOutlineSearch,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineChevronDown,
  HiOutlineX,
  HiOutlineCollection,
  HiOutlineClipboardList,
  HiOutlineDocumentText,
} from "react-icons/hi";
import Logo from "@/components/common/Logo";
import { useUI } from "@/context/UIContext";
import styles from "./Sidebar.module.css";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: HiOutlineHome },
  { href: "/inbox", label: "Inbox", icon: HiOutlineInbox, badge: 12 },
  {
    id: "automation",
    label: "Automation",
    icon: HiOutlineLightningBolt,
    children: [
      {
        href: "/workflows",
        label: "Workflows",
        icon: HiOutlineCollection,
        match: (path) =>
          path === "/workflows" ||
          (path.startsWith("/workflows/") &&
            !path.startsWith("/workflows/executions")),
      },
      {
        href: "/workflows/executions",
        label: "Executions",
        icon: HiOutlineClipboardList,
        match: (path) => path.startsWith("/workflows/executions"),
      },
      {
        href: "/workflows/executions",
        label: "Logs",
        icon: HiOutlineDocumentText,
        match: (path) => path.startsWith("/workflows/executions"),
      },
    ],
  },
  { href: "/chatbot", label: "Chatbot", icon: HiOutlineChatAlt2 },
  { href: "/settings", label: "Settings", icon: HiOutlineCog },
];

function isAutomationPath(pathname) {
  return (
    pathname.startsWith("/workflows") ||
    pathname.startsWith("/admin/workflow-templates") ||
    pathname.startsWith("/automation")
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    logo,
    sidebarCollapsed,
    toggleSidebar,
    mobileSidebarOpen,
    closeMobileSidebar,
  } = useUI();

  const collapsed = sidebarCollapsed;
  const [automationOpen, setAutomationOpen] = useState(() =>
    isAutomationPath(pathname)
  );

  const automationActive = useMemo(
    () => isAutomationPath(pathname),
    [pathname]
  );

  return (
    <>
      <div
        className={styles.overlay}
        data-open={mobileSidebarOpen ? "true" : "false"}
        onClick={closeMobileSidebar}
        aria-hidden="true"
      />

      <aside
        className={styles.sidebar}
        data-collapsed={collapsed ? "true" : "false"}
        data-mobile-open={mobileSidebarOpen ? "true" : "false"}
        data-theme-motion="sidebar"
        aria-label="Main navigation"
      >
        <div className={styles.top}>
          <Logo logo={logo} collapsed={collapsed} />
          <button
            type="button"
            className={styles.mobileClose}
            onClick={closeMobileSidebar}
            aria-label="Close sidebar"
          >
            <HiOutlineX />
          </button>
        </div>

        <div className={styles.searchWrap}>
          <HiOutlineSearch className={styles.searchIcon} aria-hidden="true" />
          {!collapsed && (
            <input
              type="search"
              className={styles.search}
              placeholder="Search…"
              aria-label="Search"
            />
          )}
        </div>

        <nav className={`${styles.nav} sidebarScroll`}>
          <LayoutGroup id="sidebar-nav">
            <ul className={styles.menu}>
              {NAV_ITEMS.map((item) => {
                if (item.children) {
                  const open = collapsed ? false : automationOpen || automationActive;
                  const Icon = item.icon;

                  return (
                    <li key={item.id || item.label} className={styles.item}>
                      <button
                        type="button"
                        className={styles.link}
                        data-active={automationActive ? "true" : "false"}
                        title={collapsed ? item.label : undefined}
                        onClick={() => {
                          if (collapsed) {
                            router.push("/workflows");
                            closeMobileSidebar();
                            return;
                          }
                          setAutomationOpen((v) => !v);
                        }}
                        aria-expanded={open}
                      >
                        {automationActive && (
                          <motion.span
                            layoutId="sidebar-active-pill"
                            className={styles.activePill}
                            transition={{
                              type: "spring",
                              stiffness: 380,
                              damping: 34,
                            }}
                            aria-hidden="true"
                          />
                        )}
                        <Icon className={styles.linkIcon} aria-hidden="true" />
                        {!collapsed && (
                          <>
                            <span className={styles.linkLabel}>{item.label}</span>
                            <HiOutlineChevronDown
                              className={styles.chevron}
                              data-open={open ? "true" : "false"}
                              aria-hidden="true"
                            />
                          </>
                        )}
                      </button>

                      {!collapsed && open ? (
                        <ul className={styles.submenu}>
                          {item.children.map((child) => {
                            const ChildIcon = child.icon;
                            const active = child.match
                              ? child.match(pathname)
                              : pathname === child.href ||
                                pathname.startsWith(`${child.href}/`);

                            return (
                              <li key={`${child.label}-${child.href}`}>
                                <Link
                                  href={child.href}
                                  className={styles.sublink}
                                  data-active={active ? "true" : "false"}
                                  onClick={closeMobileSidebar}
                                >
                                  <ChildIcon
                                    className={styles.sublinkIcon}
                                    aria-hidden="true"
                                  />
                                  <span>{child.label}</span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      ) : null}
                    </li>
                  );
                }

                const { href, label, icon: Icon, badge } = item;
                const active =
                  pathname === href || pathname.startsWith(`${href}/`);

                return (
                  <li key={href} className={styles.item}>
                    <Link
                      href={href}
                      className={styles.link}
                      data-active={active ? "true" : "false"}
                      title={collapsed ? label : undefined}
                      onClick={closeMobileSidebar}
                    >
                      {active && (
                        <motion.span
                          layoutId="sidebar-active-pill"
                          className={styles.activePill}
                          transition={{
                            type: "spring",
                            stiffness: 380,
                            damping: 34,
                          }}
                          aria-hidden="true"
                        />
                      )}
                      <Icon className={styles.linkIcon} aria-hidden="true" />
                      {!collapsed && (
                        <>
                          <span className={styles.linkLabel}>{label}</span>
                          {badge != null && (
                            <span className={styles.badge}>{badge}</span>
                          )}
                        </>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </LayoutGroup>
        </nav>

        <div className={styles.footer}>
          <button
            type="button"
            className={styles.collapseBtn}
            onClick={toggleSidebar}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <HiOutlineChevronRight aria-hidden="true" />
            ) : (
              <>
                <HiOutlineChevronLeft aria-hidden="true" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
