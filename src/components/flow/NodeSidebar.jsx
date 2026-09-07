"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  HiOutlineSearch,
  HiOutlineX,
  HiOutlineChevronDown,
  HiOutlineLightningBolt,
} from "react-icons/hi";
import { getSidebarCatalogGroups } from "./config/workflowNodes";
import { useTriggers } from "@/hooks/useWorkflowApi";
import NodeCard from "./NodeCard";
import cardStyles from "./styles/nodeCard.module.css";
import styles from "./styles/flow.module.css";

function TriggerApiCard({ trigger, onAdd }) {
  return (
    <motion.button
      type="button"
      className={cardStyles.card}
      data-tone="success"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onAdd?.(trigger)}
    >
      <span className={cardStyles.iconWrap} aria-hidden="true">
        <HiOutlineLightningBolt />
      </span>
      <span className={cardStyles.meta}>
        <span className={cardStyles.title}>{trigger.name}</span>
        <span className={cardStyles.description}>{trigger.description}</span>
        <span className={cardStyles.category}>{trigger.group}</span>
      </span>
    </motion.button>
  );
}

export default function NodeSidebar({ open, onClose, onAddNode, onAddTrigger }) {
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState({});
  const { data: triggerCatalog, isLoading: triggersLoading, isError: triggersError } =
    useTriggers();

  const grouped = useMemo(
    () =>
      getSidebarCatalogGroups({
        search: query,
        apiTriggerCatalog: triggerCatalog ?? null,
      }),
    [query, triggerCatalog]
  );

  const catalogCount = useMemo(
    () =>
      grouped.reduce(
        (sum, group) => sum + group.nodes.length + group.triggers.length,
        0
      ),
    [grouped]
  );

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
            {triggersLoading && catalogCount === 0 ? (
              <p className={styles.emptyHint}>Loading node catalog…</p>
            ) : null}

            {triggersError && catalogCount === 0 ? (
              <p className={styles.emptyHint}>
                Unable to load API triggers. Showing local catalog only.
              </p>
            ) : null}

            {grouped.length === 0 ? (
              <p className={styles.emptyHint}>No nodes match your search.</p>
            ) : (
              grouped.map(({ category, nodes, triggers }) => {
                const isCollapsed = Boolean(collapsed[category.id]);
                const count = nodes.length + triggers.length;
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
                          {count} node{count === 1 ? "" : "s"}
                        </span>
                      </span>
                      <HiOutlineChevronDown
                        className={styles.categoryChevron}
                        data-collapsed={isCollapsed ? "true" : "false"}
                      />
                    </button>

                    {!isCollapsed ? (
                      <div className={styles.cardList}>
                        {triggers.map((trigger) => (
                          <TriggerApiCard
                            key={trigger.key}
                            trigger={trigger}
                            onAdd={onAddTrigger}
                          />
                        ))}
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
