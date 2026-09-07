/**
 * Campaign / nurturing suppression helpers.
 * Cancels pending executions when a patient books (appointmentBooked),
 * without hardcoding a workflow ID.
 */

import { delayScheduler } from "../engines/DelayScheduler";
import { nowIso } from "../types";

/** Default campaign key for first-appointment nurturing workflows. */
export const FIRST_APPOINTMENT_NURTURING_CAMPAIGN = "first_appointment_nurturing";

/**
 * @param {object} configuration
 * @param {Record<string, unknown>} [triggerPayload]
 */
export function resolveCampaignFromConfig(configuration = {}, triggerPayload = {}) {
  const key =
    configuration.campaignKey ||
    configuration.campaign_key ||
    configuration.meta?.campaignKey ||
    triggerPayload.campaign_key ||
    triggerPayload.campaignKey ||
    null;

  if (!key) return null;

  const suppress =
    configuration.suppressOnAppointment !== false &&
    configuration.suppress_on_appointment !== false &&
    triggerPayload.suppress_on_appointment !== false;

  return {
    key: String(key),
    suppressOnAppointment: Boolean(suppress),
  };
}

/**
 * Cancel scheduled/running executions for a patient+campaign when they book.
 *
 * @param {object} params
 * @param {import('../history/WorkflowExecutionStore').WorkflowExecutionStore} params.executionStore
 * @param {string|number|null} params.patientId
 * @param {string|number|null} [params.hospitalId]
 * @param {string|null} [params.campaignKey] — defaults to first_appointment_nurturing when omitted for booking events
 * @param {string} [params.reason]
 * @returns {{ cancelled: string[] }}
 */
export function cancelCampaignExecutions({
  executionStore,
  patientId,
  hospitalId = null,
  campaignKey = FIRST_APPOINTMENT_NURTURING_CAMPAIGN,
  reason = "appointment_booked",
}) {
  const pid = patientId != null ? String(patientId) : null;
  if (!pid || !executionStore) {
    return { cancelled: [] };
  }

  const cancelled = [];
  const targets = executionStore.list({}).filter((exec) => {
    if (exec.status !== "scheduled" && exec.status !== "running" && exec.status !== "pending") {
      return false;
    }
    if (String(exec.patientId ?? "") !== pid) return false;
    if (
      hospitalId != null &&
      exec.hospitalId != null &&
      String(exec.hospitalId) !== String(hospitalId)
    ) {
      return false;
    }
    if (campaignKey && String(exec.campaignKey ?? "") !== String(campaignKey)) {
      return false;
    }
    return true;
  });

  for (const exec of targets) {
    if (exec.delayJobId) {
      delayScheduler.cancel(exec.delayJobId);
    }
    delayScheduler.cancelByExecutionId(exec.id);
    executionStore.update(exec.id, {
      status: "cancelled",
      completedAt: nowIso(),
      error: null,
      cancelReason: reason,
      currentNodeId: null,
      delayJobId: null,
    });
    cancelled.push(exec.id);
  }

  return { cancelled };
}
