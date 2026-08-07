import { variableResolver } from "../variables/VariableResolver";
import { conditionExecutor } from "../executor/ConditionExecutor";
import { evaluateJexlCondition } from "./jexlCondition";

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
 * Condition evaluator.
 * - Primary Condition nodes use JEXL via ConditionExecutor.
 * - Legacy specialty nodes keep field-based evaluation.
 */
export class ConditionEngine {
  /**
   * @param {object} input
   * @param {import('../types').ExecutionContext} input.context
   * @param {string} [input.logic] and | or (legacy)
   * @param {Array<{field:string,operator:string,value?:unknown}>} [input.rules] (legacy)
   * @param {Record<string, unknown>} [input.nodeData]
   * @returns {boolean|Promise<boolean>}
   */
  evaluate({ context, logic = "and", rules = [], nodeData = {} }) {
    const nodeType = String(nodeData.nodeType || "");

    // Primary JEXL Condition node
    if (nodeType === "condition" || (nodeData.expression && !nodeType)) {
      // Sync API kept for callers; prefer async evaluateAsync for JEXL.
      throw new Error(
        "ConditionEngine: use evaluateAsync() for JEXL condition nodes."
      );
    }

    if (nodeType === "compare") {
      return this.#evaluateCompare(nodeData, context);
    }

    if (nodeType === "switch") {
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

    if (nodeType === "patientSegment") {
      return (
        variableResolver.getFieldValue("patient_segment", context) ===
        nodeData.segment
      );
    }

    if (nodeType === "disease") {
      return OPERATORS.contains(
        variableResolver.getFieldValue("disease", context),
        nodeData.disease
      );
    }

    if (nodeType === "age") {
      const age = variableResolver.getFieldValue("age", context);
      const op = OPERATORS[nodeData.operator] ?? OPERATORS.eq;
      return op(age, nodeData.value);
    }

    if (nodeType === "gender") {
      return (
        variableResolver.getFieldValue("gender", context) === nodeData.gender
      );
    }

    if (nodeType === "language") {
      return (
        variableResolver.getFieldValue("language", context) ===
        nodeData.language
      );
    }

    if (nodeType === "membership") {
      return (
        variableResolver.getFieldValue("membership", context) ===
        nodeData.membershipStatus
      );
    }

    if (nodeType === "paymentStatus") {
      return (
        variableResolver.getFieldValue("payment_status", context) ===
        nodeData.paymentStatus
      );
    }

    if (nodeType === "lastVisit") {
      const days = variableResolver.getFieldValue("last_visit", context);
      return Number(days) >= Number(nodeData.daysSince ?? 0);
    }

    if (nodeType === "logicNot") {
      if (nodeData.expression) {
        throw new Error(
          "ConditionEngine: use evaluateAsync() for JEXL NOT conditions."
        );
      }
      return !this.evaluate({ context, logic: nodeData.logic, rules });
    }

    if (!rules.length) return true;

    const results = rules.map((rule) => this.#evaluateRule(rule, context));
    if (logic === "or" || nodeType === "logicOr") {
      return results.some(Boolean);
    }
    return results.every(Boolean);
  }

  /**
   * Async evaluation (required for JEXL Condition nodes).
   * @param {object} input
   * @returns {Promise<boolean>}
   */
  async evaluateAsync({ context, logic = "and", rules = [], nodeData = {} }) {
    const nodeType = String(nodeData.nodeType || "");
    if (nodeType === "condition" || nodeData.expression) {
      return evaluateJexlCondition(String(nodeData.expression || ""), context);
    }
    return this.evaluate({ context, logic, rules, nodeData });
  }

  /**
   * Execute via dedicated ConditionExecutor (True / False branch result).
   * @param {import('../types').ExecutionStep} step
   * @param {import('../types').ExecutionContext} context
   */
  async execute(step, context) {
    if (step?.nodeType === "condition" || step?.data?.expression) {
      return conditionExecutor.execute(step, context);
    }

    try {
      const passed = await this.evaluateAsync({
        context,
        logic: String(step.data?.logic || "and"),
        rules: Array.isArray(step.data?.rules) ? step.data.rules : [],
        nodeData: step.data ?? {},
      });
      return {
        action: "branch",
        branchHandle: passed ? "true" : "false",
        output: { passed },
      };
    } catch (err) {
      return {
        action: "error",
        error: err?.message || "Condition evaluation failed.",
        output: {},
      };
    }
  }

  #evaluateRule(rule, context) {
    const left = variableResolver.getFieldValue(rule.field, context);
    const op = OPERATORS[rule.operator] ?? OPERATORS.eq;
    if (rule.operator === "empty") return op(left);
    return op(left, rule.value);
  }

  #evaluateCompare(nodeData, context) {
    const left = variableResolver.resolve(
      String(nodeData.leftOperand ?? ""),
      context
    );
    const right = variableResolver.resolve(
      String(nodeData.rightOperand ?? ""),
      context
    );
    const op = OPERATORS[nodeData.operator] ?? OPERATORS.eq;
    return op(left, right);
  }
}

export const conditionEngine = new ConditionEngine();
