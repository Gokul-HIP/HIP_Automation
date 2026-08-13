/**
 * Normalize Condition nodes to the JEXL contract:
 * { nodeType: "condition", category: "conditions", name, expression, label }
 *
 * Legacy logicAnd / logicOr / rules / logic are migrated or stripped.
 */

const LEGACY_LOGIC_BY_NODE_TYPE = {
  logicAnd: "and",
  logicOr: "or",
};

/**
 * Best-effort migration of old AND/OR rules into a JEXL expression.
 * @param {string} logic
 * @param {Array<{ field?: string, operator?: string, value?: unknown }>} rules
 */
function rulesToJexl(logic, rules) {
  if (!Array.isArray(rules) || !rules.length) return "";

  const opMap = {
    eq: "==",
    neq: "!=",
    gt: ">",
    gte: ">=",
    lt: "<",
    lte: "<=",
    contains: null,
    empty: null,
  };

  const parts = [];
  for (const rule of rules) {
    const field = String(rule?.field || "").trim();
    if (!field) continue;
    const path = field.includes(".")
      ? field
      : field.includes("_")
        ? field.replace("_", ".")
        : `patient.${field}`;
    const operator = String(rule?.operator || "eq");
    const value = rule?.value;

    if (operator === "empty") {
      parts.push(`${path} == null`);
      continue;
    }
    if (operator === "contains") {
      parts.push(`${path}`);
      continue;
    }

    const jexlOp = opMap[operator] || "==";
    const literal =
      typeof value === "number"
        ? String(value)
        : typeof value === "boolean"
          ? String(value)
          : `"${String(value ?? "").replace(/"/g, '\\"')}"`;
    parts.push(`${path} ${jexlOp} ${literal}`);
  }

  if (!parts.length) return "";
  const joiner = logic === "or" ? " || " : " && ";
  return parts.join(joiner);
}

/**
 * @param {Record<string, unknown> | null | undefined} data
 */
export function normalizeConditionNodeData(data) {
  if (!data || typeof data !== "object") return data ?? {};

  const legacyLogic = LEGACY_LOGIC_BY_NODE_TYPE[data.nodeType];
  if (legacyLogic || data.nodeType === "condition") {
    const name =
      (typeof data.name === "string" && data.name.trim()
        ? data.name.trim()
        : null) ||
      (typeof data.label === "string" && data.label.trim()
        ? data.label.trim()
        : "Condition");

    let expression =
      typeof data.expression === "string" ? data.expression.trim() : "";

    if (!expression && Array.isArray(data.rules) && data.rules.length) {
      expression = rulesToJexl(
        data.logic === "or" || legacyLogic === "or" ? "or" : "and",
        data.rules
      );
    }

    const next = {
      ...data,
      nodeType: "condition",
      category: "conditions",
      name,
      label: name,
      expression,
    };

    delete next.rules;
    delete next.logic;
    delete next.operator;
    delete next.field;
    delete next.value;

    return next;
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
