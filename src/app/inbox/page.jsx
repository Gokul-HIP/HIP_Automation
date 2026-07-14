"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlineFilter,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineAnnotation,
} from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ConversationChat from "@/components/inbox/ConversationChat";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import styles from "./inbox.module.css";

const ORIGINS = ["All Origins", "WhatsApp", "Email", "Live Chat", "SMS"];
const AGENTS = ["All Agents", "Alex Morgan", "Sam Rivera", "Unassigned"];

const CONVERSATIONS = [
  {
    id: 1,
    name: "Sara Chen",
    phone: "+1 (415) 882-1044",
    preview: "Can we reschedule the onboarding call?",
    time: "2m",
    unread: 2,
    platform: "whatsapp",
    origin: "WhatsApp",
    agent: "Alex Morgan",
    tags: ["Lead", "Priority"],
  },
  {
    id: 2,
    name: "Marcus Lee",
    phone: "+1 (646) 291-7730",
    preview: "Invoice #4821 has been paid. Thanks!",
    time: "18m",
    unread: 1,
    platform: "email",
    origin: "Email",
    agent: "Sam Rivera",
    tags: ["Billing"],
  },
  {
    id: 3,
    name: "Priya Nair",
    phone: "+91 98765 43210",
    preview: "The automation rule fired twice — can you check?",
    time: "1h",
    unread: 0,
    platform: "chat",
    origin: "Live Chat",
    agent: "Alex Morgan",
    tags: ["Support"],
  },
  {
    id: 4,
    name: "Jordan Blake",
    phone: "+1 (312) 554-0198",
    preview: "Shared a new lead list for Q3.",
    time: "3h",
    unread: 0,
    platform: "sms",
    origin: "SMS",
    agent: "Unassigned",
    tags: ["Sales", "Q3"],
  },
  {
    id: 5,
    name: "Amelia Torres",
    phone: "+34 611 204 883",
    preview: "Please send the product demo deck.",
    time: "5h",
    unread: 3,
    platform: "email",
    origin: "Email",
    agent: "Sam Rivera",
    tags: ["Demo"],
  },
  {
    id: 6,
    name: "Kenji Sato",
    phone: "+81 90-1234-5678",
    preview: "We are ready to move to production.",
    time: "1d",
    unread: 0,
    platform: "whatsapp",
    origin: "WhatsApp",
    agent: "Alex Morgan",
    tags: ["Enterprise"],
  },
];

const MESSAGES_BY_ID = {
  1: [
    { id: 1, from: "them", text: "Hi! Hope you’re doing well.", time: "09:58" },
    {
      id: 2,
      from: "them",
      text: "Can we reschedule the onboarding call?",
      time: "10:01",
    },
    {
      id: 3,
      from: "me",
      text: "Absolutely — what times work for you this week?",
      time: "10:04",
    },
    {
      id: 4,
      from: "them",
      text: "Thursday afternoon would be perfect.",
      time: "10:06",
      attachments: [{ id: "a1", name: "availability.pdf", size: "128 KB" }],
    },
  ],
  2: [
    {
      id: 1,
      from: "them",
      text: "Invoice #4821 has been paid. Thanks!",
      time: "09:12",
    },
    {
      id: 2,
      from: "me",
      text: "Payment received — receipt is on the way.",
      time: "09:20",
    },
  ],
  3: [
    {
      id: 1,
      from: "them",
      text: "The automation rule fired twice — can you check?",
      time: "08:40",
    },
    {
      id: 2,
      from: "me",
      text: "Looking into it now. I’ll update you shortly.",
      time: "08:45",
    },
  ],
  4: [
    {
      id: 1,
      from: "them",
      text: "Shared a new lead list for Q3.",
      time: "Yesterday",
    },
  ],
  5: [
    {
      id: 1,
      from: "them",
      text: "Please send the product demo deck.",
      time: "Yesterday",
    },
    {
      id: 2,
      from: "me",
      text: "Sending the latest deck with pricing included.",
      time: "Yesterday",
      attachments: [{ id: "a2", name: "HIP-Demo-Q3.pptx", size: "4.2 MB" }],
    },
  ],
  6: [
    {
      id: 1,
      from: "them",
      text: "We are ready to move to production.",
      time: "Mon",
    },
    {
      id: 2,
      from: "me",
      text: "Great — I’ll share the cutover checklist today.",
      time: "Mon",
    },
  ],
};

