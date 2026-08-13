/**
 * Aggregates metrics from execution and communication stores.
 */
export class AnalyticsEngine {
  constructor({ executionStore, communicationLogStore }) {
    this.executionStore = executionStore;
    this.communicationLogStore = communicationLogStore;
  }

  getWorkflowMetrics(workflowId = null) {
    const executions = this.executionStore.list({ workflowId });
    const logs = this.communicationLogStore.list({ workflowId });

    const completed = executions.filter((e) => e.status === "completed");
    const failed = executions.filter((e) => e.status === "failed");
    const messagesSent = logs.filter((l) => l.status === "sent" || l.status === "delivered");
    const messagesFailed = logs.filter((l) => l.status === "failed");
    const retried = logs.filter((l) => l.retryCount > 0);

    const durations = completed
      .map((e) => e.durationMs)
      .filter((d) => typeof d === "number");

    const avgDuration =
      durations.length > 0
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
        : 0;

    const totalRuns = executions.length;
    const successRate = totalRuns ? Math.round((completed.length / totalRuns) * 100) : 0;
    const failureRate = totalRuns ? Math.round((failed.length / totalRuns) * 100) : 0;

    return {
      workflowId,
      totalRuns,
      successRate,
      failureRate,
      averageDurationMs: avgDuration,
      messagesSent: messagesSent.length,
      messagesFailed: messagesFailed.length,
      retryCount: retried.length,
      completed: completed.length,
      failed: failed.length,
    };
  }

  getGlobalMetrics() {
    return this.getWorkflowMetrics(null);
  }
}

export const createAnalyticsEngine = (deps) => new AnalyticsEngine(deps);
