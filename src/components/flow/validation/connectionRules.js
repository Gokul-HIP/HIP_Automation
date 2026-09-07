/**
 * React Flow connection rules for the workflow builder.
 * Pure helpers — safe for unit tests without React.
 */

import { getWorkflowNode } from "../config/workflowNodes";

/**
 * @param {import('reactflow').Node | undefined} node
 */
export function isEndNode(node) {
  return node?.data?.nodeType === "end";
}

/**
 * @param {import('reactflow').Node | undefined} node
 */
export function isStartNode(node) {
  return node?.data?.nodeType === "start";
}

/**
 * @param {import('reactflow').Node | undefined} node
 */
export function isTriggerNode(node) {
  if (!node || isStartNode(node)) return false;
  const def = getWorkflowNode(node.data?.nodeType);
  return Boolean(def?.isTrigger || node.data?.triggerKey || def?.customPanel === "trigger");
}

/**
 * @param {import('reactflow').Node | undefined} node
 */
export function isConditionNode(node) {
  return node?.data?.nodeType === "condition";
}

/**
 * Whether a new connection is allowed.
 * @param {object} params
 * @param {string} params.source
 * @param {string} params.target
 * @param {string|null|undefined} params.sourceHandle
 * @param {import('reactflow').Node[]} params.nodes
 * @param {import('reactflow').Edge[]} params.edges
 */
export function isValidWorkflowConnection({
  source,
  target,
  sourceHandle = null,
  nodes = [],
  edges = [],
}) {
  if (!source || !target || source === target) return false;

  const sourceNode = nodes.find((n) => n.id === source);
  const targetNode = nodes.find((n) => n.id === target);
  if (!sourceNode || !targetNode) return false;

  // End must not emit edges. Triggers (and legacy Start) are entry points only.
  if (isEndNode(sourceNode)) return false;
  if (isStartNode(targetNode)) return false;
  if (isTriggerNode(targetNode)) return false;

  // Condition nodes must use true/false handles.
  if (isConditionNode(sourceNode)) {
    if (sourceHandle !== "true" && sourceHandle !== "false") return false;
    const duplicate = edges.some(
      (e) => e.source === source && e.sourceHandle === sourceHandle
    );
    if (duplicate) return false;
    return true;
  }

  // Non-condition nodes: at most one outgoing edge.
  const alreadyOut = edges.some((e) => e.source === source);
  if (alreadyOut) return false;

  // Prevent duplicate identical edges.
  const same = edges.some(
    (e) =>
      e.source === source &&
      e.target === target &&
      (e.sourceHandle ?? null) === (sourceHandle ?? null)
  );
  if (same) return false;

  return true;
}
