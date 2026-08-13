import { create } from "zustand";

const HISTORY_LIMIT = 40;

/**
 * @typedef {import('reactflow').Node} RFNode
 * @typedef {import('reactflow').Edge} RFEdge
 */

export const useWorkflowBuilderStore = create((set, get) => ({
  workflowId: null,
  workflowName: "Hospital workflow",
  workflowStatus: "draft",
  module: null,
  triggerKey: null,

  nodes: [],
  edges: [],
  viewport: { x: 0, y: 0, zoom: 1 },

  selectedNodeId: null,
  past: [],
  future: [],

  setWorkflowMeta: (meta) => set((state) => ({ ...state, ...meta })),

  setGraph: ({ nodes, edges, viewport, pushHistory = false }) =>
    set((state) => ({
      nodes: nodes ?? state.nodes,
      edges: edges ?? state.edges,
      viewport: viewport ?? state.viewport,
      past: pushHistory
        ? [...state.past.slice(-(HISTORY_LIMIT - 1)), { nodes: state.nodes, edges: state.edges }]
        : state.past,
      future: pushHistory ? [] : state.future,
    })),

  setNodes: (nodes, pushHistory = true) =>
    set((state) => ({
      past: pushHistory
        ? [...state.past.slice(-(HISTORY_LIMIT - 1)), { nodes: state.nodes, edges: state.edges }]
        : state.past,
      future: pushHistory ? [] : state.future,
      nodes: typeof nodes === "function" ? nodes(state.nodes) : nodes,
    })),

  setEdges: (edges, pushHistory = true) =>
    set((state) => ({
      past: pushHistory
        ? [...state.past.slice(-(HISTORY_LIMIT - 1)), { nodes: state.nodes, edges: state.edges }]
        : state.past,
      future: pushHistory ? [] : state.future,
      edges: typeof edges === "function" ? edges(state.edges) : edges,
    })),

  setViewport: (viewport) => set({ viewport }),

  setSelectedNodeId: (selectedNodeId) => set({ selectedNodeId }),

  updateNodeData: (nodeId, patch) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...patch } } : n
      ),
    })),

  undo: () => {
    const { past, nodes, edges, future } = get();
    if (!past.length) return;
    const previous = past[past.length - 1];
    set({
      past: past.slice(0, -1),
      future: [{ nodes, edges }, ...future].slice(0, HISTORY_LIMIT),
      nodes: previous.nodes,
      edges: previous.edges,
    });
  },

  redo: () => {
    const { future, nodes, edges, past } = get();
    if (!future.length) return;
    const next = future[0];
    set({
      future: future.slice(1),
      past: [...past, { nodes, edges }].slice(-HISTORY_LIMIT),
      nodes: next.nodes,
      edges: next.edges,
    });
  },

  reset: () =>
    set({
      workflowId: null,
      workflowName: "Hospital workflow",
      workflowStatus: "draft",
      module: null,
      triggerKey: null,
      nodes: [],
      edges: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      selectedNodeId: null,
      past: [],
      future: [],
    }),
}));

export function selectSelectedNode(state) {
  if (!state.selectedNodeId) return null;
  return state.nodes.find((n) => n.id === state.selectedNodeId) ?? null;
}
