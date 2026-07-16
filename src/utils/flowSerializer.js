/**
 * Converts React Flow state into Laravel medicine-workflows JSON.
 * Never serializes functions, JSX, or React components.
 */

import { normalizeWorkflowStatus } from "./workflowStatus";

const BUILDER_VERSION = "1.0";
const REACT_FLOW_VERSION = "12";

/**
 * @param {unknown} value
 * @returns {Record<string, unknown>}
 */
function toPlainData(value) {
  if (!value || typeof value !== "object") return {};
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return {};
  }
}

/**
 * @param {import('reactflow').Node} node
 * @returns {import('../types/workflow').SerializedWorkflowNode}
 */
export function serializeNode(node) {
  return {
    id: String(node.id),
    type: String(node.type ?? "workflow"),
    position: {
      x: Number(node.position?.x ?? 0),
      y: Number(node.position?.y ?? 0),
    },
    data: toPlainData(node.data),
  };
}

/**
 * @param {import('reactflow').Edge} edge
 * @returns {import('../types/workflow').SerializedWorkflowEdge}
 */
export function serializeEdge(edge) {
  return {
    id: String(edge.id),
    source: String(edge.source),
    target: String(edge.target),
    sourceHandle: edge.sourceHandle ?? null,
    targetHandle: edge.targetHandle ?? null,
    type: "smoothstep",
  };
}

/**
 * @param {object} params
 * @param {import('reactflow').Node[]} params.nodes
 * @param {import('reactflow').Edge[]} params.edges
 * @param {{ x: number, y: number, zoom: number }} [params.viewport]
 * @param {string} params.name
 * @param {string} [params.status]
 * @param {number | null} [params.organizationId]
 * @returns {import('../types/workflow').MedicineWorkflowPayload}
 */
export function serializeWorkflow({
  nodes,
  edges,
  viewport,
  name,
  status = "inactive",
  organizationId = null,
}) {
  const vp = viewport ?? { x: 0, y: 0, zoom: 1 };

  const orgId =
    organizationId == null || organizationId === ""
      ? null
      : Number(organizationId);

  return {
    organization_id:
      orgId != null && Number.isFinite(orgId) && orgId > 0 ? orgId : null,
    name: String(name || "Untitled Workflow"),
    status: normalizeWorkflowStatus(status),
    configuration: {
      builderVersion: BUILDER_VERSION,
      reactFlowVersion: REACT_FLOW_VERSION,
      viewport: {
        x: Number(vp.x ?? 0),
        y: Number(vp.y ?? 0),
        zoom: Number(vp.zoom ?? 1),
      },
      nodes: (nodes || []).map(serializeNode),
      edges: (edges || []).map(serializeEdge),
    },
  };
}
