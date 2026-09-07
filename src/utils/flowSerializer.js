/**
 * Converts React Flow state into Laravel medicine-workflows JSON.
 * Never serializes functions, JSX, or React components.
 */

import { normalizeWorkflowStatus } from "./workflowStatus";
import { normalizeOrganizationId, normalizeUserId } from "./organization";
import { normalizeConditionNodeData } from "./conditionNodeSerialization";
import { normalizeMedicineReminderData } from "@/components/flow/config/triggers";
import { stripUiStartFromGraph } from "./flowEditorLifecycle";

const BUILDER_VERSION = "1";
const REACT_FLOW_VERSION = "12.x";

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
  let data = normalizeConditionNodeData(toPlainData(node.data));
  if (data?.nodeType === "medicineReminder") {
    data = normalizeMedicineReminderData(data);
  }
  return {
    id: String(node.id),
    type: String(node.type ?? "workflow"),
    position: {
      x: Number(node.position?.x ?? 0),
      y: Number(node.position?.y ?? 0),
    },
    data,
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
 * @param {number | string | null} [params.organizationId]
 * @param {number | string | null} [params.hospitalId]
 * @param {string | number | null} [params.createdBy]
 * @returns {import('../types/workflow').MedicineWorkflowPayload}
 */
export function serializeWorkflow({
  nodes,
  edges,
  viewport,
  name,
  status = "inactive",
  organizationId = null,
  hospitalId = null,
  createdBy = null,
  campaignKey = null,
  suppressOnAppointment = null,
}) {
  const vp = viewport ?? { x: 0, y: 0, zoom: 1 };
  const orgId = normalizeOrganizationId(organizationId);
  const hospId = normalizeOrganizationId(hospitalId);
  const createdById = normalizeUserId(createdBy);

  const { nodes: payloadNodes, edges: payloadEdges } = stripUiStartFromGraph(
    nodes,
    edges
  );

  /** @type {import('../types/workflow').MedicineWorkflowPayload} */
  const payload = {
    organization_id: orgId != null ? Number(orgId) : null,
    hospital_id: hospId != null ? Number(hospId) : null,
    created_by: createdById,
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
      ...(campaignKey != null && String(campaignKey).trim() !== ""
        ? { campaignKey: String(campaignKey).trim() }
        : {}),
      ...(suppressOnAppointment != null
        ? { suppressOnAppointment: Boolean(suppressOnAppointment) }
        : {}),
      nodes: payloadNodes.map(serializeNode),
      edges: payloadEdges.map(serializeEdge),
    },
  };

  return payload;
}
