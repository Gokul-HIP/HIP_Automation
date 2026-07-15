/**
 * Workflow service stubs — prepare API surface only.
 * Do not implement Laravel / fetch calls here yet.
 */

export async function listWorkflows() {
  // TODO: GET /api/workflows
  return [];
}

export async function getWorkflow(_workflowId) {
  // TODO: GET /api/workflows/:id
  return null;
}

export async function saveWorkflow(payload) {
  // TODO: PUT /api/workflows/:id
  return { ok: true, payload };
}

export async function publishWorkflow(payload) {
  // TODO: POST /api/workflows/:id/publish
  return { ok: true, payload };
}

export async function validateWorkflowRemote(_payload) {
  // TODO: POST /api/workflows/:id/validate
  return { valid: true, issues: [] };
}

export async function deleteWorkflow(_workflowId) {
  // TODO: DELETE /api/workflows/:id
  return { ok: true };
}

const workflowService = {
  listWorkflows,
  getWorkflow,
  saveWorkflow,
  publishWorkflow,
  validateWorkflowRemote,
  deleteWorkflow,
};

export default workflowService;
