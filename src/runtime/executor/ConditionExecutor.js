import { evaluateJexlCondition, validateJexlSyntax } from "../engines/jexlCondition";

/**
 * Dedicated ConditionExecutor — evaluates JEXL and routes True / False.
 * Mirrors the Laravel ConditionExecutor contract described in the HIP spec.
 */
export class ConditionExecutor {
  /**
   * @param {import('../types').ExecutionStep} step
   * @param {import('../types').ExecutionContext} context
   * @returns {Promise<import('../types').NodeExecutionResult>}
   */
  async execute(step, context) {
    const expression = String(step?.data?.expression ?? "").trim();
    const name = String(step?.data?.name || step?.data?.label || "Condition");

    const syntax = validateJexlSyntax(expression);
    if (!syntax.ok) {
      return {
        action: "error",
        error: syntax.error || "Invalid condition expression.",
        output: { name, expression },
      };
    }

    try {
      const passed = await evaluateJexlCondition(expression, context);
      return {
        action: "branch",
        branchHandle: passed ? "true" : "false",
        output: {
          name,
          expression,
          passed,
          branch: passed ? "true" : "false",
        },
      };
    } catch (err) {
      return {
        action: "error",
        error: err?.message || "Condition evaluation failed.",
        output: { name, expression },
      };
    }
  }
}

export const createConditionExecutor = () => new ConditionExecutor();
export const conditionExecutor = createConditionExecutor();
