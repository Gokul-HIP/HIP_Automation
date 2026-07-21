import { createExecutionId, nowIso } from "../types";

/**
 * Workflow execution history store.
 */
export class WorkflowExecutionStore {
  constructor() {
    /** @type {Map<string, import('../types').WorkflowExecutionRecord>} */
    this.executions = new Map();
  }

  create({ workflowId, workflowName }) {
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

  list({ workflowId = null, status = null } = {}) {
    return [...this.executions.values()].filter((e) => {
      if (workflowId && String(e.workflowId) !== String(workflowId)) return false;
      if (status && e.status !== status) return false;
      return true;
    });
  }
}

export const workflowExecutionStore = new WorkflowExecutionStore();
