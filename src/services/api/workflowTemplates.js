import { apiClient, unwrapData } from "./client";
import { deserializeWorkflow } from "@/utils/flowDeserializer";
import {
  extractWorkflowGraph,
  graphNodeEdgeCounts,
} from "@/utils/extractWorkflowGraph";
import { ensureUiStartNode } from "@/utils/flowEditorLifecycle";
import { normalizeWorkflowStatus } from "@/utils/workflowStatus";
import {
  buildWorkflowPayload,
  extractWorkflowId,
} from "./workflows";
import {
  normalizeWorkflowList,
} from "@/utils/workflowList";

/** Frontend catalog (active only). */
const CATALOG_BASE = "/workflow-templates";
/** Admin CRUD (Template Mode / Backend Admin). */
const ADMIN_BASE = "/admin/workflow-templates";

/**
 * Build POST/PUT payload for workflow-templates.
 * definition is the same React Flow JSON shape as workflow configuration.
 */
export function buildTemplatePayload({
  name,
  description = null,
  status = "active",
  nodes,
  edges,
  viewport,
  organizationId,
}) {
  const workflowShaped = buildWorkflowPayload({
    name,
    nodes,
    edges,
    viewport,
    status,
    organizationId,
  });

  const triggerNode = (nodes || []).find((n) => {
    const type = n?.data?.nodeType;
    if (!type || type === "start") return false;
    return Boolean(
      n?.data?.isTrigger ||
        n?.data?.triggerKey ||
        n?.data?.category === "triggers"
    );
  });

  const triggerType =
    triggerNode?.data?.triggerKey ??
    triggerNode?.data?.nodeType ??
    null;

  return {
    name: workflowShaped.name,
    description: description || null,
    module:
      triggerNode?.data?.module ??
      workflowShaped.module ??
      "general",
    trigger_type: triggerType,
    trigger_label:
      triggerNode?.data?.label ??
      triggerNode?.data?.triggerLabel ??
      null,
    status: status || "active",
    definition: workflowShaped.configuration,
    ...(organizationId != null
      ? { organization_id: Number(organizationId) }
      : {}),
  };
}

export function normalizeTemplateRow(item) {
  return {
    id: item.id,
    name: String(item.name || "Untitled Template"),
    module: item.module ?? "—",
    trigger:
      item.trigger_label ||
      item.trigger_type ||
      item.trigger ||
      "—",
    triggerType: item.trigger_type ?? null,
    nodeCount: Number(item.node_count ?? 0),
    edgeCount: Number(item.edge_count ?? 0),
    status: String(item.status || "active"),
    description: item.description ?? null,
    createdAt: item.created_at ?? null,
    updatedAt: item.updated_at ?? null,
  };
}

/** Active templates for Create Workflow → Use Template. */
export async function fetchWorkflowTemplates(params = {}) {
  const query = {};
  if (params.search) query.search = params.search;
  if (params.module && params.module !== "all") query.module = params.module;
  if (params.page) query.page = params.page;
  if (params.perPage) query.per_page = params.perPage;

  const response = await apiClient.get(CATALOG_BASE, { params: query });
  const normalized = normalizeWorkflowList(response.data);

  return {
    ...normalized,
    items: normalized.items.map(normalizeTemplateRow),
    raw: response.data,
  };
}

/** Admin list (all statuses). */
export async function fetchAdminWorkflowTemplates(params = {}) {
  const query = {};
  if (params.search) query.search = params.search;
  if (params.module && params.module !== "all") query.module = params.module;
  if (params.status && params.status !== "all") query.status = params.status;
  if (params.page) query.page = params.page;
  if (params.perPage) query.per_page = params.perPage;

  const response = await apiClient.get(ADMIN_BASE, { params: query });
  const normalized = normalizeWorkflowList(response.data);

  return {
    ...normalized,
    items: normalized.items.map(normalizeTemplateRow),
    raw: response.data,
  };
}

export async function fetchWorkflowTemplate(id, { admin = false } = {}) {
  const base = admin ? ADMIN_BASE : CATALOG_BASE;
  const response = await apiClient.get(`${base}/${id}`);
  return response.data;
}

