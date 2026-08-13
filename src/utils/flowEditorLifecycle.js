/**
 * Editor-only lifecycle helpers.
 * Workflow Start is UI decoration — never persisted to Laravel.
 */

import { createNodeDefaults, getWorkflowNode } from "@/components/flow/config/workflowNodes";

export const UI_START_NODE_ID = "start";
export const UI_START_EDGE_ID = "ui-start-edge";
const START_OFFSET_X = 280;

/**
 * @param {import('reactflow').Node} node
 */
export function isEventTriggerNode(node) {
  if (!node?.data || node.data.nodeType === "start") return false;
  const def = getWorkflowNode(node.data.nodeType);
  return Boolean(def?.isTrigger || node.data.triggerKey);
}

/**
 * @param {{ x: number, y: number }} [position]
 */
export function createUiStartNode(position = { x: 80, y: 180 }) {
  const defaults = createNodeDefaults("start");
  return {
    id: UI_START_NODE_ID,
    type: "workflow",
    position: {
      x: Number(position.x),
      y: Number(position.y),
    },
    data: {
      ...defaults,
      uiOnly: true,
    },
    dragHandle: ".nodeDragHandle",
    selected: false,
  };
}

/**
 * @param {string} triggerNodeId
 */
export function createUiStartEdge(triggerNodeId) {
  return {
    id: UI_START_EDGE_ID,
    source: UI_START_NODE_ID,
    target: String(triggerNodeId),
    sourceHandle: null,
    targetHandle: null,
    type: "custom",
    animated: true,
    data: { uiOnly: true },
  };
}

/**
 * Inject a temporary Workflow Start node when loading backend configuration.
 * Connects Start → first event trigger with a temporary edge.
 *
 * @param {import('reactflow').Node[]} nodes
 * @param {import('reactflow').Edge[]} edges
 */
export function ensureUiStartNode(nodes = [], edges = []) {
  const nextNodes = [...nodes];
  const nextEdges = [...edges];

  const hasStart = nextNodes.some((n) => n.data?.nodeType === "start");
  if (hasStart) {
    return { nodes: nextNodes, edges: nextEdges };
  }

  const triggerNode = nextNodes.find(isEventTriggerNode) ?? null;
  const startPosition = triggerNode
    ? {
        x: Number(triggerNode.position?.x ?? 80) - START_OFFSET_X,
        y: Number(triggerNode.position?.y ?? 180),
      }
    : { x: 80, y: 180 };

  nextNodes.unshift(createUiStartNode(startPosition));

  if (triggerNode) {
    const alreadyLinked = nextEdges.some(
      (edge) =>
        edge.source === UI_START_NODE_ID && edge.target === String(triggerNode.id)
    );
    if (!alreadyLinked) {
      nextEdges.unshift(createUiStartEdge(triggerNode.id));
    }
  }

  return { nodes: nextNodes, edges: nextEdges };
}

/**
 * @param {import('reactflow').Node[]} nodes
 * @param {import('reactflow').Edge[]} edges
 */
export function stripUiStartFromGraph(nodes = [], edges = []) {
  const startIds = new Set(
    nodes
      .filter((node) => node?.data?.nodeType === "start" || node?.data?.uiOnly)
      .map((node) => String(node.id))
  );

  return {
    nodes: nodes.filter((node) => !startIds.has(String(node.id))),
    edges: edges.filter(
      (edge) =>
        !startIds.has(String(edge.source)) &&
        !startIds.has(String(edge.target)) &&
        edge.id !== UI_START_EDGE_ID
    ),
  };
}
