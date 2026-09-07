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
import { conditionExecutor } from "./executor/ConditionExecutor";
import { delayScheduler } from "./engines/DelayScheduler";
import {
  evaluateJexlCondition,
  validateJexlSyntax,
  buildJexlContext,
} from "./engines/jexlCondition";
import {
  setAppointmentLookup,
  clearAppointmentLookup,
  resolveAppointmentExists,
  enrichAppointmentExists,
  isActivePatientAppointment,
} from "./services/AppointmentLookup";
import {
  cancelCampaignExecutions,
  FIRST_APPOINTMENT_NURTURING_CAMPAIGN,
  resolveCampaignFromConfig,
} from "./services/CampaignSuppression";
import {
  deriveFollowupObject,
  resolveRelativeDateTargetMs,
} from "./services/FollowupContext";
import {
  clearMessageIdempotency,
  buildMessageIdempotencyKey,
  hasSentMessage,
  markMessageSent,
} from "./services/MessageIdempotency";
import { logRuntime } from "./logging/StructuredLogger";

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
  conditionExecutor,
  evaluateJexlCondition,
  validateJexlSyntax,
  buildJexlContext,
  delayScheduler,
  analyticsEngine,
  setAppointmentLookup,
  clearAppointmentLookup,
  resolveAppointmentExists,
  enrichAppointmentExists,
  isActivePatientAppointment,
  cancelCampaignExecutions,
  FIRST_APPOINTMENT_NURTURING_CAMPAIGN,
  resolveCampaignFromConfig,
  deriveFollowupObject,
  resolveRelativeDateTargetMs,
  clearMessageIdempotency,
  buildMessageIdempotencyKey,
  hasSentMessage,
  markMessageSent,
  logRuntime,
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

/**
 * When appointmentBooked fires, cancel pending first-appointment nurturing
 * (or any campaignKey) for this patient — reusable, not workflow-id hardcoded.
 */
export function onAppointmentBooked({
  patientId,
  hospitalId = null,
  campaignKey = FIRST_APPOINTMENT_NURTURING_CAMPAIGN,
}) {
  const result = cancelCampaignExecutions({
    executionStore: workflowExecutionStore,
    patientId,
    hospitalId,
    campaignKey,
    reason: "appointment_booked",
  });
  logRuntime("campaign.cancelled", {
    patientId,
    hospitalId,
    campaignKey,
    cancelledExecutions: result.cancelled,
  });
  return result;
}
