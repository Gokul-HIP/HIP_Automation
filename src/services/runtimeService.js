/**
 * Runtime service — client/server facade for workflow execution.
 * Uses in-memory engine; swap stores for Laravel API calls in production.
 */

import {
  executeWorkflow,
  compileWorkflowGraph,
  getExecutionTrace,
  getWorkflowAnalytics,
  workflowExecutionStore,
  communicationLogStore,
} from "@/runtime";

/**
 * Run a workflow from saved configuration JSON.
 * @param {object} params
 * @param {import('@/types/workflow').WorkflowConfiguration} params.configuration
 * @param {string|number} params.workflowId
 * @param {string} params.workflowName
 * @param {Record<string, unknown>} [params.context]
 */
export async function runWorkflow(params) {
  const ctx = params.context ?? {};
  return executeWorkflow({
    configuration: params.configuration,
    workflowId: params.workflowId,
    workflowName: params.workflowName,
    triggerPayload: ctx.triggerPayload ?? {},
    patient: ctx.patient ?? {},
    doctor: ctx.doctor ?? {},
    appointment: ctx.appointment ?? {},
    prescription: ctx.prescription ?? {},
    medicine: ctx.medicine ?? {},
    hospital: ctx.hospital ?? {},
  });
}

export function compileWorkflow(params) {
  return compileWorkflowGraph(params);
}

export function fetchExecution(executionId) {
  return workflowExecutionStore.get(executionId);
}

export function listExecutions(workflowId = null) {
  return workflowExecutionStore.list({ workflowId });
}

export function fetchExecutionTrace(executionId) {
  return getExecutionTrace(executionId);
}

export function fetchCommunicationLogs(filters = {}) {
  return communicationLogStore.list(filters);
}

export function fetchAnalytics(workflowId = null) {
  return getWorkflowAnalytics(workflowId);
}
