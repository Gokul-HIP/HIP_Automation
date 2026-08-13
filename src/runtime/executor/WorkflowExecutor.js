import { compileWorkflow } from "../compiler/WorkflowCompiler";
import { createNodeExecutorRegistry } from "./NodeExecutorRegistry";
import { delayScheduler } from "../engines/DelayScheduler";
import { createExecutionId, nowIso } from "../types";

/**
 * Generic workflow executor — traverses compiled graph, no business logic.
 */
export class WorkflowExecutor {
  constructor({
    executionStore,
    tracer,
    channelManager,
    templateManager,
    variableResolver,
  }) {
    this.executionStore = executionStore;
    this.tracer = tracer;
    this.registry = createNodeExecutorRegistry({
      channelManager,
      templateManager,
      variableResolver,
    });
    this.delayScheduler = delayScheduler;
  }

  /**
   * Compile and execute a workflow.
   * @param {object} params
   * @param {import('@/types/workflow').WorkflowConfiguration} params.configuration
   * @param {string|number} params.workflowId
   * @param {string} params.workflowName
   * @param {Record<string, unknown>} [params.triggerPayload]
   * @param {Record<string, unknown>} [params.patient]
   * @param {Record<string, unknown>} [params.doctor]
   * @param {Record<string, unknown>} [params.appointment]
   * @param {Record<string, unknown>} [params.prescription]
   * @param {Record<string, unknown>} [params.medicine]
   * @param {Record<string, unknown>} [params.hospital]
   */
  async run({
    configuration,
    workflowId,
    workflowName,
    triggerPayload = {},
    patient = {},
    doctor = {},
    appointment = {},
    prescription = {},
    medicine = {},
    hospital = {},
  }) {
    const graph = compileWorkflow({ workflowId, workflowName, configuration });

    if (!graph.entryNodeId) {
      throw new Error("WorkflowExecutor: no entry node in compiled graph.");
    }

    const execution = this.executionStore.create({ workflowId, workflowName });
    const executionId = execution.id;

    /** @type {import('../types').ExecutionContext} */
    const context = {
      executionId,
      workflowId,
      workflowName,
      triggerPayload,
      patient,
      doctor,
      appointment,
      prescription,
      medicine,
      hospital,
      variables: {},
      system: { triggered_at: nowIso(), workflow_id: workflowId },
    };

    this.executionStore.update(executionId, {
      status: "running",
      currentNodeId: graph.entryNodeId,
    });

    try {
      await this.#traverse(graph, graph.entryNodeId, context, executionId);
    } catch (err) {
      this.executionStore.update(executionId, {
        status: "failed",
        error: err?.message || "Execution failed",
        completedAt: nowIso(),
        durationMs: Date.now() - new Date(execution.startedAt).getTime(),
      });
      throw err;
    }

    const final = this.executionStore.get(executionId);
    final.trace = this.tracer.getTrace(executionId);
    return final;
  }

  async #traverse(graph, nodeId, context, executionId) {
    const step = graph.steps[nodeId];
    if (!step) {
      throw new Error(`WorkflowExecutor: unknown node "${nodeId}".`);
    }

    const label = String(step.data.label || step.nodeType);
    this.executionStore.update(executionId, { currentNodeId: nodeId });
    this.tracer.start(executionId, nodeId, step.nodeType, label);

    const result = await this.registry.execute(step, context);
    this.tracer.complete(executionId, nodeId, {
      action: result.action,
      output: result.output,
      error: result.error,
    });

    if (result.action === "end") {
      this.executionStore.update(executionId, {
        status: "completed",
        currentNodeId: null,
        completedAt: nowIso(),
        durationMs:
          Date.now() -
          new Date(this.executionStore.get(executionId).startedAt).getTime(),
      });
      return;
    }

    if (result.action === "error") {
      throw new Error(result.error || `Node ${nodeId} failed`);
    }

    if (result.action === "delay") {
      const nextNodeId = this.#resolveNextNode(step, result);
      const delayMs = result.delayMs ?? 0;

      if (delayMs <= 0) {
        if (nextNodeId) {
          await this.#traverse(graph, nextNodeId, context, executionId);
        } else {
          this.executionStore.update(executionId, {
            status: "completed",
            completedAt: nowIso(),
            currentNodeId: null,
          });
        }
        return;
      }

      const jobId = createExecutionId("delay");
      this.executionStore.update(executionId, { status: "scheduled" });

      return new Promise((resolve, reject) => {
        this.delayScheduler.schedule({
          jobId,
          nodeId,
          delayMs,
          onResume: async () => {
            try {
              this.executionStore.update(executionId, { status: "running" });
              if (nextNodeId) {
                await this.#traverse(graph, nextNodeId, context, executionId);
              } else {
                this.executionStore.update(executionId, {
                  status: "completed",
                  completedAt: nowIso(),
                  currentNodeId: null,
                });
              }
              resolve(undefined);
            } catch (e) {
              this.executionStore.update(executionId, {
                status: "failed",
                error: e?.message,
                completedAt: nowIso(),
              });
              reject(e);
            }
          },
        });
      });
    }

    const nextNodeId = this.#resolveNextNode(step, result);
    if (!nextNodeId) {
      // No outgoing edge — treat as implicit end if not error
      if (step.isEnd) {
        this.executionStore.update(executionId, {
          status: "completed",
          completedAt: nowIso(),
          currentNodeId: null,
        });
        return;
      }
      throw new Error(`WorkflowExecutor: node "${nodeId}" has no outgoing edge.`);
    }

    await this.#traverse(graph, nextNodeId, context, executionId);
  }

  #resolveNextNode(step, result) {
    if (result.nextNodeId) return result.nextNodeId;

    const outgoing = step.outgoing ?? [];
    if (!outgoing.length) return null;

    if (result.action === "branch" && result.branchHandle) {
      const match =
        outgoing.find((e) => e.sourceHandle === result.branchHandle) ||
        outgoing.find((e) => e.label === result.branchHandle);
      if (match) return match.targetId;
      // Fallback: first edge for true, none for false
      if (result.branchHandle === "true") return outgoing[0]?.targetId ?? null;
      return outgoing[1]?.targetId ?? null;
    }

    // Parallel-ready: return first; future executor can fan-out all targets
    return outgoing[0]?.targetId ?? null;
  }
}

export const createWorkflowExecutor = (deps) => new WorkflowExecutor(deps);