const FILTERS = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "read", label: "Read" },
];

const PLATFORM = {
  whatsapp: { label: "WhatsApp", icon: FaWhatsapp, tone: "success" },
  email: { label: "Email", icon: HiOutlineMail, tone: "primary" },
  chat: { label: "Live Chat", icon: HiOutlineAnnotation, tone: "info" },
  sms: { label: "SMS", icon: HiOutlinePhone, tone: "warning" },
};

const listSpring = { type: "spring", stiffness: 420, damping: 32, mass: 0.7 };
const FILTER_POPUP_WIDTH = 320;
const FILTER_POPUP_GAP = 8;

const popupMotionBottom = {
  initial: { opacity: 0, y: -10, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -8, scale: 0.96 },
  transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
};
const popupMotionTop = {
  initial: { opacity: 0, y: 10, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 8, scale: 0.96 },
  transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
};
const sheetMotion = {
  initial: { opacity: 0, y: 24, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 16, scale: 0.98 },
  transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
};

export default function InboxPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [draftOrigin, setDraftOrigin] = useState("All Origins");
  const [draftAgent, setDraftAgent] = useState("All Agents");
  const [appliedOrigin, setAppliedOrigin] = useState("All Origins");
  const [appliedAgent, setAppliedAgent] = useState("All Agents");
  const [threadMessages, setThreadMessages] = useState(MESSAGES_BY_ID);
  const [filterPlacement, setFilterPlacement] = useState("bottom");
  const [filterCoords, setFilterCoords] = useState({ top: 0, left: 0 });
  const [portalReady, setPortalReady] = useState(false);

  const filterButtonRef = useRef(null);
  const filterPopupRef = useRef(null);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  const selected = useMemo(
    () => CONVERSATIONS.find((c) => c.id === selectedId) || null,
    [selectedId]
  );

  const conversations = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CONVERSATIONS.filter((item) => {
      if (filter === "unread" && item.unread < 1) return false;
      if (filter === "read" && item.unread > 0) return false;
      if (appliedOrigin !== "All Origins" && item.origin !== appliedOrigin) {
        return false;
      }
      if (appliedAgent !== "All Agents" && item.agent !== appliedAgent) {
        return false;
      }
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.phone.toLowerCase().includes(q) ||
        item.preview.toLowerCase().includes(q) ||
        item.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    });
  }, [query, filter, appliedOrigin, appliedAgent]);

  const messages = selectedId ? threadMessages[selectedId] || [] : [];

  const updateFilterPosition = () => {
    const button = filterButtonRef.current;
    if (!button) return;

    if (window.matchMedia("(max-width: 640px)").matches) {
      setFilterPlacement("sheet");
      return;
    }

    const rect = button.getBoundingClientRect();
    const popupHeight = filterPopupRef.current?.offsetHeight || 280;
    const spaceBelow = window.innerHeight - rect.bottom - FILTER_POPUP_GAP;
    const spaceAbove = rect.top - FILTER_POPUP_GAP;

    let placement = "bottom";
    let top = rect.bottom + FILTER_POPUP_GAP;

    if (spaceBelow < popupHeight && spaceAbove > spaceBelow) {
      placement = "top";
      top = rect.top - FILTER_POPUP_GAP - popupHeight;
    }

    let left = rect.left;
    const maxLeft = window.innerWidth - FILTER_POPUP_WIDTH - FILTER_POPUP_GAP;
    if (left > maxLeft) left = Math.max(FILTER_POPUP_GAP, maxLeft);
    if (left < FILTER_POPUP_GAP) left = FILTER_POPUP_GAP;
    if (top < FILTER_POPUP_GAP) top = FILTER_POPUP_GAP;

    setFilterPlacement(placement);
    setFilterCoords({ top, left });

    const popup = filterPopupRef.current;
    if (popup) {
      popup.style.setProperty("--filter-popup-top", `${top}px`);
      popup.style.setProperty("--filter-popup-left", `${left}px`);
    }
  };

  useLayoutEffect(() => {
    if (!filterOpen) return undefined;
    updateFilterPosition();
    const frame = window.requestAnimationFrame(updateFilterPosition);
    window.addEventListener("resize", updateFilterPosition);
    window.addEventListener("scroll", updateFilterPosition, true);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updateFilterPosition);
      window.removeEventListener("scroll", updateFilterPosition, true);
    };
  }, [filterOpen]);

  useLayoutEffect(() => {
    const popup = filterPopupRef.current;
    if (!popup || filterPlacement === "sheet") return;
    popup.style.setProperty("--filter-popup-top", `${filterCoords.top}px`);
    popup.style.setProperty("--filter-popup-left", `${filterCoords.left}px`);
  }, [filterCoords, filterPlacement, filterOpen]);

  useEffect(() => {
    if (!filterOpen) return undefined;

    const onPointerDown = (event) => {
      const path = event.target;
      if (
        filterButtonRef.current?.contains(path) ||
        filterPopupRef.current?.contains(path)
      ) {
        return;
      }
      setFilterOpen(false);
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setFilterOpen(false);
        filterButtonRef.current?.focus();
        return;
      }

      if (event.key !== "Tab" || !filterPopupRef.current) return;

      const focusables = filterPopupRef.current.querySelectorAll(
        'select, button:not([disabled]), [href], input, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    const focusTimer = window.setTimeout(() => {
      filterPopupRef.current?.querySelector("select")?.focus();
    }, 0);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [filterOpen]);

  const closeFilterPopup = () => {
    setFilterOpen(false);
    filterButtonRef.current?.focus();
  };

  const openFilterPopup = () => {
    setDraftOrigin(appliedOrigin);
    setDraftAgent(appliedAgent);
    setFilterOpen((open) => !open);
  };

  const resetFilters = () => {
    setDraftOrigin("All Origins");
    setDraftAgent("All Agents");
  };

  const applyFilters = () => {
    setAppliedOrigin(draftOrigin);
    setAppliedAgent(draftAgent);
    closeFilterPopup();
  };

  const handleSelectConversation = (id) => {
    setSelectedId(id);
  };

  const handleSendMessage = ({ text, attachments }) => {
    if (!selectedId) return;

    setThreadMessages((prev) => ({
      ...prev,
      [selectedId]: [
        ...(prev[selectedId] || []),
        {
          id: Date.now(),
          from: "me",
          text,
          time: "Now",
          attachments,
        },
      ],
    }));
  };

  const platform = selected ? PLATFORM[selected.platform] : null;

  return (
    <DashboardLayout>
      <div className={styles.shell}>
        <aside className={styles.panel} aria-label="Conversations">
          <header className={styles.panelHeader}>
            <div>
              <h1 className={styles.panelTitle}>Inbox</h1>
              <p className={styles.panelMeta}>
                {CONVERSATIONS.filter((c) => c.unread > 0).length} unread
              </p>
            </div>
            <div className={styles.headerActions}>
              <div className={styles.filterAnchor}>
                <Button
                  ref={filterButtonRef}
                  variant="ghost"
                  size="sm"
                  icon={HiOutlineFilter}
                  aria-label="Open conversation filters"
                  aria-expanded={filterOpen}
                  aria-haspopup="dialog"
                  aria-controls="inbox-filter-popup"
                  onClick={openFilterPopup}
                  data-active={
                    appliedOrigin !== "All Origins" ||
                    appliedAgent !== "All Agents"
                      ? "true"
                      : "false"
                  }
                />
              </div>

              {portalReady &&
                createPortal(
                  <AnimatePresence>
                    {filterOpen && filterPlacement === "sheet" && (
                      <motion.div
                        key="filter-backdrop"
                        className={styles.filterBackdrop}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={closeFilterPopup}
                        aria-hidden="true"
                      />
                    )}

                    {filterOpen && (
                      <motion.div
                        key="filter-popup"
                        ref={filterPopupRef}
                        id="inbox-filter-popup"
                        className={styles.filterPopup}
                        data-placement={filterPlacement}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="inbox-filter-title"
                        {...(filterPlacement === "sheet"
                          ? sheetMotion
                          : filterPlacement === "top"
                            ? popupMotionTop
                            : popupMotionBottom)}
                      >
                        <div className={styles.filterPopupHeader}>
                          <h2
                            id="inbox-filter-title"
                            className={styles.filterPopupTitle}
                          >
                            Filters
                          </h2>
                          <p className={styles.filterPopupHint}>
                            Narrow conversations by origin and agent.
                          </p>
                        </div>

                        <div className={styles.filterField}>
                          <label
                            className={styles.filterFieldLabel}
                            htmlFor="inbox-origin"
                          >
                            Origin
                          </label>
                          <select
                            id="inbox-origin"
                            className={styles.filterSelect}
                            value={draftOrigin}
                            onChange={(e) => setDraftOrigin(e.target.value)}
                            aria-label="Filter by origin"
                          >
                            {ORIGINS.map((origin) => (
                              <option key={origin} value={origin}>
                                {origin}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className={styles.filterField}>
                          <label
                            className={styles.filterFieldLabel}
                            htmlFor="inbox-agent"
                          >
                            Agent
                          </label>
                          <select
                            id="inbox-agent"
                            className={styles.filterSelect}
                            value={draftAgent}
                            onChange={(e) => setDraftAgent(e.target.value)}
                            aria-label="Filter by agent"
                          >
                            {AGENTS.map((agent) => (
                              <option key={agent} value={agent}>
                                {agent}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className={styles.filterPopupActions}>
                          <Button
                            variant="secondary"
                            size="md"
                            className={styles.filterActionBtn}
                            onClick={resetFilters}
                          >
                            Reset
                          </Button>
                          <Button
                            size="md"
                            className={styles.filterActionBtn}
                            onClick={applyFilters}
                          >
                            Apply
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>,
                  document.body
                )}

              <Button size="sm" icon={HiOutlinePlus}>
                Compose
              </Button>
            </div>
          </header>

          <div className={styles.searchWrap}>
            <HiOutlineSearch className={styles.searchIcon} aria-hidden="true" />
            <input
              type="search"
              className={styles.search}
              placeholder="Search conversations…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search conversations"
            />
          </div>

          <div className={styles.filters} role="tablist" aria-label="Status filters">
            {FILTERS.map((item) => {
              const active = filter === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={styles.filterPill}
                  data-active={active ? "true" : "false"}
                  onClick={() => setFilter(item.id)}
                >
                  {active && (
                    <motion.span
                      layoutId="inbox-filter-pill"
                      className={styles.filterActive}
                      transition={listSpring}
                    />
                  )}
                  <span className={styles.filterLabel}>{item.label}</span>
                </button>
              );
            })}
          </div>

          <ul className={styles.list}>
            <AnimatePresence initial={false} mode="popLayout">
              {conversations.map((item) => {
                const itemPlatform = PLATFORM[item.platform];
                const PlatformIcon = itemPlatform.icon;
                const active = selectedId === item.id;

                return (
                  <motion.li
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={listSpring}
                  >
                    <button
                      type="button"
                      className={styles.item}
                      data-active={active ? "true" : "false"}
                      data-unread={item.unread > 0 ? "true" : "false"}
                      onClick={() => handleSelectConversation(item.id)}
                    >
                      <Avatar
                        name={item.name}
                        size="sm"
                        status={item.unread > 0 ? "online" : undefined}
                      />

                      <div className={styles.itemBody}>
                        <div className={styles.itemTop}>
                          <span className={styles.itemName}>{item.name}</span>
                          <time className={styles.itemTime}>{item.time}</time>
                        </div>
                        <p className={styles.itemPhone}>{item.phone}</p>
                        <p className={styles.itemPreview}>{item.preview}</p>
                        <div className={styles.itemFooter}>
                          <span
                            className={styles.platform}
                            data-tone={itemPlatform.tone}
                          >
                            <PlatformIcon aria-hidden="true" />
                            {itemPlatform.label}
                          </span>
                          <div className={styles.tags}>
                            {item.tags.map((tag) => (
                              <Badge key={tag} tone="default">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          {item.unread > 0 && (
                            <motion.span
                              className={styles.unread}
                              initial={{ scale: 0.8 }}
                              animate={{ scale: 1 }}
                              transition={listSpring}
                            >
                              {item.unread}
                            </motion.span>
                          )}
                        </div>
                      </div>
                    </button>
                  </motion.li>
                );
              })}
            </AnimatePresence>

            {conversations.length === 0 && (
              <li className={styles.emptyList}>No conversations match your filters.</li>
            )}
          </ul>
        </aside>

        <ConversationChat
          conversation={selected}
          platform={platform}
          messages={messages}
          onSendMessage={handleSendMessage}
        />
      </div>
    </DashboardLayout>
  );
}
