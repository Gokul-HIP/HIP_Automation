import { createExecutionId, nowIso } from "../types";

/**
 * Workflow execution history store.
 */
export class WorkflowExecutionStore {
  constructor() {
    /** @type {Map<string, import('../types').WorkflowExecutionRecord>} */
    this.executions = new Map();
  }

  create({
    workflowId,
    workflowName,
    patientId = null,
    hospitalId = null,
    campaignKey = null,
  }) {
    const id = createExecutionId("exec");
    const record = {
      id,
      workflowId,
      workflowName,
      status: "pending",
      currentNodeId: null,
      startedAt: nowIso(),
      completedAt: null,
      durationMs: null,
      error: null,
      cancelReason: null,
      patientId: patientId != null ? String(patientId) : null,
      hospitalId: hospitalId != null ? String(hospitalId) : null,
      campaignKey: campaignKey != null ? String(campaignKey) : null,
      delayJobId: null,
      resumeAt: null,
      trace: [],
    };
    this.executions.set(id, record);
    return record;
  }

  update(id, patch) {
    const record = this.executions.get(id);
    if (!record) return null;
    Object.assign(record, patch);
    this.executions.set(id, record);
    return record;
  }

  get(id) {
    return this.executions.get(id) ?? null;
  }

  list({ workflowId = null, status = null, patientId = null, campaignKey = null } = {}) {
    return [...this.executions.values()].filter((e) => {
      if (workflowId && String(e.workflowId) !== String(workflowId)) return false;
      if (status && e.status !== status) return false;
      if (patientId && String(e.patientId ?? "") !== String(patientId)) return false;
      if (campaignKey && String(e.campaignKey ?? "") !== String(campaignKey)) return false;
      return true;
    });
  }

  clear() {
    this.executions.clear();
  }
}

export const workflowExecutionStore = new WorkflowExecutionStore();
