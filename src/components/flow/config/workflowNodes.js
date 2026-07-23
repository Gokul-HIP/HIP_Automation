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
 * Build sidebar groups from the local catalog plus optional API trigger catalog.
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

  const apiTriggerKeys = new Set(
    (apiTriggerCatalog?.triggers ?? []).map((trigger) => trigger.key)
  );
  const hasApiTriggers = apiTriggerKeys.size > 0;
  const groups = [];

  for (const { group, triggers } of apiTriggerCatalog?.groups ?? []) {
    const filteredTriggers = (triggers ?? []).filter((trigger) =>
      matchesText(trigger.name, trigger.description, trigger.key)
    );

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
      if (category.id === "triggers" && hasApiTriggers && node.isTrigger) {
        return false;
      }
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
    ...structuredClone(def.defaultData),
  };

  if (data.executionStatus && !data.status) {
    data.status = data.executionStatus;
  }

  return data;
}
