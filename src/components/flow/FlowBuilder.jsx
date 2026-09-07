"use client";

import { motion } from "framer-motion";
import FlowToolbar from "./FlowToolbar";
import FlowCanvas from "./FlowCanvas";
import NodeSidebar from "./NodeSidebar";
import PropertyPanel from "./panels/PropertyPanel";
import FlowToast from "./FlowToast";
import useFlowBuilder from "./hooks/useFlowBuilder";
import styles from "./styles/flow.module.css";

/**
 * Shared React Flow workflow builder.
 * mode="template" saves to /workflow-templates (no publish).
 * readOnly disables editing (view / preview).
 */
export default function FlowBuilder({
  initialWorkflowId = null,
  initialId = null,
  fromTemplateId = null,
  initialHospitalId = null,
  embedInitMessage = null,
  mode = "workflow",
  readOnly = false,
  usePreviewEndpoint = false,
  showMetaBanner = false,
}) {
  const flow = useFlowBuilder({
    initialWorkflowId,
    initialId,
    fromTemplateId,
    initialHospitalId,
    embedInitMessage,
    mode,
    readOnly,
    usePreviewEndpoint,
  });

  const noop = () => {};

  return (
    <div
      className={styles.shell}
      data-flow-shell="true"
    >
      <FlowToast toast={flow.toast} onDismiss={flow.clearToast} />

      {showMetaBanner && flow.templateMeta ? (
        <div className={styles.metaBanner} role="status">
          <span>
            <strong>Module:</strong> {flow.templateMeta.module || "—"}
          </span>
          <span>
            <strong>Trigger:</strong>{" "}
            {flow.templateMeta.triggerLabel ||
              flow.templateMeta.triggerType ||
              "—"}
          </span>
          <span>
            <strong>Nodes:</strong>{" "}
            {flow.templateMeta.nodeCount ||
              flow.nodes.filter((n) => n.data?.nodeType !== "start").length}
          </span>
          <span>
            <strong>Edges:</strong>{" "}
            {flow.templateMeta.edgeCount || flow.edges.length}
          </span>
          <span>
            <strong>Status:</strong> {flow.workflowStatus || "—"}
          </span>
        </div>
      ) : null}

      <FlowToolbar
        entityLabel={flow.isTemplateMode ? "Template" : "Workflow"}
        workflowName={flow.workflowName}
        onWorkflowNameChange={readOnly ? undefined : flow.setWorkflowName}
        nameReadOnly={readOnly}
        workflowStatus={flow.workflowStatus}
        zoom={flow.zoom}
        status={flow.status}
        busy={flow.busy}
        canUndo={flow.canUndo}
        canRedo={flow.canRedo}
        canPublish={flow.canPublish}
        showPublish={flow.showPublish}
        showSave={flow.showSave}
        saveLabel={flow.isTemplateMode ? "Save Template" : "Save"}
        onUndo={flow.undo}
        onRedo={flow.redo}
        onAutoLayout={flow.autoLayout}
        onValidate={flow.validate}
        onSave={flow.handleSave}
        onPublish={flow.handlePublish}
        sidebarOpen={flow.sidebarOpen}
        propertiesOpen={flow.propertiesOpen}
        onToggleSidebar={() => flow.setSidebarOpen((v) => !v)}
        onToggleProperties={() => flow.setPropertiesOpen((v) => !v)}
      />

      {flow.validation.issues.length > 0 ? (
        <div className={styles.validationBar} role="status">
          {flow.validation.issues.map((issue, idx) => (
            <button
              key={`${issue.message}-${issue.nodeId || "x"}-${idx}`}
              type="button"
              className={`${styles.issueChip} ${
                issue.level === "error" ? styles.issueError : styles.issueWarning
              } ${issue.nodeId ? styles.issueClickable : ""}`}
              onClick={() => flow.focusValidationIssue?.(issue)}
              title={
                issue.nodeId
                  ? "Click to highlight node"
                  : issue.message
              }
            >
              {issue.message}
            </button>
          ))}
        </div>
      ) : null}

      <div className={styles.body}>
        <FlowCanvas
          nodes={flow.nodes}
          edges={flow.edges}
          locked={flow.locked}
          onNodesChange={flow.onNodesChange}
          onEdgesChange={flow.onEdgesChange}
          onConnect={flow.onConnect}
          isValidConnection={flow.isValidConnection}
          onSelectionChange={flow.onSelectionChange}
          onMoveEnd={flow.setZoom}
          onToggleLock={
            readOnly ? noop : () => flow.setLocked((v) => !v)
          }
          onDeleteSelected={
            readOnly
              ? undefined
              : () => flow.deleteNodes(flow.selectedNodeIds)
          }
          onDuplicateSelected={
            readOnly
              ? undefined
              : () => flow.duplicateNodes(flow.selectedNodeIds)
          }
          onViewportReady={flow.registerViewportApi}
        />

        <PropertyPanel
          open={flow.propertiesOpen}
          node={flow.selectedNode}
          workflowTriggerKey={flow.workflowTriggerKey}
          campaignKey={flow.campaignKey}
          suppressOnAppointment={flow.suppressOnAppointment}
          onCampaignKeyChange={
            readOnly ? undefined : flow.setCampaignKey
          }
          onSuppressOnAppointmentChange={
            readOnly ? undefined : flow.setSuppressOnAppointment
          }
          showCampaignSettings={!flow.isTemplateMode}
          onClose={() => flow.setPropertiesOpen(false)}
          onChange={readOnly ? noop : flow.updateNodeData}
          onDuplicate={
            readOnly ? noop : (id) => flow.duplicateNodes([id])
          }
          onDelete={readOnly ? noop : (id) => flow.deleteNodes([id])}
          readOnly={readOnly}
        />

        {!readOnly ? (
          <NodeSidebar
            open={flow.sidebarOpen}
            onClose={() => flow.setSidebarOpen(false)}
            onAddNode={flow.addNodeFromCatalog}
            onAddTrigger={flow.addNodeFromTrigger}
          />
        ) : null}

        {!readOnly && !flow.sidebarOpen ? (
          <motion.button
            type="button"
            className={styles.sidebarOpenTab}
            onClick={() => flow.setSidebarOpen(true)}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            aria-label="Open node menu"
          >
            NODES
          </motion.button>
        ) : null}
      </div>
    </div>
  );
}
