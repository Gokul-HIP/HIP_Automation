"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HiOutlineBell,
  HiOutlineCog,
  HiOutlineMenu,
  HiOutlineChevronDown,
} from "react-icons/hi";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { useUI } from "@/context/UIContext";
import styles from "./Header.module.css";

const LABEL_MAP = {
  dashboard: "Dashboard",
  inbox: "Inbox",
  automation: "Automation",
  chatbot: "Chatbot",
  settings: "Settings",
};

const LOCALES = [
  { code: "en", label: "English" },
  { code: "ar", label: "العربية" },
];

export default function Header() {
  const pathname = usePathname();
  const { locale, setLocale, openMobileSidebar } = useUI();

  const segments = pathname.split("/").filter(Boolean);
  const crumbs = segments.length
    ? segments.map((seg, i) => ({
        label: LABEL_MAP[seg] || seg,
        href: "/" + segments.slice(0, i + 1).join("/"),
      }))
    : [{ label: "Home", href: "/" }];

  return (
    <header className={`${styles.header} headerSticky`} data-theme-motion="header">
      <div className={styles.start}>
        <button
          type="button"
          className={styles.menuBtn}
          onClick={openMobileSidebar}
          aria-label="Open sidebar"
        >
          <HiOutlineMenu />
        </button>

        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/" className={styles.crumbHome}>
            Home
          </Link>
          {crumbs.map((crumb) => (
            <span key={crumb.href} className={styles.crumbItem}>
              <span className={styles.sep} aria-hidden="true">
                /
              </span>
              <Link href={crumb.href} className={styles.crumbLink}>
                {crumb.label}
              </Link>
            </span>
          ))}
        </nav>
      </div>

      <div className={styles.end}>
        <div className={styles.locale}>
          <select
            className={styles.localeSelect}
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            aria-label="Language"
          >
            {LOCALES.map((item) => (
              <option key={item.code} value={item.code}>
                {item.label}
              </option>
            ))}
          </select>
          <HiOutlineChevronDown className={styles.localeIcon} aria-hidden="true" />
        </div>

        <ThemeToggle className={styles.themeToggleSlot} />

        <button type="button" className={styles.iconBtn} aria-label="Notifications">
          <HiOutlineBell />
          <span className={styles.dot} />
        </button>

        <Link href="/settings" className={styles.iconBtn} aria-label="Settings">
          <HiOutlineCog />
        </Link>

        <button type="button" className={styles.profile} aria-label="Profile menu">
          <Avatar name="Alex Morgan" size="sm" status="online" />
          <span className={styles.profileMeta}>
            <span className={styles.profileName}>Alex Morgan</span>
            <Badge tone="primary">Admin</Badge>
          </span>
        </button>
      </div>
    </header>
  );
}
