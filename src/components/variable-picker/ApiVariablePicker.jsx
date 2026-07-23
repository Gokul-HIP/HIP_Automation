"use client";

import { useMemo, useState } from "react";
import { HiOutlineChevronRight } from "react-icons/hi";
import { useVariables } from "@/hooks/useWorkflowApi";
import { ensureValidPlaceholder } from "@/utils/workflowVariableTokens";
import styles from "@/components/flow/styles/propertyPanel.module.css";

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
    return [...groups].sort((a, b) => {
      const ai = preferred.indexOf(a.label);
      const bi = preferred.indexOf(b.label);
      if (ai === -1 && bi === -1) return a.label.localeCompare(b.label);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
  }, [groups]);

  const toggleGroup = (label) => {
    setOpenGroups((prev) => ({
      ...prev,
      [label]: !(prev[label] ?? false),
    }));
  };

  const handleInsert = (token, label) => {
    const safeToken = ensureValidPlaceholder(token);
    if (!safeToken) return;
    onInsert?.(safeToken);
    setFeedback(`Inserted ${label || safeToken}`);
    window.setTimeout(() => setFeedback(""), 1600);
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

  if (!orderedGroups.length) {
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

      <div className={styles.variableTree} role="tree">
        {orderedGroups.map((group) => {
          const isOpen = Boolean(openGroups[group.label]);
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
                      <button
                        key={token || label}
                        type="button"
                        className={styles.variableTreeItem}
                        title={`Insert ${token}`}
                        onClick={() => handleInsert(token, label)}
                      >
                        {label}
                      </button>
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
