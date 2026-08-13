import { nowIso } from "../types";

/**
 * Execution tracer for debugger UI and audit trail.
 */
export class ExecutionTracer {
  constructor() {
    /** @type {Map<string, import('../types').TraceEvent[]>} */
    this.traces = new Map();
  }

  start(executionId, nodeId, nodeType, label) {
    const events = this.traces.get(executionId) ?? [];
    events.push({
      executionId,
      nodeId,
      nodeType,
      label,
      status: "running",
      startedAt: nowIso(),
      completedAt: null,
      durationMs: null,
    });
    this.traces.set(executionId, events);
    return events[events.length - 1];
  }

  complete(executionId, nodeId, detail = {}) {
    const events = this.traces.get(executionId) ?? [];
    const event = events.find((e) => e.nodeId === nodeId && !e.completedAt);
    if (!event) return null;

    event.completedAt = nowIso();
    event.status = detail.error ? "failed" : "completed";
    event.durationMs = new Date(event.completedAt).getTime() - new Date(event.startedAt).getTime();
    event.detail = detail;
    return event;
  }

  getTrace(executionId) {
    return this.traces.get(executionId) ?? [];
  }

  clear(executionId) {
    this.traces.delete(executionId);
  }
}

export const executionTracer = new ExecutionTracer();
