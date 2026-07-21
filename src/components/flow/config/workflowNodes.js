export { WORKFLOW_NODES } from "./nodes/catalog";
export { WORKFLOW_CATEGORIES, getCategoryById } from "./workflowCategories";

import { WORKFLOW_NODES } from "./nodes/catalog";

const byType = Object.fromEntries(WORKFLOW_NODES.map((n) => [n.type, n]));

export function getWorkflowNode(type) {
  return byType[type] ?? null;
}

export function getNodesByCategory(categoryId) {
  return WORKFLOW_NODES.filter((n) => n.category === categoryId);
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
