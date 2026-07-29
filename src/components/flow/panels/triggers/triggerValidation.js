import { getTriggerSchema } from "@/components/flow/config/triggers";
import { getWorkflowNode } from "@/components/flow/config/workflowNodes";
import { findTriggerSchema } from "@/services/api/triggers";

function isEmpty(value) {
  if (typeof value === "boolean") return false;
  if (typeof value === "number") return Number.isNaN(value);
  if (Array.isArray(value)) return value.length === 0;
  return value == null || String(value).trim() === "";
}

export function isSchemaFieldVisible(field, data) {
  if (!field?.showWhen) return true;
  return Object.entries(field.showWhen).every(
    ([key, val]) => data?.[key] === val
  );
}

/**
 * Resolve trigger schema fields using the same source as the Property Panel.
 * API triggers → GET /workflow/triggers schema.
 * Catalog triggers → local trigger schema registry.
 *
 * @param {{ data?: Record<string, unknown> }} node
 * @param {{ triggers?: import('@/types/builder-api').ApiTrigger[] } | null | undefined} triggerCatalog
 */
export function resolveTriggerFieldsForNode(node, triggerCatalog = null) {
  const data = node?.data ?? {};
  const triggerKey = data.triggerKey ?? data.nodeType;

  if (data.triggerKey && triggerCatalog?.triggers?.length) {
    const apiTrigger = findTriggerSchema(triggerCatalog.triggers, String(triggerKey));
    if (apiTrigger?.schema?.fields) {
      return apiTrigger.schema.fields;
    }
  }

  const localSchema = getTriggerSchema(data.nodeType);
  return localSchema?.fields ?? [];
}

/**
 * Validate required trigger fields from schema definition only.
 *
 * @param {{ id: string, data?: Record<string, unknown> }} node
 * @param {{ triggers?: import('@/types/builder-api').ApiTrigger[] } | null | undefined} triggerCatalog
 */
export function validateTriggerNodeFields(node, triggerCatalog = null) {
  const data = node?.data ?? {};
  const def = getWorkflowNode(data.nodeType);
  const isApiTrigger = Boolean(data.triggerKey);
  const isTriggerNode =
    isApiTrigger || def?.customPanel === "trigger" || def?.isTrigger;

  if (!isTriggerNode || data.nodeType === "start") {
    return [];
  }

  const title = data.label || def?.title || "Trigger";
  const fields = resolveTriggerFieldsForNode(node, triggerCatalog);
  const issues = [];

  for (const field of fields) {
    if (field?.type === "retry") {
      if (data.repeatReminder) {
        if (isEmpty(data.retryInterval)) {
          issues.push({
            level: "error",
            message: `"${title}" → Retry Interval is required when Repeat Reminder is on.`,
            nodeId: node.id,
            field: "retryInterval",
          });
        }
        if (isEmpty(data.maxRetryCount) || Number(data.maxRetryCount) < 1) {
          issues.push({
            level: "error",
            message: `"${title}" → Maximum Retry Count must be at least 1.`,
            nodeId: node.id,
            field: "maxRetryCount",
          });
        }
      }
      continue;
    }

    if (!field?.required || !field.key) continue;
    if (!isSchemaFieldVisible(field, data)) continue;
    if (isEmpty(data[field.key])) {
      issues.push({
        level: "error",
        message: `"${title}" → ${field.label || field.key} is required.`,
        nodeId: node.id,
        field: field.key,
      });
    }
  }

  return issues;
}
