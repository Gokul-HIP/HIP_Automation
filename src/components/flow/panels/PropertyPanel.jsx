"use client";

import { AnimatePresence, motion } from "framer-motion";
import { HiOutlineX, HiOutlineDuplicate, HiOutlineTrash } from "react-icons/hi";
import { getWorkflowNode } from "../config/workflowNodes";
import { getCategoryById } from "../config/workflowCategories";
import { getTriggerSchema } from "../config/triggers";
import TriggerProperties from "./triggers/TriggerProperties";
import ApiTriggerProperties from "@/components/property-panel/ApiTriggerProperties";
import MessagingProperties from "./messaging/MessagingProperties";
import ConditionProperties from "./conditions/ConditionProperties";
import WaitProperties from "./wait/WaitProperties";
import DatabaseProperties from "./database/DatabaseProperties";
import EndProperties from "./flow/EndProperties";
import WorkflowCampaignSettings from "./WorkflowCampaignSettings";
import styles from "../styles/flow.module.css";

function PropertyField({ field, value, onChange }) {
  const id = `prop-${field.key}`;

  if (field.type === "textarea") {
    return (
      <div>
        <label htmlFor={id} className={styles.fieldLabel}>
          {field.label}
          {field.required ? " *" : ""}
        </label>
        <textarea
          id={id}
          className={styles.textarea}
          value={value ?? ""}
          placeholder={field.placeholder || ""}
          onChange={(e) => onChange(field.key, e.target.value)}
        />
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div>
        <label htmlFor={id} className={styles.fieldLabel}>
          {field.label}
          {field.required ? " *" : ""}
        </label>
        <select
          id={id}
          className={styles.select}
          value={value ?? ""}
          onChange={(e) => onChange(field.key, e.target.value)}
        >
          {(field.options || []).map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === "boolean") {
    return (
      <div className={styles.boolRow}>
        <label htmlFor={id} className={styles.fieldLabel}>
          {field.label}
        </label>
        <button
          id={id}
          type="button"
          role="switch"
          aria-checked={Boolean(value)}
          className={styles.toggle}
          data-on={value ? "true" : "false"}
          onClick={() => onChange(field.key, !value)}
        >
          <span className={styles.toggleThumb} />
        </button>
      </div>
    );
  }

  return (
    <div>
      <label htmlFor={id} className={styles.fieldLabel}>
        {field.label}
        {field.required ? " *" : ""}
      </label>
      <input
        id={id}
        type={field.type === "number" ? "number" : "text"}
        className={styles.field}
        value={value ?? ""}
        placeholder={field.placeholder || ""}
        onChange={(e) =>
          onChange(
            field.key,
            field.type === "number" ? Number(e.target.value) : e.target.value
          )
        }
      />
    </div>
  );
}

function GenericNodeProperties({ node, def, onChange }) {
  return (
    <div className={styles.fields}>
      <div className={styles.helpBox}>{def.description}</div>

      {(def.fields || []).map((field) => (
        <PropertyField
          key={field.key}
          field={field}
          value={node.data?.[field.key]}
          onChange={(key, val) => onChange?.(node.id, { [key]: val })}
        />
      ))}
    </div>
  );
}

const PANEL_MAP = {
  trigger: TriggerProperties,
  messaging: MessagingProperties,
  condition: ConditionProperties,
  wait: WaitProperties,
  database: DatabaseProperties,
  end: EndProperties,
};

export default function PropertyPanel({
  open,
  node,
  workflowTriggerKey = null,
  campaignKey = "",
  suppressOnAppointment = false,
  onCampaignKeyChange,
  onSuppressOnAppointmentChange,
  showCampaignSettings = true,
  onClose,
  onChange,
  onDuplicate,
  onDelete,
  readOnly = false,
}) {
  const def = node ? getWorkflowNode(node.data?.nodeType) : null;
  const isApiTrigger = Boolean(node?.data?.triggerKey);
  const category = def
    ? getCategoryById(def.category)
    : isApiTrigger
      ? getCategoryById("triggers")
      : null;
  const isStart = node?.data?.nodeType === "start";
  const isTriggerNode =
    isApiTrigger || def?.customPanel === "trigger" || def?.isTrigger;

  let PanelComponent = def?.customPanel ? PANEL_MAP[def.customPanel] : null;
  if (isTriggerNode && !isStart) {
    // Prefer rich local trigger schemas (e.g. Medicine Reminder) over API text forms.
    const hasLocalSchema = Boolean(
      getTriggerSchema(node?.data?.nodeType) ||
        getTriggerSchema(node?.data?.triggerKey)
    );
    PanelComponent =
      isApiTrigger && !hasLocalSchema
        ? ApiTriggerProperties
        : TriggerProperties;
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.aside
          className={`${styles.panel} ${styles.panelNarrow}`}
          initial={{ x: 24, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 28, opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 34 }}
          style={{ height: "100%", minHeight: 0 }}
          aria-label="Property panel"
        >
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.panelEyebrow}>Properties</p>
              <h2 className={styles.panelTitle}>
                {node
                  ? node.data?.label || def?.title || "Node"
                  : showCampaignSettings
                    ? "Workflow"
                    : "No selection"}
              </h2>
              {category ? (
                <p className={styles.panelSubtitle}>{category.label}</p>
              ) : !node && showCampaignSettings ? (
                <p className={styles.panelSubtitle}>Campaign settings</p>
              ) : null}
            </div>
            <button
              type="button"
              className={styles.iconBtn}
              onClick={onClose}
              aria-label="Close property panel"
            >
              <HiOutlineX />
            </button>
          </div>

          {!node || (!def && !isApiTrigger) ? (
            showCampaignSettings ? (
              <div className={styles.panelBodyStack}>
                <div className={styles.panelScrollRegion}>
                  <WorkflowCampaignSettings
                    campaignKey={campaignKey}
                    suppressOnAppointment={suppressOnAppointment}
                    onCampaignKeyChange={onCampaignKeyChange}
                    onSuppressOnAppointmentChange={onSuppressOnAppointmentChange}
                    readOnly={readOnly}
                  />
                  <p className={styles.emptyHint}>
                    Select a node on the canvas to edit its configuration.
                  </p>
                </div>
              </div>
            ) : (
              <p className={styles.emptyHint}>
                Select a node on the canvas to edit its configuration.
              </p>
            )
          ) : (
            <div className={styles.panelBodyStack}>
              {!readOnly ? (
                <div className={styles.actionRow}>
                  <button
                    type="button"
                    className={styles.actionBtn}
                    disabled={isStart}
                    onClick={() => onDuplicate?.(node.id)}
                  >
                    <HiOutlineDuplicate />
                    Duplicate
                  </button>
                  <button
                    type="button"
                    className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                    disabled={isStart}
                    onClick={() => onDelete?.(node.id)}
                  >
                    <HiOutlineTrash />
                    Delete
                  </button>
                </div>
              ) : (
                <p className={styles.emptyHint}>Read-only preview</p>
              )}

              <div
                className={styles.panelScrollRegion}
                style={
                  readOnly
                    ? { pointerEvents: "none", opacity: 0.92 }
                    : undefined
                }
              >
                {PanelComponent ? (
                  <PanelComponent
                    data={{
                      ...node.data,
                      workflowTriggerKey:
                        workflowTriggerKey ?? node.data?.workflowTriggerKey,
                    }}
                    onChange={(patch) => onChange?.(node.id, patch)}
                  />
                ) : def ? (
                  <GenericNodeProperties
                    node={node}
                    def={def}
                    onChange={onChange}
                  />
                ) : null}
              </div>
            </div>
          )}
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
