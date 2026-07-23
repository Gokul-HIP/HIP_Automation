"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  HiOutlineX,
} from "react-icons/hi";
import Logo from "@/components/common/Logo";
import { useUI } from "@/context/UIContext";
import styles from "./Sidebar.module.css";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: HiOutlineHome },
  { href: "/inbox", label: "Inbox", icon: HiOutlineInbox, badge: 12 },
  { href: "/workflows", label: "Automation", icon: HiOutlineLightningBolt },
  { href: "/chatbot", label: "Chatbot", icon: HiOutlineChatAlt2 },
  { href: "/settings", label: "Settings", icon: HiOutlineCog },
];

export default function Sidebar() {
  const pathname = usePathname();
  const {
    logo,
    sidebarCollapsed,
    toggleSidebar,
    mobileSidebarOpen,
    closeMobileSidebar,
  } = useUI();

  const collapsed = sidebarCollapsed;

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
              {NAV_ITEMS.map(({ href, label, icon: Icon, badge }) => {
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
