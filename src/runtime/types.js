/**
 * Runtime engine type definitions.
 * Portable contract — can be mirrored in Laravel.
 */

/** @typedef {'pending'|'running'|'completed'|'failed'|'cancelled'|'scheduled'} ExecutionStatus */

/** @typedef {'queued'|'sent'|'delivered'|'read'|'failed'|'retried'} CommunicationStatus */

/**
 * @typedef {object} ExecutionContext
 * @property {string} executionId
 * @property {string|number} workflowId
 * @property {string} workflowName
 * @property {Record<string, unknown>} triggerPayload
 * @property {Record<string, unknown>} patient
 * @property {Record<string, unknown>} doctor
 * @property {Record<string, unknown>} appointment
 * @property {Record<string, unknown>} prescription
 * @property {Record<string, unknown>} medicine
 * @property {Record<string, unknown>} hospital
 * @property {Record<string, unknown>} variables
 * @property {Record<string, unknown>} system
 */

/**
 * @typedef {object} OutgoingEdge
 * @property {string} edgeId
 * @property {string} targetId
 * @property {string|null} sourceHandle
 * @property {string|null} label
 */

/**
 * @typedef {object} ExecutionStep
 * @property {string} id
 * @property {string} nodeType
 * @property {string} category
 * @property {string|null} customPanel
 * @property {Record<string, unknown>} data
 * @property {string[]} incoming
 * @property {OutgoingEdge[]} outgoing
 * @property {boolean} isStart
 * @property {boolean} isTrigger
 * @property {boolean} isCondition
 * @property {boolean} isDelay
 * @property {boolean} isAction
 * @property {boolean} isEnd
 * @property {boolean} isLoop
 */

/**
 * @typedef {object} ExecutionGraph
 * @property {string|number|null} workflowId
 * @property {string} workflowName
 * @property {string} compiledAt
 * @property {string} entryNodeId
 * @property {ExecutionStep|null} trigger
 * @property {Record<string, ExecutionStep>} steps
 * @property {string[]} endNodeIds
 * @property {string[]} topologicalOrder
 * @property {object} metadata
 */

/**
 * @typedef {object} NodeExecutionResult
 * @property {'continue'|'branch'|'delay'|'end'|'error'} action
 * @property {string|null} [nextNodeId]
 * @property {string|null} [branchHandle]
 * @property {number|null} [delayMs]
 * @property {Record<string, unknown>} [output]
 * @property {string|null} [error]
 */

/**
 * @typedef {object} TraceEvent
 * @property {string} executionId
 * @property {string} nodeId
 * @property {string} nodeType
 * @property {string} label
 * @property {ExecutionStatus} status
 * @property {string} startedAt
 * @property {string|null} completedAt
 * @property {number|null} durationMs
 * @property {Record<string, unknown>} [detail]
 */

/**
 * @typedef {object} CommunicationLog
 * @property {string} id
 * @property {string} executionId
 * @property {string|number} workflowId
 * @property {string} nodeId
 * @property {string|null} patientId
 * @property {string} channel
 * @property {CommunicationStatus} status
 * @property {string} createdAt
 * @property {string|null} sentAt
 * @property {string|null} deliveredAt
 * @property {string|null} readAt
 * @property {number} retryCount
 * @property {string|null} error
 * @property {Record<string, unknown>} [meta]
 */

/**
 * @typedef {object} WorkflowExecutionRecord
 * @property {string} id
 * @property {string|number} workflowId
 * @property {string} workflowName
 * @property {ExecutionStatus} status
 * @property {string|null} currentNodeId
 * @property {string} startedAt
 * @property {string|null} completedAt
 * @property {number|null} durationMs
 * @property {string|null} error
 * @property {TraceEvent[]} trace
 */

export const NODE_CATEGORIES = {
  START: "start",
  TRIGGER: "triggers",
  CONDITION: "conditions",
  WAIT: "wait",
  MESSAGING: "messaging",
  DATABASE: "database",
  INTEGRATION: "integrations",
  AI: "ai",
  FLOW: "flow",
};

export const MESSAGING_NODE_TYPES = new Set([
  "sendWhatsApp",
  "sendSms",
  "sendEmail",
  "sendPush",
  "sendInApp",
  "sendTemplate",
  "sendAiChat",
  "sendAiVoice",
  "sendIvr",
]);

export const WAIT_NODE_TYPES = new Set([
  "wait",
  "delay",
  "waitUntil",
  "cronSchedule",
  "recurring",
]);

export const CONDITION_NODE_TYPES = new Set([
  "condition",
  "switch",
  "logicNot",
  "compare",
  "patientSegment",
  "disease",
  "age",
  "gender",
  "language",
  "membership",
  "paymentStatus",
  "lastVisit",
]);

export const INTEGRATION_NODE_TYPES = new Set([
  "webhook",
  "httpRequest",
  "fhir",
  "abdm",
  "paymentGateway",
  "thirdPartyApi",
]);

export const AI_NODE_TYPES = new Set([
  "aiChat",
  "aiVoice",
  "aiSummarize",
  "aiIntent",
  "aiRag",
  "aiRecommend",
  "aiSentiment",
  "aiClassify",
]);

export const DATABASE_NODE_TYPES = new Set([
  "dbCreate",
  "dbUpdate",
  "dbDelete",
  "dbQuery",
  "assignPatient",
  "updateAppointment",
  "updatePrescription",
  "updateMembership",
]);

export function createExecutionId(prefix = "exec") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function nowIso() {
  return new Date().toISOString();
}
