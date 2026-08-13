import { validateJexlSyntax } from "@/runtime/engines/jexlCondition";

/**
 * Validate a Condition (JEXL) node for save/publish.
 * @param {Record<string, unknown>} data
 * @param {{ title?: string } | null} [def]
 * @returns {{ level: "error"|"warning", message: string, field?: string }[]}
 */
export function validateConditionNodeFields(data, def = null) {
  const issues = [];
  const label = data?.name || data?.label || def?.title || "Condition";
  const expression = String(data?.expression ?? "").trim();

  if (!expression) {
    issues.push({
      level: "error",
      message: `"${label}" requires a Condition expression.`,
      field: "expression",
    });
    return issues;
  }

  const syntax = validateJexlSyntax(expression);
  if (!syntax.ok) {
    issues.push({
      level: "error",
      message: `"${label}" has invalid JEXL: ${syntax.error}`,
      field: "expression",
    });
  }

  return issues;
}
