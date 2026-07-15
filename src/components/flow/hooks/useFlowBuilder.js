"use client";

import { useCallback, useMemo, useState } from "react";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
} from "reactflow";
import { createNodeDefaults, getWorkflowNode } from "../config/workflowNodes";
import {
  saveWorkflow,
  publishWorkflow,
} from "@/services/workflowService";

const HISTORY_LIMIT = 40;
const COL_GAP = 280;
const ROW_GAP = 140;

function createId(prefix = "node") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function buildInitialNodes() {
  const defaults = createNodeDefaults("start");
  return [
    {
      id: "start",
      type: "workflow",
      position: { x: 80, y: 180 },
      data: defaults,
      dragHandle: ".nodeDragHandle",
    },
  ];
}

function isEmpty(value) {
  if (typeof value === "boolean") return false;
  if (typeof value === "number") return Number.isNaN(value);
  if (Array.isArray(value)) return value.length === 0;
  return value == null || String(value).trim() === "";
}

/** Simple left-to-right auto layout from graph roots. */
export function computeAutoLayout(nodes, edges) {
  const children = new Map();
  const incoming = new Map();

  nodes.forEach((n) => {
    children.set(n.id, []);
    incoming.set(n.id, 0);
  });

  edges.forEach((e) => {
    if (!children.has(e.source) || !incoming.has(e.target)) return;
    children.get(e.source).push(e.target);
    incoming.set(e.target, (incoming.get(e.target) || 0) + 1);
  });

  const roots = nodes
    .filter((n) => (incoming.get(n.id) || 0) === 0)
    .map((n) => n.id);

  const depth = new Map();
  const queue = [...roots];
  roots.forEach((id) => depth.set(id, 0));

  while (queue.length) {
    const id = queue.shift();
    const d = depth.get(id) ?? 0;
    for (const child of children.get(id) || []) {
      const next = d + 1;
      if (!depth.has(child) || depth.get(child) < next) {
        depth.set(child, next);
        queue.push(child);
      }
    }
  }

  nodes.forEach((n) => {
    if (!depth.has(n.id)) depth.set(n.id, 0);
  });

  const columns = new Map();
  for (const [id, d] of depth.entries()) {
    if (!columns.has(d)) columns.set(d, []);
    columns.get(d).push(id);
  }

  const positions = new Map();
  for (const [col, ids] of columns.entries()) {
    ids.forEach((id, row) => {
      positions.set(id, {
        x: 80 + col * COL_GAP,
        y: 80 + row * ROW_GAP,
      });
    });
  }

  return nodes.map((n) => ({
    ...n,
    position: positions.get(n.id) || n.position,
  }));
}

export function validateWorkflowGraph(nodes, edges) {
  const issues = [];

  if (!nodes.length) {
    issues.push({ level: "error", message: "Workflow has no nodes." });
    return { valid: false, issues };
  }

  const startNodes = nodes.filter((n) => n.data?.nodeType === "start");
  if (startNodes.length === 0) {
    issues.push({ level: "error", message: "Add a Workflow Start node." });
  } else if (startNodes.length > 1) {
    issues.push({ level: "warning", message: "Multiple start nodes detected." });
  }

  const connected = new Set();
  edges.forEach((e) => {
    connected.add(e.source);
    connected.add(e.target);
  });

  nodes.forEach((node) => {
    const def = getWorkflowNode(node.data?.nodeType);
    if (!def) {
      issues.push({
        level: "error",
        message: `Unknown node type on "${node.data?.label || node.id}".`,
        nodeId: node.id,
      });
      return;
    }

    if (node.id !== "start" && !connected.has(node.id) && nodes.length > 1) {
      issues.push({
        level: "warning",
        message: `"${node.data?.label || def.title}" is not connected.`,
        nodeId: node.id,
      });
    }

    (def.fields || []).forEach((field) => {
      if (!field.required) return;
      const value = node.data?.[field.key];
      if (isEmpty(value)) {
        issues.push({
          level: "error",
          message: `"${node.data?.label || def.title}" → ${field.label} is required.`,
          nodeId: node.id,
          field: field.key,
        });
      }
    });

    if (node.data?.repeatReminder) {
      if (isEmpty(node.data?.retryInterval)) {
        issues.push({
          level: "error",
          message: `"${node.data?.label || def.title}" → Retry Interval is required when Repeat Reminder is on.`,
          nodeId: node.id,
          field: "retryInterval",
        });
      }
      if (
        isEmpty(node.data?.maxRetryCount) ||
        Number(node.data.maxRetryCount) < 1
      ) {
        issues.push({
          level: "error",
          message: `"${node.data?.label || def.title}" → Maximum Retry Count must be at least 1.`,
          nodeId: node.id,
          field: "maxRetryCount",
        });
      }
    }
  });

  const hasOutgoingFromStart = edges.some((e) =>
    startNodes.some((s) => s.id === e.source)
  );
  if (startNodes.length && nodes.length > 1 && !hasOutgoingFromStart) {
    issues.push({
      level: "warning",
      message: "Start node has no outgoing connection.",
    });
  }

  const valid = !issues.some((i) => i.level === "error");
  return { valid, issues };
}

