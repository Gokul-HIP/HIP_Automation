"use client";

import { motion } from "framer-motion";
import {
  HiOutlineSave,
  HiOutlineUpload,
  HiOutlineReply,
  HiOutlineMenuAlt2,
  HiOutlineStatusOnline,
  HiOutlineTemplate,
  HiOutlineCheckCircle,
  HiOutlineAdjustments,
} from "react-icons/hi";
import styles from "./styles/flow.module.css";

export default function FlowToolbar({
  workflowName,
  onWorkflowNameChange,
  workflowStatus,
  zoom,
  status,
  busy,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onAutoLayout,
  onValidate,
  onSave,
  onPublish,
  onToggleSidebar,
  onToggleProperties,
  sidebarOpen,
  propertiesOpen,
}) {
  return (
    <header className={styles.toolbar}>
      <div className={styles.toolbarStart}>
        <motion.button
          type="button"
          className={`${styles.toolBtn} ${styles.toolBtnGhost} ${sidebarOpen ? styles.toolBtnActive : ""}`}
          onClick={onToggleSidebar}
          whileTap={{ scale: 0.96 }}
          aria-label={sidebarOpen ? "Hide node menu" : "Show node menu"}
        >
          <HiOutlineMenuAlt2 />
        </motion.button>

        <motion.button
          type="button"
          className={`${styles.toolBtn} ${styles.toolBtnGhost} ${propertiesOpen ? styles.toolBtnActive : ""}`}
          onClick={onToggleProperties}
          whileTap={{ scale: 0.96 }}
          aria-label={propertiesOpen ? "Hide properties" : "Show properties"}
          aria-pressed={propertiesOpen}
        >
          <HiOutlineAdjustments />
        </motion.button>

        <div className={styles.flowNameWrap}>
          <span className={styles.flowLabel}>Workflow</span>
          <input
            className={styles.flowNameInput}
            value={workflowName}
            onChange={(e) => onWorkflowNameChange?.(e.target.value)}
            aria-label="Workflow name"
          />
        </div>

        <span className={styles.statusPill} data-tone={status.tone}>
          <HiOutlineStatusOnline aria-hidden="true" />
          {status.label}
        </span>

        {workflowStatus ? (
          <span className={styles.statusPill} data-tone="info">
            {workflowStatus === "active" ? "Published" : "Draft"}
          </span>
        ) : null}
      </div>

      <div className={styles.toolbarEnd}>
        <div className={styles.toolbarGroup}>
          <button
            type="button"
            className={styles.toolBtn}
            onClick={onUndo}
            disabled={!canUndo}
            aria-label="Undo"
          >
            <HiOutlineReply />
          </button>
          <button
            type="button"
            className={`${styles.toolBtn} ${styles.toolBtnFlip}`}
            onClick={onRedo}
            disabled={!canRedo}
            aria-label="Redo"
          >
            <HiOutlineReply />
          </button>
          <button
            type="button"
            className={styles.toolBtn}
            onClick={onAutoLayout}
            aria-label="Auto layout"
            title="Auto layout"
          >
            <HiOutlineTemplate />
          </button>
          <button
            type="button"
            className={styles.toolBtn}
            onClick={onValidate}
            aria-label="Validate"
            title="Validate"
          >
            <HiOutlineCheckCircle />
          </button>
          <span className={styles.zoomBadge}>{zoom}%</span>
        </div>

        <motion.button
          type="button"
          className={`${styles.toolBtn} ${styles.toolBtnGhost}`}
          whileTap={{ scale: 0.96 }}
          onClick={onSave}
          disabled={!!busy}
          aria-busy={busy === "save"}
        >
          {busy === "save" ? (
            <span className={styles.btnSpinner} aria-hidden="true" />
          ) : (
            <HiOutlineSave />
          )}
          {busy === "save" ? "Saving…" : "Save"}
        </motion.button>

        <motion.button
          type="button"
          className={`${styles.toolBtn} ${styles.toolBtnPrimary}`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onPublish}
          disabled={!!busy}
          aria-busy={busy === "publish"}
        >
          <HiOutlineUpload />
          {busy === "publish" ? "Publishing…" : "Publish"}
        </motion.button>
      </div>
    </header>
  );
}
