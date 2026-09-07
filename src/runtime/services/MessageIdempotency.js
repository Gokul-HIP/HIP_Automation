/**
 * In-memory message idempotency (swap for Redis/DB in Laravel).
 * Key must NOT be message body alone.
 */

/** @type {Set<string>} */
const sentKeys = new Set();

/**
 * @param {object} parts
 * @param {string|number} parts.workflowId
 * @param {string} parts.executionId
 * @param {string|null} parts.patientId
 * @param {string} parts.nodeId
 * @param {string|null} [parts.campaignStep]
 * @param {string|null} [parts.scheduledPeriod]
 */
export function buildMessageIdempotencyKey({
  workflowId,
  executionId,
  patientId,
  nodeId,
  campaignStep = null,
  scheduledPeriod = null,
}) {
  return [
    workflowId ?? "",
    executionId ?? "",
    patientId ?? "",
    nodeId ?? "",
    campaignStep ?? "",
    scheduledPeriod ?? "",
  ].join(":");
}

export function hasSentMessage(key) {
  return sentKeys.has(String(key));
}

export function markMessageSent(key) {
  sentKeys.add(String(key));
}

export function clearMessageIdempotency() {
  sentKeys.clear();
}