export default function useFlowBuilder() {
  const [nodes, setNodes] = useState(buildInitialNodes);
  const [edges, setEdges] = useState([]);
  const [selectedNodeIds, setSelectedNodeIds] = useState([]);
  const [workflowName, setWorkflowName] = useState("Hospital workflow");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [propertiesOpen, setPropertiesOpen] = useState(false);
  const [locked, setLocked] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);
  const [validation, setValidation] = useState({ valid: true, issues: [] });
  const [busy, setBusy] = useState(null);

  const selectedNodeId = selectedNodeIds[0] ?? null;
  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId]
  );

  const pushHistory = useCallback(
    (nextNodes, nextEdges) => {
      setPast((prev) => {
        const snapshot = {
          nodes: structuredClone(nodes),
          edges: structuredClone(edges),
        };
        const stacked = [...prev, snapshot];
        return stacked.length > HISTORY_LIMIT
          ? stacked.slice(stacked.length - HISTORY_LIMIT)
          : stacked;
      });
      setFuture([]);
      setNodes(nextNodes);
      setEdges(nextEdges);
    },
    [nodes, edges]
  );

  const onNodesChange = useCallback(
    (changes) => {
      if (locked) return;
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    [locked]
  );

  const onEdgesChange = useCallback(
    (changes) => {
      if (locked) return;
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    [locked]
  );

  const onConnect = useCallback(
    (connection) => {
      if (locked) return;
      setPast((prev) => [
        ...prev,
        { nodes: structuredClone(nodes), edges: structuredClone(edges) },
      ]);
      setFuture([]);
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: "custom",
            animated: true,
          },
          eds
        )
      );
    },
    [locked, nodes, edges]
  );

  const onSelectionChange = useCallback(({ nodes: selected }) => {
    const ids = (selected || []).map((n) => n.id);
    setSelectedNodeIds(ids);
    if (ids.length) setPropertiesOpen(true);
  }, []);

  const addNodeFromCatalog = useCallback(
    (type) => {
      if (locked) return;
      const defaults = createNodeDefaults(type);
      if (!defaults) return;

      const id = createId(type);
      const offset = nodes.length * 28;
      const nextNode = {
        id,
        type: "workflow",
        position: {
          x: 360 + (offset % 220),
          y: 120 + (offset % 260),
        },
        data: defaults,
        dragHandle: ".nodeDragHandle",
        selected: true,
      };

      const cleared = nodes.map((n) => ({ ...n, selected: false }));
      pushHistory([...cleared, nextNode], edges);
      setSelectedNodeIds([id]);
      setPropertiesOpen(true);
    },
    [locked, nodes, edges, pushHistory]
  );

  const updateNodeData = useCallback((nodeId, patch) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...patch } }
          : node
      )
    );
  }, []);

  const deleteNodes = useCallback(
    (ids) => {
      if (locked) return;
      const remove = new Set(
        (ids || []).filter((id) => {
          const node = nodes.find((n) => n.id === id);
          return node && node.data?.nodeType !== "start";
        })
      );
      if (!remove.size) return;

      const nextNodes = nodes.filter((n) => !remove.has(n.id));
      const nextEdges = edges.filter(
        (e) => !remove.has(e.source) && !remove.has(e.target)
      );
      pushHistory(nextNodes, nextEdges);
      setSelectedNodeIds((prev) => prev.filter((id) => !remove.has(id)));
    },
    [locked, nodes, edges, pushHistory]
  );

  const duplicateNodes = useCallback(
    (ids) => {
      if (locked) return;
      const sources = nodes.filter(
        (n) => ids.includes(n.id) && n.data?.nodeType !== "start"
      );
      if (!sources.length) return;

      const clones = sources.map((source) => {
        const id = createId(source.data?.nodeType || "node");
        return {
          ...structuredClone(source),
          id,
          position: {
            x: source.position.x + 48,
            y: source.position.y + 48,
          },
          selected: true,
        };
      });

      const cleared = nodes.map((n) => ({ ...n, selected: false }));
      pushHistory([...cleared, ...clones], edges);
      setSelectedNodeIds(clones.map((c) => c.id));
    },
    [locked, nodes, edges, pushHistory]
  );

  const undo = useCallback(() => {
    setPast((prev) => {
      if (!prev.length) return prev;
      const previous = prev[prev.length - 1];
      setFuture((f) => [
        { nodes: structuredClone(nodes), edges: structuredClone(edges) },
        ...f,
      ]);
      setNodes(previous.nodes);
      setEdges(previous.edges);
      return prev.slice(0, -1);
    });
  }, [nodes, edges]);

  const redo = useCallback(() => {
    setFuture((prev) => {
      if (!prev.length) return prev;
      const [next, ...rest] = prev;
      setPast((p) => [
        ...p,
        { nodes: structuredClone(nodes), edges: structuredClone(edges) },
      ]);
      setNodes(next.nodes);
      setEdges(next.edges);
      return rest;
    });
  }, [nodes, edges]);

  const autoLayout = useCallback(() => {
    if (locked) return;
    const laidOut = computeAutoLayout(nodes, edges);
    pushHistory(laidOut, edges);
  }, [locked, nodes, edges, pushHistory]);

  const validate = useCallback(() => {
    const result = validateWorkflowGraph(nodes, edges);
    setValidation(result);
    return result;
  }, [nodes, edges]);

  const handleSave = useCallback(async () => {
    setBusy("save");
    try {
      await saveWorkflow({
        name: workflowName,
        nodes,
        edges,
      });
    } finally {
      setBusy(null);
    }
  }, [workflowName, nodes, edges]);

  const handlePublish = useCallback(async () => {
    const result = validateWorkflowGraph(nodes, edges);
    setValidation(result);
    if (!result.valid) return result;

    setBusy("publish");
    try {
      await publishWorkflow({
        name: workflowName,
        nodes,
        edges,
      });
    } finally {
      setBusy(null);
    }
    return result;
  }, [workflowName, nodes, edges]);

  const status = useMemo(() => {
    if (locked) return { label: "Locked", tone: "warning" };
    if (validation.issues.some((i) => i.level === "error")) {
      return { label: "Invalid", tone: "danger" };
    }
    if (!edges.length) return { label: "Draft", tone: "info" };
    return { label: "Ready", tone: "success" };
  }, [locked, edges.length, validation.issues]);

  return {
    nodes,
    edges,
    selectedNodeIds,
    selectedNodeId,
    selectedNode,
    workflowName,
    setWorkflowName,
    sidebarOpen,
    setSidebarOpen,
    propertiesOpen,
    setPropertiesOpen,
    locked,
    setLocked,
    zoom,
    setZoom,
    status,
    validation,
    busy,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onSelectionChange,
    addNodeFromCatalog,
    updateNodeData,
    deleteNodes,
    duplicateNodes,
    undo,
    redo,
    autoLayout,
    validate,
    handleSave,
    handlePublish,
  };
}
