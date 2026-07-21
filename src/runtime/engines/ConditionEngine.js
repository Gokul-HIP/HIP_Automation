import { variableResolver } from "../variables/VariableResolver";

const OPERATORS = {
  eq: (a, b) => String(a).toLowerCase() === String(b).toLowerCase(),
  neq: (a, b) => String(a).toLowerCase() !== String(b).toLowerCase(),
  gt: (a, b) => Number(a) > Number(b),
  gte: (a, b) => Number(a) >= Number(b),
  lt: (a, b) => Number(a) < Number(b),
  lte: (a, b) => Number(a) <= Number(b),
  contains: (a, b) =>
    String(a).toLowerCase().includes(String(b).toLowerCase()),
  empty: (a) => a == null || String(a).trim() === "",
};

/**
 * Generic condition evaluator — no domain-specific logic.
 */
export class ConditionEngine {
  /**
   * @param {object} input
   * @param {import('../types').ExecutionContext} input.context
   * @param {string} [input.logic] and | or
   * @param {Array<{field:string,operator:string,value?:unknown}>} [input.rules]
   * @param {Record<string, unknown>} [input.nodeData] full node data for specialized condition nodes
   * @returns {boolean}
   */
  evaluate({ context, logic = "and", rules = [], nodeData = {} }) {
    if (nodeData.nodeType === "compare") {
      return this.#evaluateCompare(nodeData, context);
    }

    if (nodeData.nodeType === "switch") {
      const fieldVal = variableResolver.getFieldValue(
        nodeData.switchField,
        context
      );
      const cases = String(nodeData.cases || "")
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
      return cases.includes(String(fieldVal));
    }

    if (nodeData.nodeType === "patientSegment") {
      return (
        variableResolver.getFieldValue("patient_segment", context) ===
        nodeData.segment
      );
    }

    if (nodeData.nodeType === "disease") {
      return OPERATORS.contains(
        variableResolver.getFieldValue("disease", context),
        nodeData.disease
      );
    }

    if (nodeData.nodeType === "age") {
      const age = variableResolver.getFieldValue("age", context);
      const op = OPERATORS[nodeData.operator] ?? OPERATORS.eq;
      return op(age, nodeData.value);
    }

    if (nodeData.nodeType === "gender") {
      return (
        variableResolver.getFieldValue("gender", context) === nodeData.gender
      );
    }

    if (nodeData.nodeType === "language") {
      return (
        variableResolver.getFieldValue("language", context) === nodeData.language
      );
    }

    if (nodeData.nodeType === "membership") {
      return (
        variableResolver.getFieldValue("membership", context) ===
        nodeData.membershipStatus
      );
    }

    if (nodeData.nodeType === "paymentStatus") {
      return (
        variableResolver.getFieldValue("payment_status", context) ===
        nodeData.paymentStatus
      );
    }

    if (nodeData.nodeType === "lastVisit") {
      const days = variableResolver.getFieldValue("last_visit", context);
      return Number(days) >= Number(nodeData.daysSince ?? 0);
    }

    if (nodeData.nodeType === "logicNot") {
      return !this.evaluate({ context, logic: nodeData.logic, rules });
    }

    if (!rules.length) return true;

    const results = rules.map((rule) => this.#evaluateRule(rule, context));

    if (logic === "or" || nodeData.nodeType === "logicOr") {
      return results.some(Boolean);
    }

    return results.every(Boolean);
  }

  #evaluateRule(rule, context) {
    const left = variableResolver.getFieldValue(rule.field, context);
    const op = OPERATORS[rule.operator] ?? OPERATORS.eq;

    if (rule.operator === "empty") return op(left);
    return op(left, rule.value);
  }

  #evaluateCompare(nodeData, context) {
    const left = variableResolver.resolve(String(nodeData.leftOperand ?? ""), context);
    const right = variableResolver.resolve(String(nodeData.rightOperand ?? ""), context);
    const op = OPERATORS[nodeData.operator] ?? OPERATORS.eq;
    return op(left, right);
  }
}

export const conditionEngine = new ConditionEngine();
