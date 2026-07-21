import { createExecutionId, nowIso } from "../types";

/**
 * In-memory communication log store.
 * Replace with Laravel CommunicationLog model in production.
 */
export class CommunicationLogStore {
  constructor() {
    /** @type {import('../types').CommunicationLog[]} */
    this.logs = [];
  }

  create(log) {
    this.logs.push({ ...log });
    return log;
  }

  update(id, patch) {
    const idx = this.logs.findIndex((l) => l.id === id);
    if (idx === -1) return null;
    this.logs[idx] = { ...this.logs[idx], ...patch };
    return this.logs[idx];
  }

  list({ executionId = null, workflowId = null, patientId = null } = {}) {
    return this.logs.filter((l) => {
      if (executionId && l.executionId !== executionId) return false;
      if (workflowId && String(l.workflowId) !== String(workflowId)) return false;
      if (patientId && l.patientId !== patientId) return false;
      return true;
    });
  }
}

export const communicationLogStore = new CommunicationLogStore();
