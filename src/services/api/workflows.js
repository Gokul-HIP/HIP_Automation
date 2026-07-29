import { apiClient, unwrapData } from "./client";
import { extractWorkflowState } from "@/utils/flowDeserializer";
import { normalizeConditionNodeData } from "@/utils/conditionNodeSerialization";
import { normalizeMedicineReminderData } from "@/components/flow/config/triggers";
import {
  normalizeWorkflowList,
  normalizeWorkflowRow,
} from "@/utils/workflowList";

const BUILDER_VERSION = "1";
const REACT_FLOW_VERSION = "12.x";

/**
 * Workflow Start is frontend-only decoration.
 * Strip start nodes and any edges connected to them before Laravel save/publish.
 * @param {import('reactflow').Node[]} nodes
 * @param {import('reactflow').Edge[]} edges
 */
export function stripFrontendStartNodes(nodes = [], edges = []) {
  const startIds = new Set(
    (nodes || [])
      .filter((node) => node?.data?.nodeType === "start")
      .map((node) => String(node.id))
  );

  if (!startIds.size) {
    return { nodes: nodes || [], edges: edges || [] };
  }

  return {
    nodes: (nodes || []).filter((node) => !startIds.has(String(node.id))),
    edges: (edges || []).filter(
      (edge) =>
        !startIds.has(String(edge.source)) && !startIds.has(String(edge.target))
    ),
  };
}

/**
 * Build payload from React Flow state for Laravel Builder Connect APIs.
 * Does not mutate node.data; strips frontend-only start decoration.
 * @param {object} params
 */
export function buildWorkflowPayload({
  name,
  nodes,
  edges,
  viewport,
  status,
  module: moduleName,
  triggerKey,
  organizationId,
  createdBy,
  ...rest
}) {
  const { nodes: serializedNodes, edges: serializedEdges } =
    stripFrontendStartNodes(nodes, edges);

  return {
    name: String(name || "Untitled Workflow"),
    ...(status != null ? { status } : {}),
    ...(moduleName != null ? { module: moduleName } : {}),
    ...(triggerKey != null ? { trigger: triggerKey } : {}),
    ...(organizationId != null ? { organization_id: organizationId } : {}),
    ...(createdBy != null ? { created_by: createdBy } : {}),
    configuration: {
      builderVersion: BUILDER_VERSION,
      reactFlowVersion: REACT_FLOW_VERSION,
      viewport: viewport ?? { x: 0, y: 0, zoom: 1 },
      nodes: serializedNodes.map((node) => {
        let data = normalizeConditionNodeData(node.data ?? {});
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
      }),
      edges: serializedEdges.map((edge) => ({
        id: String(edge.id),
        source: String(edge.source),
        target: String(edge.target),
        sourceHandle: edge.sourceHandle ?? null,
        targetHandle: edge.targetHandle ?? null,
        type: edge.type ?? "smoothstep",
      })),
    },
    ...rest,
  };
}

export async function fetchWorkflows(params = {}) {
  const query = {};
  if (params.search) query.search = params.search;
  if (params.status && params.status !== "all") query.status = params.status;
  if (params.page) query.page = params.page;
  if (params.perPage) query.per_page = params.perPage;
  if (params.sort === "newest") query.sort = "-updated_at";
  if (params.sort === "oldest") query.sort = "updated_at";

  const response = await apiClient.get("/workflows", { params: query });
  const normalized = normalizeWorkflowList(response.data);

  return {
    ...normalized,
    items: normalized.items.map(normalizeWorkflowRow),
    raw: response.data,
  };
}

export async function fetchWorkflow(id) {
  const response = await apiClient.get(`/workflows/${id}`);
  return response.data;
}

export async function createWorkflow(payload) {
  const response = await apiClient.post("/workflows", payload);
  return response.data;
}

export async function updateWorkflow(id, payload) {
  const response = await apiClient.put(`/workflows/${id}`, payload);
  return response.data;
}

export async function deleteWorkflow(id) {
  const response = await apiClient.delete(`/workflows/${id}`);
  return response.data;
}

export async function publishWorkflow(id) {
  const response = await apiClient.post(`/workflows/${id}/publish`);
  return response.data;
}

export async function loadWorkflowForBuilder(id) {
  const response = await fetchWorkflow(id);
  return extractWorkflowState(response);
}

export function extractWorkflowId(response) {
  const data = unwrapData(response);
  const id = data?.id ?? response?.id;
  return id == null ? null : id;
}
