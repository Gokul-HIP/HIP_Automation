import { getStoredToken } from "@/services/authService";
import { serializeWorkflow } from "@/utils/flowSerializer";
import { extractWorkflowState } from "@/utils/flowDeserializer";
import { WORKFLOW_STATUS } from "@/utils/workflowStatus";

const BASE_URL = "https://api.healthinpocket.in/api";
const RESOURCE_PATH = "/medicine-workflows";

export class WorkflowApiError extends Error {
  /**
   * @param {string} message
   * @param {{ status?: number, type?: string, errors?: Record<string, string[]> }} [meta]
   */
  constructor(message, meta = {}) {
    super(message);
    this.name = "WorkflowApiError";
    this.status = meta.status;
    this.type = meta.type;
    this.errors = meta.errors;
  }
}

/**
 * @param {Response} response
 * @param {Record<string, unknown>} data
 */
function toWorkflowApiError(response, data) {
  const formattedErrors = Object.values(data?.errors || {})
    .flat()
    .filter(Boolean)
    .join(" ");

  const message =
    formattedErrors ||
    (typeof data?.message === "string" && data.message) ||
    (typeof data?.error === "string" && data.error) ||
    "Request failed";

  if (response.status === 401) {
    return new WorkflowApiError("Unauthorized. Please sign in again.", {
      status: 401,
      type: "unauthorized",
    });
  }

  if (response.status === 422) {
    return new WorkflowApiError(message || "Validation error. Check your workflow.", {
      status: 422,
      type: "validation",
      errors: data?.errors,
    });
  }

  if (response.status >= 500) {
    return new WorkflowApiError("Server error. Please try again later.", {
      status: response.status,
      type: "server",
    });
  }

  return new WorkflowApiError(message, {
    status: response.status,
    type: "error",
    errors: data?.errors,
  });
}

/**
 * @param {string} path
 * @param {RequestInit} [options]
 */
async function apiRequest(path, options = {}) {
  const token = getStoredToken();

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new WorkflowApiError("Network error. Check your connection and try again.", {
      type: "network",
    });
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw toWorkflowApiError(response, data);
  }

  return data;
}

/**
 * POST /medicine-workflows
 * @param {import('../types/workflow').MedicineWorkflowPayload} payload
 */
export async function saveWorkflow(payload) {
  return apiRequest(RESOURCE_PATH, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * PUT /medicine-workflows/{id}
 * @param {number | string} id
 * @param {import('../types/workflow').MedicineWorkflowPayload} payload
 */
export async function updateWorkflow(id, payload) {
  return apiRequest(`${RESOURCE_PATH}/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/**
 * GET /medicine-workflows/{id}
 * @param {number | string} id
 */
export async function getWorkflow(id) {
  return apiRequest(`${RESOURCE_PATH}/${id}`, {
    method: "GET",
  });
}

/**
 * DELETE /medicine-workflows/{id}
 * @param {number | string} id
 */
export async function deleteWorkflow(id) {
  return apiRequest(`${RESOURCE_PATH}/${id}`, {
    method: "DELETE",
  });
}

/**
 * Load and normalize workflow for React Flow.
 * @param {number | string} id
 */
export async function loadWorkflow(id) {
  const response = await getWorkflow(id);
  return extractWorkflowState(response);
}

/**
 * Publish workflow (PUT with published status).
 * @param {object} params
 * @param {number | string} [params.id]
 * @param {import('reactflow').Node[]} params.nodes
 * @param {import('reactflow').Edge[]} params.edges
 * @param {{ x: number, y: number, zoom: number }} [params.viewport]
 * @param {string} params.name
 * @param {number} [params.organizationId]
 */
export async function publishWorkflow({
  id,
  nodes,
  edges,
  viewport,
  name,
  organizationId,
}) {
  const payload = serializeWorkflow({
    nodes,
    edges,
    viewport,
    name,
    status: WORKFLOW_STATUS.ACTIVE,
    organizationId,
  });

  if (id) {
    return updateWorkflow(id, payload);
  }

  return saveWorkflow(payload);
}

/**
 * @param {Record<string, unknown>} response
 * @returns {number | string | null}
 */
export function extractWorkflowId(response) {
  const data = response?.data ?? response;
  const id = data?.id;
  return id == null ? null : id;
}

const workflowService = {
  saveWorkflow,
  updateWorkflow,
  getWorkflow,
  loadWorkflow,
  deleteWorkflow,
  publishWorkflow,
  extractWorkflowId,
  WorkflowApiError,
};

export default workflowService;
