"use client";

import { motion } from "framer-motion";
import FlowToolbar from "./FlowToolbar";
import FlowCanvas from "./FlowCanvas";
import NodeSidebar from "./NodeSidebar";
import PropertyPanel from "./panels/PropertyPanel";
import useFlowBuilder from "./hooks/useFlowBuilder";
import styles from "./styles/flow.module.css";

export default function FlowBuilder() {
  const flow = useFlowBuilder();

  return (
    <div className={styles.shell}>
      <FlowToolbar
        workflowName={flow.workflowName}
        onWorkflowNameChange={flow.setWorkflowName}
        zoom={flow.zoom}
        status={flow.status}
        busy={flow.busy}
        canUndo={flow.canUndo}
        canRedo={flow.canRedo}
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
        <div className={styles.validationBar}>
          {flow.validation.issues.slice(0, 6).map((issue, idx) => (
            <span
              key={`${issue.message}-${idx}`}
              className={`${styles.issueChip} ${
                issue.level === "error" ? styles.issueError : styles.issueWarning
              }`}
            >
              {issue.message}
            </span>
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
          onSelectionChange={flow.onSelectionChange}
          onMoveEnd={flow.setZoom}
          onToggleLock={() => flow.setLocked((v) => !v)}
          onDeleteSelected={() => flow.deleteNodes(flow.selectedNodeIds)}
          onDuplicateSelected={() => flow.duplicateNodes(flow.selectedNodeIds)}
        />

        <PropertyPanel
          open={flow.propertiesOpen}
          node={flow.selectedNode}
          onClose={() => flow.setPropertiesOpen(false)}
          onChange={flow.updateNodeData}
          onDuplicate={(id) => flow.duplicateNodes([id])}
          onDelete={(id) => flow.deleteNodes([id])}
        />

        <NodeSidebar
          open={flow.sidebarOpen}
          onClose={() => flow.setSidebarOpen(false)}
          onAddNode={flow.addNodeFromCatalog}
        />

        {!flow.sidebarOpen ? (
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
