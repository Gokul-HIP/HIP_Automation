/**
 * Workflow Runtime Platform — public facade.
 * Wire to Laravel queue/worker in production.
 */

import { compileWorkflow } from "./compiler/WorkflowCompiler";
import { createWorkflowExecutor } from "./executor/WorkflowExecutor";
import { communicationLogStore } from "./logging/CommunicationLogStore";
import { executionTracer } from "./logging/ExecutionTracer";
import { workflowExecutionStore } from "./history/WorkflowExecutionStore";
import { createChannelManager } from "./channels/ChannelManager";
import { templateManager } from "./templates/TemplateManager";
import { variableResolver } from "./variables/VariableResolver";
import { createAnalyticsEngine } from "./analytics/AnalyticsEngine";
import { conditionEngine } from "./engines/ConditionEngine";
import { delayScheduler } from "./engines/DelayScheduler";

const channelManager = createChannelManager({ communicationLogStore });

const workflowExecutor = createWorkflowExecutor({
  executionStore: workflowExecutionStore,
  tracer: executionTracer,
  channelManager,
  templateManager,
  variableResolver,
});

const analyticsEngine = createAnalyticsEngine({
  executionStore: workflowExecutionStore,
  communicationLogStore,
});

export {
  compileWorkflow,
  workflowExecutor,
  workflowExecutionStore,
  communicationLogStore,
  executionTracer,
  channelManager,
  templateManager,
  variableResolver,
  conditionEngine,
  delayScheduler,
  analyticsEngine,
};

/**
 * Execute a workflow from builder JSON.
 * @param {object} params
 */
export async function executeWorkflow(params) {
  return workflowExecutor.run(params);
}

/**
 * Compile without executing (for inspection / Laravel handoff).
 */
export function compileWorkflowGraph(params) {
  return compileWorkflow(params);
}

/**
 * Get execution trace for debugger.
 */
export function getExecutionTrace(executionId) {
  return executionTracer.getTrace(executionId);
}

/**
 * Get analytics for a workflow.
 */
export function getWorkflowAnalytics(workflowId = null) {
  return analyticsEngine.getWorkflowMetrics(workflowId);
}
