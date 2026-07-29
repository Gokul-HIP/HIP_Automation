"use client";

import { useMemo, useState } from "react";
import { HiOutlineChevronRight } from "react-icons/hi";
import { useVariables } from "@/hooks/useWorkflowApi";
import { ensureValidPlaceholder } from "@/utils/workflowVariableTokens";
import styles from "@/components/flow/styles/propertyPanel.module.css";

const RECENT_KEY = "hip.workflow.recentVariables";
const MAX_RECENT = 8;

function VariableSkeleton() {
  return (
    <div className={styles.sectionCompact} aria-busy="true" aria-label="Loading variables">
      <h3 className={styles.sectionTitle}>Variable Picker</h3>
      <div className={styles.skeletonStack}>
        <div className={styles.skeletonLine} style={{ width: "40%" }} />
        <div className={styles.skeletonLine} style={{ width: "55%" }} />
        <div className={styles.skeletonLine} style={{ width: "48%" }} />
      </div>
    </div>
  );
}

/**
 * @param {{ label?: string, token?: string, key?: string } | string} variable
 */
function getVariableParts(variable) {
  if (typeof variable === "string") {
    return { label: variable, token: variable };
  }
  const token = String(variable?.token || "");
  const label = String(variable?.label || token);
  return { label, token };
}

function readRecent() {
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((t) => typeof t === "string") : [];
  } catch {
    return [];
  }
}

function writeRecent(token) {
  try {
    const next = [token, ...readRecent().filter((t) => t !== token)].slice(0, MAX_RECENT);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    return next;
  } catch {
    return [token];
  }
}

export default function ApiVariablePicker({ triggerKey, onInsert }) {
  const {
    data: groups = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useVariables(triggerKey);

  const [openGroups, setOpenGroups] = useState({});
  const [feedback, setFeedback] = useState("");
  const [search, setSearch] = useState("");
  const [recent, setRecent] = useState(() =>
    typeof window !== "undefined" ? readRecent() : []
  );

  const orderedGroups = useMemo(() => {
    const preferred = [
      "Patient",
      "Doctor",
      "Hospital",
      "Appointment",
      "Invoice",
      "Lab",
      "Membership",
      "Medicine",
      "System",
    ];
    const q = search.trim().toLowerCase();

    return [...groups]
      .map((group) => {
        const variables = (group.variables || []).filter((variable) => {
          if (!q) return true;
          const { label, token } = getVariableParts(variable);
          return (
            label.toLowerCase().includes(q) ||
            token.toLowerCase().includes(q)
          );
        });
        return { ...group, variables };
      })
      .filter((group) => group.variables.length > 0)
      .sort((a, b) => {
        const ai = preferred.indexOf(a.label);
        const bi = preferred.indexOf(b.label);
        if (ai === -1 && bi === -1) return a.label.localeCompare(b.label);
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
      });
  }, [groups, search]);

  const allOpen = orderedGroups.length > 0 &&
    orderedGroups.every((group) => openGroups[group.label]);

  const toggleGroup = (label) => {
    setOpenGroups((prev) => ({
      ...prev,
      [label]: !(prev[label] ?? false),
    }));
  };

  const expandAll = () => {
    const next = {};
    orderedGroups.forEach((group) => {
      next[group.label] = true;
    });
    setOpenGroups(next);
  };

  const collapseAll = () => {
    const next = {};
    orderedGroups.forEach((group) => {
      next[group.label] = false;
    });
    setOpenGroups(next);
  };

  const handleInsert = (token, label) => {
    const safeToken = ensureValidPlaceholder(token);
    if (!safeToken) return;
    onInsert?.(safeToken);
    setRecent(writeRecent(safeToken));
    setFeedback(`Inserted ${label || safeToken}`);
    window.setTimeout(() => setFeedback(""), 1600);
  };

  const handleCopy = async (token, label) => {
    const safeToken = ensureValidPlaceholder(token);
    if (!safeToken) return;
    try {
      await navigator.clipboard.writeText(safeToken);
      setFeedback(`Copied ${label || safeToken}`);
      window.setTimeout(() => setFeedback(""), 1600);
    } catch {
      setFeedback("Unable to copy");
      window.setTimeout(() => setFeedback(""), 1600);
    }
  };

  if (!triggerKey) {
    return (
      <div className={styles.sectionCompact}>
        <h3 className={styles.sectionTitle}>Variable Picker</h3>
        <p className={styles.sectionHint}>
          Add a workflow trigger to load available variables.
        </p>
      </div>
    );
  }

  if (isLoading || (isFetching && !groups.length && !isError)) {
    return <VariableSkeleton />;
  }

  if (isError) {
    return (
      <div className={styles.sectionCompact}>
        <h3 className={styles.sectionTitle}>Variable Picker</h3>
        <p className={styles.sectionHint}>Unable to load workflow variables.</p>
        <button type="button" className={styles.retryBtn} onClick={() => refetch()}>
          Retry
        </button>
      </div>
    );
  }

  if (!groups.length) {
    return (
      <div className={styles.sectionCompact}>
        <h3 className={styles.sectionTitle}>Variable Picker</h3>
        <p className={styles.sectionHint}>No variables available for this trigger.</p>
      </div>
    );
  }

  return (
    <div className={styles.sectionCompact}>
      <h3 className={styles.sectionTitle}>Variable Picker</h3>
      <p className={styles.sectionHint}>
        Expand a group and click a variable to insert at the cursor.
      </p>

      <input
        type="search"
        className={`${styles.input} ${styles.variableSearch}`}
        placeholder="Search variables…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        aria-label="Search variables"
      />

      <div className={styles.variableToolbar}>
        <button type="button" className={styles.retryBtn} onClick={allOpen ? collapseAll : expandAll}>
          {allOpen ? "Collapse All" : "Expand All"}
        </button>
      </div>

      {recent.length ? (
        <div className={styles.variableRecent} aria-label="Recent variables">
          {recent.map((token) => (
            <button
              key={token}
              type="button"
              className={styles.token}
              title={`Insert ${token}`}
              onClick={() => handleInsert(token, token)}
            >
              {token}
            </button>
          ))}
        </div>
      ) : null}

      <div className={styles.variableTree} role="tree">
        {orderedGroups.map((group) => {
          const isOpen = Boolean(openGroups[group.label]) || Boolean(search.trim());
          return (
            <div key={group.label} className={styles.variableTreeGroup} role="treeitem">
              <button
                type="button"
                className={styles.variableTreeHeader}
                onClick={() => toggleGroup(group.label)}
                aria-expanded={isOpen}
              >
                <HiOutlineChevronRight
                  className={styles.variableTreeChevron}
                  data-open={isOpen ? "true" : "false"}
                  aria-hidden="true"
                />
                <span>{group.label}</span>
                <span className={styles.variableTreeCount}>{group.variables.length}</span>
              </button>

              {isOpen ? (
                <div className={styles.variableTreeChildren} role="group">
                  {group.variables.map((variable) => {
                    const { label, token } = getVariableParts(variable);
                    return (
                      <div key={token || label} className={styles.variableTreeItemRow}>
                        <button
                          type="button"
                          className={styles.variableTreeItem}
                          title={`Insert ${token}`}
                          onClick={() => handleInsert(token, label)}
                        >
                          {label}
                        </button>
                        <button
                          type="button"
                          className={styles.retryBtn}
                          title={`Copy ${token}`}
                          onClick={() => handleCopy(token, label)}
                        >
                          Copy
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {feedback ? (
        <p className={styles.insertFeedback} role="status" aria-live="polite">
          {feedback}
        </p>
      ) : null}
    </div>
  );
}
