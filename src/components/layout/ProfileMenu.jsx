"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  HiOutlineLogout,
  HiOutlineUser,
  HiOutlineCurrencyDollar,
  HiOutlineChevronRight,
} from "react-icons/hi";
import Avatar from "@/components/ui/Avatar";
import { useAuth, getUserDisplayName } from "@/context/AuthContext";
import styles from "./ProfileMenu.module.css";

export default function ProfileMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const rootRef = useRef(null);

  const displayName = getUserDisplayName(user);
  const email = user?.email || "";

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className={styles.root}>
      <button
        type="button"
        className={styles.trigger}
        aria-label="Profile menu"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((prev) => !prev)}
      >
        <Avatar
          name={displayName}
          size="sm"
          status="online"
          className={styles.triggerAvatar}
        />
      </button>

      {open && (
        <div role="menu" className={styles.menu}>
          <div className={styles.header}>
            <div className={styles.headerInner}>
              <Avatar
                name={displayName}
                size="md"
                status="online"
                className={styles.headerAvatar}
              />
              <div className={styles.headerMeta}>
                <p className={styles.name}>{displayName}</p>
                {email ? <p className={styles.email}>{email}</p> : null}
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <Link
              href="/settings"
              role="menuitem"
              className={styles.item}
              onClick={() => setOpen(false)}
            >
              <span className={`${styles.iconWrap} ${styles.iconWrapProfile}`}>
                <HiOutlineUser aria-hidden="true" />
              </span>
              <span className={styles.itemLabel}>Profile</span>
              <HiOutlineChevronRight
                className={styles.itemChevron}
                aria-hidden="true"
              />
            </Link>

            <Link
              href="/settings"
              role="menuitem"
              className={styles.item}
              onClick={() => setOpen(false)}
            >
              <span className={`${styles.iconWrap} ${styles.iconWrapBilling}`}>
                <HiOutlineCurrencyDollar aria-hidden="true" />
              </span>
              <span className={styles.itemLabel}>Subscription</span>
              <HiOutlineChevronRight
                className={styles.itemChevron}
                aria-hidden="true"
              />
            </Link>
          </div>

          <div className={styles.footer}>
            <button
              type="button"
              role="menuitem"
              className={`${styles.item} ${styles.logout}`}
              onClick={handleLogout}
              disabled={loggingOut}
            >
              <span className={`${styles.iconWrap} ${styles.iconWrapLogout}`}>
                <HiOutlineLogout aria-hidden="true" />
              </span>
              <span className={styles.itemLabel}>
                {loggingOut ? "Signing out…" : "Logout"}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