export async function createWorkflowTemplate(payload) {
  const response = await apiClient.post(ADMIN_BASE, payload);
  return response.data;
}

export async function updateWorkflowTemplate(id, payload) {
  const response = await apiClient.put(`${ADMIN_BASE}/${id}`, payload);
  return response.data;
}

export async function deleteWorkflowTemplate(id) {
  const response = await apiClient.delete(`${ADMIN_BASE}/${id}`);
  return response.data;
}

export async function duplicateWorkflowTemplate(id) {
  const response = await apiClient.post(`${ADMIN_BASE}/${id}/duplicate`);
  return response.data;
}

export async function previewWorkflowTemplate(id) {
  const response = await apiClient.get(`${CATALOG_BASE}/${id}/preview`);
  return unwrapData(response.data);
}

export async function loadTemplateForBuilder(id, { admin = false } = {}) {
  const response = await fetchWorkflowTemplate(id, { admin });
  const data = unwrapData(response);
  const { graph, field } = extractWorkflowGraph(data);
  const { nodeCount, edgeCount } = graphNodeEdgeCounts(graph);

  if (!graph || (nodeCount === 0 && edgeCount === 0)) {
    console.warn(
      "[workflow-templates] Empty or null definition from API. " +
        `Expected GET ${admin ? "/api/admin" : "/api"}/workflow-templates/${id} ` +
        "to return data.definition.nodes / data.definition.edges.",
      { id, field, response, data }
    );
  }

  const { nodes, edges, viewport } = deserializeWorkflow(graph);
  const hydrated = ensureUiStartNode(nodes, edges);

  return {
    id: data?.id ?? null,
    name: data?.name ?? "Untitled Template",
    description: data?.description ?? null,
    status: normalizeWorkflowStatus(data?.status) || data?.status || "active",
    module: data?.module ?? null,
    triggerType: data?.trigger_type ?? null,
    triggerLabel: data?.trigger_label ?? null,
    organizationId: data?.organization_id ?? null,
    nodeCount: data?.node_count ?? hydrated.nodes.length,
    edgeCount: data?.edge_count ?? hydrated.edges.length,
    nodes: hydrated.nodes,
    edges: hydrated.edges,
    viewport,
    definitionField: field,
  };
}

export async function loadTemplatePreviewForBuilder(id) {
  const preview = await previewWorkflowTemplate(id);
  const { nodes, edges, viewport } = deserializeWorkflow(preview?.definition);
  const hydrated = ensureUiStartNode(nodes, edges);

  return {
    id,
    name: preview?.name ?? "Template preview",
    description: null,
    status: "active",
    module: preview?.module ?? null,
    triggerType: preview?.trigger?.type ?? null,
    triggerLabel: preview?.trigger?.label ?? null,
    nodeCount: preview?.node_count ?? hydrated.nodes.length,
    edgeCount: preview?.edge_count ?? hydrated.edges.length,
    nodes: hydrated.nodes,
    edges: hydrated.edges,
    viewport,
  };
}

/**
 * Deep-clone a blueprint into a NEW workflow canvas seed (copy-not-link).
 */
export async function cloneTemplateIntoWorkflowSeed(templateId) {
  const state = await loadTemplateForBuilder(templateId, { admin: false });
  const nodes = structuredClone(state.nodes ?? []);
  const edges = structuredClone(state.edges ?? []);
  const viewport = structuredClone(
    state.viewport ?? { x: 0, y: 0, zoom: 1 }
  );

  return {
    id: null,
    name: state.name ? String(state.name) : "Hospital workflow",
    description: state.description ?? null,
    status: "inactive",
    module: state.module ?? null,
    triggerType: state.triggerType ?? null,
    triggerLabel: state.triggerLabel ?? null,
    organizationId: state.organizationId ?? null,
    nodeCount: state.nodeCount ?? nodes.length,
    edgeCount: state.edgeCount ?? edges.length,
    nodes,
    edges,
    viewport,
    sourceTemplateId: templateId,
  };
}

export function extractTemplateId(response) {
  return extractWorkflowId(response);
}
