export { WORKFLOW_NODES } from "./nodes/catalog";
export { WORKFLOW_CATEGORIES, getCategoryById } from "./workflowCategories";

import { WORKFLOW_NODES } from "./nodes/catalog";
import { WORKFLOW_CATEGORIES } from "./workflowCategories";

const byType = Object.fromEntries(WORKFLOW_NODES.map((n) => [n.type, n]));

export function getWorkflowNode(type) {
  return byType[type] ?? null;
}

export function getNodesByCategory(categoryId) {
  return WORKFLOW_NODES.filter((n) => n.category === categoryId);
}

/**
 * Normalize trigger titles/keys for duplicate detection across local + API catalogs.
 * @param {unknown} value
 */
function normalizeTriggerLabel(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

/**
 * Build sidebar groups from the local catalog plus optional API trigger catalog.
 * Local trigger cards win when the API exposes the same trigger under another
 * key or group (e.g. API "chat" vs local Triggers → On Message Received).
 * @param {{ search?: string, apiTriggerCatalog?: { triggers?: { key: string }[], groups?: { group: string, triggers: unknown[] }[] } | null }} options
 */
export function getSidebarCatalogGroups({ search = "", apiTriggerCatalog = null } = {}) {
  const q = search.trim().toLowerCase();

  const matchesText = (...parts) => {
    if (!q) return true;
    return parts.some((part) =>
      String(part || "")
        .toLowerCase()
        .includes(q)
    );
  };

  const localTriggers = WORKFLOW_NODES.filter((node) => node.isTrigger);
  const localTriggerTypes = new Set(localTriggers.map((node) => node.type));
  const localTriggerTitles = new Set(
    localTriggers.map((node) => normalizeTriggerLabel(node.title))
  );
  const groups = [];

  for (const { group, triggers } of apiTriggerCatalog?.groups ?? []) {
    // Prefer the local catalog entry when the API exposes the same trigger
    // under a different key/group (e.g. "chat" vs Triggers → On Message Received).
    const filteredTriggers = (triggers ?? []).filter((trigger) => {
      if (localTriggerTypes.has(trigger.key)) return false;
      if (localTriggerTitles.has(normalizeTriggerLabel(trigger.name))) return false;
      return matchesText(trigger.name, trigger.description, trigger.key);
    });

    if (filteredTriggers.length) {
      groups.push({
        category: {
          id: `api-trigger-${group}`,
          label: group,
          description: "Event triggers",
        },
        nodes: [],
        triggers: filteredTriggers,
      });
    }
  }

  for (const category of WORKFLOW_CATEGORIES) {
    const nodes = WORKFLOW_NODES.filter((node) => {
      if (node.isStart) return false;
      if (node.category !== category.id) return false;
      // Prefer local trigger cards; matching API entries are filtered out above. 
      return matchesText(node.title, node.description, node.type);
    });

    if (nodes.length) {
      groups.push({ category, nodes, triggers: [] });
    }
  }

  return groups;
}

export function createNodeDefaults(type) {
  const def = getWorkflowNode(type);
  if (!def) return null;

  const data = {
    nodeType: def.type,
    category: def.category,
    tone: def.tone,
    description: def.description || "",
    ...structuredClone(def.defaultData),
  };

  if (data.executionStatus && !data.status) {
    data.status = data.executionStatus;
  }

  return data;
}
