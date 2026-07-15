"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  HiOutlineSearch,
  HiOutlineX,
  HiOutlineChevronDown,
} from "react-icons/hi";
import { WORKFLOW_CATEGORIES } from "./config/workflowCategories";
import { WORKFLOW_NODES } from "./config/workflowNodes";
import NodeCard from "./NodeCard";
import styles from "./styles/flow.module.css";

export default function NodeSidebar({ open, onClose, onAddNode }) {
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState({});

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    return WORKFLOW_CATEGORIES.map((category) => {
      const nodes = WORKFLOW_NODES.filter((node) => {
        if (node.category !== category.id) return false;
        if (!q) return true;
        return (
          node.title.toLowerCase().includes(q) ||
          node.description.toLowerCase().includes(q)
        );
      });
      return { category, nodes };
    }).filter((group) => group.nodes.length > 0);
  }, [query]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.aside
          className={styles.panel}
          initial={{ x: 36, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 40, opacity: 0 }}
          transition={{ type: "spring", stiffness: 360, damping: 34 }}
          aria-label="Node catalog"
        >
          <div className={styles.panelHeader}>
            <div>
              <h2 className={styles.panelTitle}>Workflow nodes</h2>
              <p className={styles.panelSubtitle}>
                Click a card to add it to the canvas.
              </p>
            </div>
            <button
              type="button"
              className={styles.iconBtn}
              onClick={onClose}
              aria-label="Collapse node menu"
            >
              <HiOutlineX />
            </button>
          </div>

          <div className={styles.searchWrap}>
            <HiOutlineSearch className={styles.searchIcon} aria-hidden="true" />
            <input
              className={styles.searchInput}
              type="search"
              placeholder="Search nodes…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search nodes"
            />
          </div>

          <div className={styles.panelBody}>
            {grouped.length === 0 ? (
              <p className={styles.emptyHint}>No nodes match your search.</p>
            ) : (
              grouped.map(({ category, nodes }) => {
                const isCollapsed = Boolean(collapsed[category.id]);
                return (
                  <div key={category.id} className={styles.categoryBlock}>
                    <button
                      type="button"
                      className={styles.categoryHeader}
                      onClick={() =>
                        setCollapsed((prev) => ({
                          ...prev,
                          [category.id]: !prev[category.id],
                        }))
                      }
                    >
                      <span>
                        <span className={styles.categoryTitle}>
                          {category.label}
                        </span>
                        <span className={styles.categoryMeta}>
                          {nodes.length} node{nodes.length === 1 ? "" : "s"}
                        </span>
                      </span>
                      <HiOutlineChevronDown
                        className={styles.categoryChevron}
                        data-collapsed={isCollapsed ? "true" : "false"}
                      />
                    </button>

                    {!isCollapsed ? (
                      <div className={styles.cardList}>
                        {nodes.map((item) => (
                          <NodeCard
                            key={item.type}
                            item={item}
                            onAdd={onAddNode}
                          />
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
