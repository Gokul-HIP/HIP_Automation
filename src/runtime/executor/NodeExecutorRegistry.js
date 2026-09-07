import { conditionEngine } from "../engines/ConditionEngine";
import { delayScheduler } from "../engines/DelayScheduler";
import { createActionDispatcher } from "../dispatch/ActionDispatcher";
import { WAIT_NODE_TYPES, CONDITION_NODE_TYPES, createExecutionId } from "../types";

/**
 * Registry of node executors keyed by category / node type pattern.
 * Add new executors here — never modify WorkflowExecutor.
 */
export class NodeExecutorRegistry {
  constructor(deps) {
    this.deps = deps;
    this.actionDispatcher = createActionDispatcher(deps);
    this.executors = this.#buildExecutors();
  }

  #buildExecutors() {
    return {
      start: this.#executePassthrough.bind(this),
      trigger: this.#executeTrigger.bind(this),
      condition: this.#executeCondition.bind(this),
      wait: this.#executeWait.bind(this),
      messaging: this.#executeAction.bind(this),
      database: this.#executeAction.bind(this),
      integrations: this.#executeAction.bind(this),
      ai: this.#executeAction.bind(this),
      flow: this.#executeFlow.bind(this),
    };
  }

  /**
   * @param {import('../types').ExecutionStep} step
   * @param {import('../types').ExecutionContext} context
   * @returns {Promise<import('../types').NodeExecutionResult>}
   */
  async execute(step, context) {
    const handler = this.#resolveHandler(step);
    return handler(step, context);
  }

  #resolveHandler(step) {
    if (step.isStart || step.isTrigger) {
      return step.isStart ? this.executors.start : this.executors.trigger;
    }
    if (step.isEnd || step.nodeType === "loop" || step.nodeType === "merge" || step.nodeType === "split" || step.nodeType === "parallel" || step.nodeType === "note") {
      return this.executors.flow;
    }
    if (step.isCondition || CONDITION_NODE_TYPES.has(step.nodeType)) {
      return this.executors.condition;
    }
    if (step.isDelay || WAIT_NODE_TYPES.has(step.nodeType)) {
      return this.executors.wait;
    }
    if (step.category === "messaging") return this.executors.messaging;
    if (step.category === "database") return this.executors.database;
    if (step.category === "integrations") return this.executors.integrations;
    if (step.category === "ai") return this.executors.ai;
    return this.executors.flow;
  }

  async #executePassthrough(step, context) {
    return { action: "continue", output: { nodeType: step.nodeType, context: context.executionId } };
  }

  async #executeTrigger(step, context) {
    // Triggers only record event metadata — no delivery logic
    return {
      action: "continue",
      output: {
        triggered: true,
        nodeType: step.nodeType,
        timing: step.data.triggerTiming ?? step.data.cron ?? null,
        eventName: step.data.eventName ?? null,
      },
    };
  }

  async #executeCondition(step, context) {
    // ConditionExecutor (JEXL) for primary Condition nodes; specialty nodes still supported.
    return conditionEngine.execute(step, context);
  }

  async #executeWait(step, context) {
    const delayMs = delayScheduler.calculateDelayMs(step.data, context);
    const jobId = createExecutionId("delay");

    return {
      action: "delay",
      delayMs,
      output: {
        jobId,
        delayMs,
        resumeNodeId: step.id,
        waitType: step.data?.waitType ?? "duration",
      },
    };
  }

  async #executeAction(step, context) {
    const result = await this.actionDispatcher.dispatch(step, context);
    if (!result.success) {
      return { action: "error", error: result.error || "Action failed", output: result.output };
    }
    return { action: "continue", output: result.output };
  }

  async #executeFlow(step, context) {
    if (step.isEnd) {
      return { action: "end", output: { outcome: step.data.outcome || "completed" } };
    }
    return { action: "continue", output: { nodeType: step.nodeType } };
  }
}

export const createNodeExecutorRegistry = (deps) => new NodeExecutorRegistry(deps);
