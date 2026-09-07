/**
 * Non-blocking delay scheduler.
 * Returns control immediately; resumes via callback / job id.
 * In production, swap with Laravel queue / Redis scheduler.
 */

import { resolveRelativeDateTargetMs } from "../services/FollowupContext";

export class DelayScheduler {
  constructor() {
    /** @type {Map<string, {timeoutId: *, resumeAt: string, nodeId: string}>} */
    this.jobs = new Map();
  }

  /**
   * Calculate delay in milliseconds from wait node data.
   * @param {Record<string, unknown>} data
   * @param {Record<string, unknown>} [context] required for relative_date
   */
  calculateDelayMs(data, context = {}) {
    const nodeType = data.nodeType;
    const waitType = String(data.waitType || "");

    if (nodeType === "waitUntil" || waitType === "until") {
      const target = new Date(String(data.untilDate ?? "")).getTime();
      if (Number.isFinite(target)) {
        return Math.max(0, target - Date.now());
      }
      return 0;
    }

    if (waitType === "relative_date") {
      const targetMs = resolveRelativeDateTargetMs(data, context);
      if (targetMs == null) {
        // Missing follow-up date — continue immediately; condition nodes should gate earlier.
        return 0;
      }
      return Math.max(0, targetMs - Date.now());
    }

    if (nodeType === "cronSchedule" || waitType === "cron") {
      // Stub: next run in 1 hour for dev; Laravel cron handles real scheduling
      return 60 * 60 * 1000;
    }

    if (nodeType === "recurring" || waitType === "recurring") {
      const map = { daily: 86400000, weekly: 604800000, monthly: 2592000000 };
      return map[data.recurringInterval] ?? 86400000;
    }

    const amount = Number(data.amount ?? 1);
    const unit = String(data.unit ?? "minutes");
    const multipliers = {
      minutes: 60 * 1000,
      hours: 60 * 60 * 1000,
      days: 24 * 60 * 60 * 1000,
      weeks: 7 * 24 * 60 * 60 * 1000,
    };
    return amount * (multipliers[unit] ?? multipliers.minutes);
  }

  /**
   * Schedule a delayed continuation.
   * @param {object} params
   */
  schedule({ jobId, nodeId, executionId = null, delayMs, onResume }) {
    const resumeAt = new Date(Date.now() + delayMs).toISOString();

    if (typeof window === "undefined" && delayMs > 0) {
      this.jobs.set(jobId, {
        timeoutId: null,
        resumeAt,
        nodeId,
        executionId,
        delayMs,
      });
      return { jobId, resumeAt, delayMs, deferred: true };
    }

    const timeoutId = setTimeout(async () => {
      this.jobs.delete(jobId);
      await onResume();
    }, delayMs);

    this.jobs.set(jobId, {
      timeoutId,
      resumeAt,
      nodeId,
      executionId,
      delayMs,
    });
    return { jobId, resumeAt, delayMs, deferred: false };
  }

  cancel(jobId) {
    const job = this.jobs.get(jobId);
    if (job?.timeoutId) clearTimeout(job.timeoutId);
    this.jobs.delete(jobId);
  }

  /**
   * Cancel all pending delay jobs for an execution.
   * @param {string} executionId
   */
  cancelByExecutionId(executionId) {
    if (!executionId) return;
    for (const [jobId, job] of this.jobs.entries()) {
      if (String(job.executionId) === String(executionId)) {
        this.cancel(jobId);
      }
    }
  }

  listPending() {
    return [...this.jobs.entries()].map(([id, job]) => ({
      jobId: id,
      ...job,
    }));
  }
}

export const delayScheduler = new DelayScheduler();
