/**
 * Condition nodes must persist as nodeType "condition" with logic "and" | "or".
 * Legacy editor types logicAnd / logicOr are normalized at save and load boundaries.
 */

const LEGACY_LOGIC_BY_NODE_TYPE = {
  logicAnd: "and",
  logicOr: "or",
};

/**
 * @param {Record<string, unknown> | null | undefined} data
 */
export function normalizeConditionNodeData(data) {
  if (!data || typeof data !== "object") return data ?? {};

  const legacyLogic = LEGACY_LOGIC_BY_NODE_TYPE[data.nodeType];
  if (legacyLogic) {
    const next = { ...data, nodeType: "condition" };
    if (!next.logic) next.logic = legacyLogic;
    return next;
  }

  if (data.nodeType === "condition") {
    return {
      ...data,
      logic: data.logic === "or" ? "or" : "and",
    };
  }

  return data;
}

/**
 * @param {import('reactflow').Node} node
 */
export function normalizeConditionNodeForSave(node) {
  if (!node) return node;
  return {
    ...node,
    data: normalizeConditionNodeData(node.data),
  };
}

/**
 * @param {import('reactflow').Node} node
 */
export function hydrateConditionNodeForEditor(node) {
  if (!node) return node;
  return {
    ...node,
    data: normalizeConditionNodeData(node.data),
  };
}
