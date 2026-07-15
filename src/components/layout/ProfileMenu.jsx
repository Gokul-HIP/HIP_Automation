"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  HiOutlineLogout,
  HiOutlineUser,
  HiOutlineCurrencyDollar,
  HiOutlineChevronRight,
  HiOutlineBadgeCheck,
} from "react-icons/hi";
import Avatar from "@/components/ui/Avatar";
import { useAuth, getUserDisplayName } from "@/context/AuthContext";

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
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="flex h-11 w-11 items-center justify-center rounded-full ring-2 ring-indigo-200 transition-shadow hover:ring-indigo-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
        aria-label="Profile menu"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((prev) => !prev)}
      >
        <Avatar name={displayName} size="sm" status="online" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute end-0 z-50 mt-3 w-[300px] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl"
        >
          {/* Header */}
          <div className="border-b border-gray-100 px-4 py-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex rounded-full ring-2 ring-indigo-200">
                <Avatar name={displayName} size="md" status="online" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-bold text-gray-900">
                    {displayName}
                  </p>
                  {/* <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-600">
                    <HiOutlineBadgeCheck className="text-[11px]" aria-hidden="true" />
                    Pro
                  </span> */}
                </div>
                <p className="truncate text-xs text-gray-400">{email}</p>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="p-2">
            <Link
              href="/settings"
              role="menuitem"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <HiOutlineUser aria-hidden="true" />
              </span>
              <span className="flex-1">Profile</span>
              <HiOutlineChevronRight className="text-gray-300" aria-hidden="true" />
            </Link>

            <Link
              href="/settings"
              role="menuitem"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <HiOutlineCurrencyDollar aria-hidden="true" />
              </span>
              <span className="flex-1">Subscription</span>
              <HiOutlineChevronRight className="text-gray-300" aria-hidden="true" />
            </Link>
          </div>

          {/* Logout */}
          <div className="border-t border-gray-100 p-2">
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
                <HiOutlineLogout aria-hidden="true" />
              </span>
              <span>{loggingOut ? "Signing out…" : "Logout"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}