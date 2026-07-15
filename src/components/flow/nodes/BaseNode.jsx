"use client";

import { Handle, Position } from "reactflow";
import { motion } from "framer-motion";
import { getCategoryById } from "../config/workflowCategories";
import { getWorkflowNode } from "../config/workflowNodes";
import styles from "../styles/node.module.css";

export default function BaseNode({
  id,
  data,
  selected,
  showTarget = true,
  showSource = true,
}) {
  const def = getWorkflowNode(data?.nodeType);
  const Icon = def?.icon;
  const tone = data?.tone || def?.tone || "primary";
  const category = getCategoryById(data?.category || def?.category);
  const title = data?.label || def?.title || "Node";
  const description = def?.description || "";
  const status = data?.executionStatus || data?.status || "draft";
  const statusKey =
    status === "published"
      ? "ready"
      : status === "paused" || status === "archived"
        ? "disabled"
        : status;

  return (
    <motion.div
      className={styles.node}
      data-selected={selected ? "true" : "false"}
      data-node-id={id}
      initial={{ opacity: 0, scale: 0.94, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      {showTarget ? (
        <Handle
          type="target"
          position={Position.Left}
          className={`${styles.handle} ${styles.handleLeft}`}
        />
      ) : null}

      <div className={`${styles.header} nodeDragHandle`}>
        <div className={styles.headerLeft}>
          {Icon ? (
            <span className={styles.iconBadge} data-tone={tone}>
              <Icon aria-hidden="true" />
            </span>
          ) : null}
          <div className={styles.titleWrap}>
            <p className={styles.title}>{title}</p>
            <p className={styles.category}>
              {category?.label || data?.category || "Node"}
            </p>
          </div>
        </div>
        <span className={styles.status} data-status={statusKey}>
          {status}
        </span>
      </div>

      <div className={styles.body}>
        <p className={styles.hint}>{description}</p>
      </div>

      <div className={styles.footer}>
        <span className={styles.footerType}>{def?.type || data?.nodeType}</span>
        <span className={styles.footerHint}>Edit in panel →</span>
      </div>

      {showSource ? (
        <Handle
          type="source"
          position={Position.Right}
          className={`${styles.handle} ${styles.handleRight}`}
        />
      ) : null}
    </motion.div>
  );
}
