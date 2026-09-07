/**
 * Editor-only lifecycle helpers.
 * Synthetic "Workflow Start" is never shown or injected; strip it on load/save.
 */

import { getWorkflowNode } from "@/components/flow/config/workflowNodes";

export const UI_START_NODE_ID = "start";
export const UI_START_EDGE_ID = "ui-start-edge";

/**
 * @param {import('reactflow').Node} node
 */
export function isEventTriggerNode(node) {
  if (!node?.data || node.data.nodeType === "start") return false;
  const def = getWorkflowNode(node.data.nodeType);
  return Boolean(def?.isTrigger || node.data.triggerKey);
}

/**
 * True only for the known synthetic Workflow Start placeholder.
 * Real trigger nodes (patientRegistered, campaignTriggered, etc.) never match.
 *
 * @param {import('reactflow').Node | null | undefined} node
 */
export function isSyntheticUiStartNode(node) {
  if (!node?.data) return false;
  if (node.data.nodeType === "start") return true;
  // Legacy editor decoration: fixed id + uiOnly flag
  if (String(node.id) === UI_START_NODE_ID && node.data.uiOnly === true) {
    return true;
  }
  return false;
}

/**
 * Remove synthetic Workflow Start node and its synthetic edge from a graph.
 * Does not remove real triggers or real edges between saved nodes.
 *
 * @param {import('reactflow').Node[]} nodes
 * @param {import('reactflow').Edge[]} edges
 */
export function stripUiStartFromGraph(nodes = [], edges = []) {
  const startIds = new Set(
    nodes.filter(isSyntheticUiStartNode).map((node) => String(node.id))
  );

  return {
    nodes: nodes.filter((node) => !startIds.has(String(node.id))),
    edges: edges.filter((edge) => {
      if (edge.id === UI_START_EDGE_ID) return false;
      if (startIds.has(String(edge.source)) || startIds.has(String(edge.target))) {
        return false;
      }
      // Legacy synthetic edge without the fixed id
      if (
        edge.data?.uiOnly === true &&
        String(edge.source) === UI_START_NODE_ID
      ) {
        return false;
      }
      return true;
    }),
  };
}

/**
 * Normalize a graph for the editor: drop synthetic Start only.
 * (Formerly injected Workflow Start — that behavior is removed.)
 *
 * @param {import('reactflow').Node[]} nodes
 * @param {import('reactflow').Edge[]} edges
 */
export function normalizeEditorGraph(nodes = [], edges = []) {
  return stripUiStartFromGraph(nodes, edges);
}

/**
 * @deprecated Use normalizeEditorGraph / stripUiStartFromGraph.
 * Kept as an alias so older call sites strip instead of injecting Start.
 */
export function ensureUiStartNode(nodes = [], edges = []) {
  return stripUiStartFromGraph(nodes, edges);
}
