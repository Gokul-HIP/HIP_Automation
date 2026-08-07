"use client";

import { Handle, Position } from "reactflow";
import { motion } from "framer-motion";
import { HiOutlineLightningBolt } from "react-icons/hi";
import { getCategoryById } from "../config/workflowCategories";
import { getWorkflowNode } from "../config/workflowNodes";
import { getTriggerSchema } from "../config/triggers";
import styles from "../styles/node.module.css";

const FALLBACK_TRIGGER_DESCRIPTION =
  "Triggers the workflow when this hospital event occurs.";

function resolveNodeDescription(data, def) {
  if (typeof data?.description === "string" && data.description.trim()) {
    return data.description.trim();
  }
  if (def?.description) return def.description;
  const triggerSchema = getTriggerSchema(data?.nodeType);
  if (triggerSchema?.description) return triggerSchema.description;
  if (data?.isTrigger || data?.triggerKey) return FALLBACK_TRIGGER_DESCRIPTION;
  return "";
}

function resolveBodySummary(data, def) {
  const parts = [];
  if (Array.isArray(data?.source) && data.source.length) {
    parts.push(`Source: ${data.source.join(", ")}`);
  }
  if (Array.isArray(data?.channel) && data.channel.length) {
    parts.push(`Channel: ${data.channel.join(", ")}`);
  }
  if (Array.isArray(data?.channels) && data.channels.length) {
    parts.push(`Channels: ${data.channels.join(", ")}`);
  }
  if (data?.triggerTiming) parts.push(`Timing: ${data.triggerTiming}`);
  if (data?.reminderTiming) parts.push(`Timing: ${data.reminderTiming}`);
  if (data?.scheduleType) parts.push(`Schedule: ${data.scheduleType}`);
  if (data?.patientType && data.patientType !== "any") {
    parts.push(`Patient: ${data.patientType}`);
  }
  if (parts.length) return parts.slice(0, 2).join(" · ");

  // Prefer a required field hint from local catalog when nothing configured yet.
  const required = (def?.fields || []).filter((f) => f.required).slice(0, 2);
  if (required.length) {
    return required.map((f) => f.label).join(" · ");
  }
  return "";
}

export default function BaseNode({
  id,
  data,
  selected,
  showTarget = true,
  showSource = true,
}) {
  const def = getWorkflowNode(data?.nodeType);
  const Icon = def?.icon || (data?.isTrigger || data?.triggerKey ? HiOutlineLightningBolt : null);
  const tone = data?.tone || def?.tone || (data?.isTrigger || data?.triggerKey ? "success" : "primary");
  const category = getCategoryById(data?.category || def?.category);
  const title = data?.label || def?.title || "Node";
  const description = resolveNodeDescription(data, def);
  const summary = resolveBodySummary(data, def);
  const categoryLabel =
    data?.module || category?.label || data?.category || "Node";
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
            <p className={styles.category}>{categoryLabel}</p>
          </div>
        </div>
        <span className={styles.status} data-status={statusKey}>
          {status}
        </span>
      </div>

      <div className={styles.body}>
        {description ? <p className={styles.hint}>{description}</p> : null}
        {summary ? <p className={styles.summary}>{summary}</p> : null}
        {!description && !summary ? (
          <p className={styles.hint}>Configure this node in the property panel.</p>
        ) : null}
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
