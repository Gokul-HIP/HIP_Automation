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
 * API-only triggers (e.g. Campaign Triggered) are folded into the single
 * "Triggers" category — never rendered as separate top-level sections.
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

  /** API-only triggers to show inside the local Triggers accordion. */
  const apiOnlyTriggers = [];
  const seenApiKeys = new Set();

  for (const { triggers } of apiTriggerCatalog?.groups ?? []) {
    for (const trigger of triggers ?? []) {
      if (!trigger?.key || seenApiKeys.has(trigger.key)) continue;
      if (localTriggerTypes.has(trigger.key)) continue;
      if (localTriggerTitles.has(normalizeTriggerLabel(trigger.name))) continue;
      if (!matchesText(trigger.name, trigger.description, trigger.key)) continue;
      seenApiKeys.add(trigger.key);
      apiOnlyTriggers.push(trigger);
    }
  }

  // Flat API list (no groups) — same dedupe rules as above.
  for (const trigger of apiTriggerCatalog?.triggers ?? []) {
    if (!trigger?.key || seenApiKeys.has(trigger.key)) continue;
    if (localTriggerTypes.has(trigger.key)) continue;
    if (localTriggerTitles.has(normalizeTriggerLabel(trigger.name))) continue;
    if (!matchesText(trigger.name, trigger.description, trigger.key)) continue;
    seenApiKeys.add(trigger.key);
    apiOnlyTriggers.push(trigger);
  }

  const groups = [];

  for (const category of WORKFLOW_CATEGORIES) {
    const nodes = WORKFLOW_NODES.filter((node) => {
      if (node.isStart) return false;
      if (node.category !== category.id) return false;
      return matchesText(node.title, node.description, node.type);
    });

    const triggers =
      category.id === "triggers" ? apiOnlyTriggers : [];

    if (nodes.length || triggers.length) {
      groups.push({ category, nodes, triggers });
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
