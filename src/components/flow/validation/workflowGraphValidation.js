import { getWorkflowNode } from "../config/workflowNodes";
import { getMessagingFieldErrors } from "../panels/messaging/messagingUx";
import { validateTriggerNodeFields } from "../panels/triggers/triggerValidation";
import { validateConditionNodeFields } from "../panels/conditions/conditionValidation";
import { validateDbDeleteNodeFields } from "../panels/database/dbDeleteValidation";

function isEmpty(value) {
  if (typeof value === "boolean") return false;
  if (typeof value === "number") return Number.isNaN(value);
  if (Array.isArray(value)) return value.length === 0;
  return value == null || String(value).trim() === "";
}

/**
 * Validate a React Flow workflow graph for publish/save.
 * @param {import('reactflow').Node[]} nodes
 * @param {import('reactflow').Edge[]} edges
 * @param {object} [options]
 */
export function validateWorkflowGraph(nodes, edges, options = {}) {
  const {
    triggerCatalog = null,
    campaignKey = null,
    suppressOnAppointment = null,
  } = options;
  const issues = [];

  if (!nodes.length) {
    issues.push({ level: "error", message: "Workflow has no nodes." });
    return { valid: false, issues };
  }

  const startNodes = nodes.filter((n) => n.data?.nodeType === "start");
  if (startNodes.length > 1) {
    issues.push({ level: "warning", message: "Multiple start nodes detected." });
  }

  const eventTriggers = nodes.filter((n) => {
    const def = getWorkflowNode(n.data?.nodeType);
    return (def?.isTrigger || n.data?.triggerKey) && n.data?.nodeType !== "start";
  });
  if (eventTriggers.length === 0) {
    issues.push({
      level: "error",
      message: "Add exactly one event trigger (e.g. Medicine Reminder Due).",
    });
  } else if (eventTriggers.length > 1) {
    issues.push({
      level: "error",
      message: "Only one event trigger is allowed per workflow.",
    });
  }

  const endNodes = nodes.filter((n) => n.data?.nodeType === "end");
  if (endNodes.length === 0) {
    issues.push({ level: "error", message: "Add at least one End node." });
  }

  const connected = new Set();
  edges.forEach((e) => {
    connected.add(e.source);
    connected.add(e.target);
  });

  const hasLoopNode = nodes.some((n) => n.data?.nodeType === "loop");
  if (!hasLoopNode && nodes.length > 1 && edges.length > 0) {
    const adj = new Map();
    nodes.forEach((n) => adj.set(n.id, []));
    edges.forEach((e) => {
      if (adj.has(e.source)) adj.get(e.source).push(e.target);
    });

    const visiting = new Set();
    const visited = new Set();
    let hasCycle = false;

    function dfs(id) {
      if (visiting.has(id)) {
        hasCycle = true;
        return;
      }
      if (visited.has(id)) return;
      visiting.add(id);
      for (const next of adj.get(id) || []) dfs(next);
      visiting.delete(id);
      visited.add(id);
    }

    nodes.forEach((n) => {
      if (!hasCycle) dfs(n.id);
    });

    if (hasCycle) {
      issues.push({
        level: "error",
        message: "Circular flow detected. Use a Loop node for repeated paths.",
      });
    }
  }

  nodes.forEach((node) => {
    const def = getWorkflowNode(node.data?.nodeType);
    const isApiTrigger = Boolean(node.data?.triggerKey);
    if (!def && !isApiTrigger && node.data?.nodeType !== "start") {
      issues.push({
        level: "error",
        message: `Unknown node type on "${node.data?.label || node.id}".`,
        nodeId: node.id,
      });
      return;
    }

    const effectiveDef =
      def ?? (isApiTrigger ? { title: node.data?.label, fields: [] } : null);
    if (!effectiveDef) return;

    const isTriggerNode =
      isApiTrigger || def?.customPanel === "trigger" || def?.isTrigger;

    if (
      node.data?.nodeType !== "start" &&
      !connected.has(node.id) &&
      nodes.length > 1
    ) {
      issues.push({
        level: "error",
        message: `"${node.data?.label || effectiveDef.title}" is disconnected.`,
        nodeId: node.id,
      });
    }

    if (isTriggerNode && node.data?.nodeType !== "start") {
      validateTriggerNodeFields(node, triggerCatalog).forEach((issue) =>
        issues.push(issue)
      );
    } else if (def?.customPanel !== "wait" && def?.customPanel !== "messaging") {
      (effectiveDef.fields || []).forEach((field) => {
        if (!field.required) return;
        const value = node.data?.[field.key];
        if (isEmpty(value)) {
          issues.push({
            level: "error",
            message: `"${node.data?.label || effectiveDef.title}" → ${field.label} is required.`,
            nodeId: node.id,
            field: field.key,
          });
        }
      });
    }

    if (def?.customPanel === "messaging") {
      const fieldErrors = getMessagingFieldErrors(
        node.data || {},
        node.data?.nodeType
      );
      Object.entries(fieldErrors).forEach(([key, message]) => {
        const already = issues.some(
          (issue) => issue.nodeId === node.id && issue.field === key
        );
        if (!already) {
          issues.push({
            level: "error",
            message: `"${node.data?.label || def.title}" → ${message}`,
            nodeId: node.id,
            field: key,
          });
        }
      });

      if (isEmpty(node.data?.recipient)) {
        const already = issues.some(
          (issue) => issue.nodeId === node.id && issue.field === "recipient"
        );
        if (!already) {
          issues.push({
            level: "error",
            message: `"${node.data?.label || def.title}" → Recipient is required.`,
            nodeId: node.id,
            field: "recipient",
          });
        }
      }
    }

    if (def?.customPanel === "messaging" && node.data?.repeatReminder) {
      if (isEmpty(node.data?.retryInterval)) {
        issues.push({
          level: "error",
          message: `"${node.data?.label || def.title}" → Retry Interval is required when retry is enabled.`,
          nodeId: node.id,
          field: "retryInterval",
        });
      }
      if (
        isEmpty(node.data?.maxRetryCount) ||
        Number(node.data.maxRetryCount) < 1
      ) {
        issues.push({
          level: "error",
          message: `"${node.data?.label || def.title}" → Maximum Retry Count must be at least 1.`,
          nodeId: node.id,
          field: "maxRetryCount",
        });
      }
    }

    if (def?.customPanel === "condition" && node.data?.nodeType === "condition") {
      const conditionIssues = validateConditionNodeFields(node.data, def);
      for (const issue of conditionIssues) {
        issues.push({
          ...issue,
          nodeId: node.id,
        });
      }

      const outgoing = edges.filter((e) => e.source === node.id);
      const hasTrue = outgoing.some((e) => e.sourceHandle === "true");
      const hasFalse = outgoing.some((e) => e.sourceHandle === "false");
      if (!hasTrue) {
        issues.push({
          level: "error",
          message: `"${node.data?.label || def.title}" → True branch is required.`,
          nodeId: node.id,
          field: "true",
        });
      }
      if (!hasFalse) {
        issues.push({
          level: "error",
          message: `"${node.data?.label || def.title}" → False branch is required.`,
          nodeId: node.id,
          field: "false",
        });
      }
    }

    if (def?.customPanel === "database" && node.data?.nodeType === "dbDelete") {
      validateDbDeleteNodeFields(node.data, def).forEach((issue) => {
        issues.push({
          ...issue,
          nodeId: node.id,
        });
      });
    }

    if (
      def?.customPanel === "wait" ||
      node.data?.nodeType === "delay" ||
      node.data?.nodeType === "wait"
    ) {
      const hasOutgoing = edges.some((e) => e.source === node.id);
      if (!hasOutgoing) {
        issues.push({
          level: "error",
          message: `"${node.data?.label || def?.title || "Delay"}" has no outgoing connection.`,
          nodeId: node.id,
        });
      }

      const waitType = node.data?.waitType || "duration";
      if (waitType === "duration" || node.data?.nodeType === "delay") {
        const amount = Number(node.data?.amount);
        const unit = String(node.data?.unit || "").trim();
        if (!Number.isFinite(amount) || amount < 1) {
          issues.push({
            level: "error",
            message: `"${node.data?.label || def?.title || "Wait"}" → Amount must be at least 1.`,
            nodeId: node.id,
            field: "amount",
          });
        }
        if (!["minutes", "hours", "days", "weeks"].includes(unit)) {
          issues.push({
            level: "error",
            message: `"${node.data?.label || def?.title || "Wait"}" → Unit must be minutes, hours, days, or weeks.`,
            nodeId: node.id,
            field: "unit",
          });
        }
      }
      if (waitType === "until" && isEmpty(node.data?.untilDate)) {
        issues.push({
          level: "error",
          message: `"${node.data?.label || def?.title || "Wait"}" → Until Date / Time is required.`,
          nodeId: node.id,
          field: "untilDate",
        });
      }
      if (waitType === "relative_date") {
        if (isEmpty(node.data?.relativeDateField)) {
          issues.push({
            level: "error",
            message: `"${node.data?.label || def?.title || "Wait"}" → Date Field is required.`,
            nodeId: node.id,
            field: "relativeDateField",
          });
        }
        const dir = String(node.data?.relativeOffsetDirection || "on");
        if (!["before", "on", "after"].includes(dir)) {
          issues.push({
            level: "error",
            message: `"${node.data?.label || def?.title || "Wait"}" → When must be before, on, or after.`,
            nodeId: node.id,
            field: "relativeOffsetDirection",
          });
        }
        if (dir !== "on") {
          const offset = Number(node.data?.relativeOffsetAmount);
          if (!Number.isFinite(offset) || offset < 0) {
            issues.push({
              level: "error",
              message: `"${node.data?.label || def?.title || "Wait"}" → Offset Amount must be 0 or greater.`,
              nodeId: node.id,
              field: "relativeOffsetAmount",
            });
          }
        }
      }
      if (waitType === "cron" && isEmpty(node.data?.cron)) {
        issues.push({
          level: "error",
          message: `"${node.data?.label || def?.title || "Wait"}" → Cron expression is required.`,
          nodeId: node.id,
          field: "cron",
        });
      }
    }
  });

  // Synthetic Workflow Start is stripped from the editor; no start-edge requirement.

  if (suppressOnAppointment === true) {
    const key = String(campaignKey ?? "").trim();
    if (!key) {
      issues.push({
        level: "error",
        message:
          "Campaign Key is required when “Cancel on appointment booked” is enabled.",
        field: "campaignKey",
      });
    }
  }

  const valid = !issues.some((i) => i.level === "error");
  return { valid, issues };
}
