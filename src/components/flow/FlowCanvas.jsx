"use client";

import { useCallback, useEffect, useMemo } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
  MarkerType,
  SelectionMode,
} from "reactflow";
import "reactflow/dist/style.css";
import {
  HiOutlinePlus,
  HiOutlineMinus,
  HiOutlineArrowsExpand,
  HiOutlineLockClosed,
  HiOutlineLockOpen,
} from "react-icons/hi";
import WorkflowNode from "./nodes/WorkflowNode";
import CustomEdge from "./edges/CustomEdge";
import styles from "./styles/flow.module.css";

const nodeTypes = {
  workflow: WorkflowNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

const defaultEdgeOptions = {
  type: "custom",
  animated: true,
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: "var(--success)",
    width: 18,
    height: 18,
  },
};

function CanvasControls({ locked, onToggleLock }) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  return (
    <div className={styles.customControls}>
      <button
        type="button"
        className={styles.controlBtn}
        onClick={() => zoomIn({ duration: 200 })}
        aria-label="Zoom in"
      >
        <HiOutlinePlus />
      </button>
      <button
        type="button"
        className={styles.controlBtn}
        onClick={() => zoomOut({ duration: 200 })}
        aria-label="Zoom out"
      >
        <HiOutlineMinus />
      </button>
      <button
        type="button"
        className={styles.controlBtn}
        onClick={() => fitView({ padding: 0.2, duration: 300 })}
        aria-label="Fit view"
      >
        <HiOutlineArrowsExpand />
      </button>
      <button
        type="button"
        className={styles.controlBtn}
        data-active={locked ? "true" : "false"}
        onClick={onToggleLock}
        aria-label={locked ? "Unlock canvas" : "Lock canvas"}
      >
        {locked ? <HiOutlineLockClosed /> : <HiOutlineLockOpen />}
      </button>
    </div>
  );
}

function ViewportBridge({ onReady }) {
  const { getViewport, setViewport } = useReactFlow();

  useEffect(() => {
    onReady?.({ getViewport, setViewport });
    return () => onReady?.(null);
  }, [getViewport, setViewport, onReady]);

  return null;
}

function FlowCanvasInner({
  nodes,
  edges,
  locked,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onSelectionChange,
  onMoveEnd,
  onToggleLock,
  onDeleteSelected,
  onDuplicateSelected,
  onViewportReady,
}) {
  const decoratedNodes = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        draggable: !locked,
      })),
    [nodes, locked]
  );

  const handleMoveEnd = useCallback(
    (_event, viewport) => {
      onMoveEnd?.(Math.round((viewport?.zoom ?? 1) * 100));
    },
    [onMoveEnd]
  );

  const handleKeyDown = useCallback(
    (event) => {
      if (locked) return;
      const target = event.target;
      const tag = target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;

      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        onDeleteSelected?.();
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "d") {
        event.preventDefault();
        onDuplicateSelected?.();
      }
    },
    [locked, onDeleteSelected, onDuplicateSelected]
  );

  return (
    <div
      className={styles.canvasWrap}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="application"
      aria-label="Workflow canvas"
    >
      <ReactFlow
        className={styles.reactFlow}
        nodes={decoratedNodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        onMoveEnd={handleMoveEnd}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        snapToGrid
        snapGrid={[16, 16]}
        nodesDraggable={!locked}
        nodesConnectable={!locked}
        elementsSelectable={!locked}
        panOnDrag={!locked}
        selectionOnDrag
        selectionMode={SelectionMode.Partial}
        multiSelectionKeyCode="Shift"
        zoomOnScroll
        minZoom={0.35}
        maxZoom={1.75}
        deleteKeyCode={null}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          id="workflow-dots"
          variant={BackgroundVariant.Dots}
          gap={18}
          size={1.4}
          color="var(--border-color)"
        />
        <MiniMap
          pannable
          zoomable
          nodeStrokeColor="var(--border-color)"
          nodeColor="var(--surface-light)"
          maskColor="color-mix(in srgb, var(--background) 72%, transparent)"
        />
        <ViewportBridge onReady={onViewportReady} />
        <CanvasControls locked={locked} onToggleLock={onToggleLock} />
      </ReactFlow>
    </div>
  );
}

export default function FlowCanvas(props) {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
