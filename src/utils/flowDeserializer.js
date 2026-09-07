/**
 * Restores React Flow state from Laravel medicine-workflows configuration.
 */

import { normalizeWorkflowStatus } from "./workflowStatus";
import { stripUiStartFromGraph } from "./flowEditorLifecycle";
import { hydrateConditionNodeForEditor } from "./conditionNodeSerialization";
import { normalizeMedicineReminderData } from "@/components/flow/config/triggers";

/**
 * @param {Record<string, unknown> | null | undefined} configuration
 */
export function readCampaignFields(configuration) {
  if (!configuration || typeof configuration !== "object") {
    return { campaignKey: "", suppressOnAppointment: false };
  }
  const keyRaw =
    configuration.campaignKey ?? configuration.campaign_key ?? "";
  const campaignKey = keyRaw != null ? String(keyRaw).trim() : "";
  const suppressRaw =
    configuration.suppressOnAppointment ??
    configuration.suppress_on_appointment;
  return {
    campaignKey,
    suppressOnAppointment:
      suppressRaw == null ? false : Boolean(suppressRaw),
  };
}

/**
 * @param {import('../types/workflow').SerializedWorkflowNode} node
 * @returns {import('reactflow').Node}
 */
export function deserializeNode(node) {
  const restored = {
    id: String(node.id),
    type: String(node.type || "workflow"),
    position: {
      x: Number(node.position?.x ?? 0),
      y: Number(node.position?.y ?? 0),
    },
    data: node.data ?? {},
    dragHandle: ".nodeDragHandle",
    selected: false,
  };
  const withCondition = hydrateConditionNodeForEditor(restored);
  if (withCondition.data?.nodeType === "medicineReminder") {
    return {
      ...withCondition,
      data: normalizeMedicineReminderData(withCondition.data),
    };
  }
  return withCondition;
}

/**
 * @param {import('../types/workflow').SerializedWorkflowEdge} edge
 * @returns {import('reactflow').Edge}
 */
export function deserializeEdge(edge) {
  return {
    id: String(edge.id),
    source: String(edge.source),
    target: String(edge.target),
    sourceHandle: edge.sourceHandle ?? null,
    targetHandle: edge.targetHandle ?? null,
    type: "custom",
    animated: true,
  };
}

/**
 * @param {import('../types/workflow').WorkflowConfiguration | null | undefined} configuration
 */
export function deserializeWorkflow(configuration) {
  if (!configuration) {
    return {
      nodes: [],
      edges: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      campaignKey: "",
      suppressOnAppointment: false,
    };
  }

  const campaign = readCampaignFields(configuration);

  return {
    nodes: (configuration.nodes || []).map(deserializeNode),
    edges: (configuration.edges || []).map(deserializeEdge),
    viewport: {
      x: Number(configuration.viewport?.x ?? 0),
      y: Number(configuration.viewport?.y ?? 0),
      zoom: Number(configuration.viewport?.zoom ?? 1),
    },
    campaignKey: campaign.campaignKey,
    suppressOnAppointment: campaign.suppressOnAppointment,
  };
}

/**
 * @param {import('../types/workflow').MedicineWorkflowResponse | Record<string, unknown>} response
 */
export function extractWorkflowState(response) {
  const data = response?.data ?? response;
  const configuration = data?.configuration;

  const { nodes, edges, viewport, campaignKey, suppressOnAppointment } =
    deserializeWorkflow(configuration);
  const normalized = stripUiStartFromGraph(nodes, edges);

  return {
    id: data?.id ?? null,
    name: data?.name ?? "Hospital workflow",
    status: normalizeWorkflowStatus(data?.status),
    organizationId: data?.organization_id ?? null,
    hospitalId: data?.hospital_id ?? null,
    createdBy: data?.created_by ?? null,
    campaignKey: campaignKey || "",
    suppressOnAppointment: Boolean(suppressOnAppointment),
    nodes: normalized.nodes,
    edges: normalized.edges,
    viewport,
  };
}
