import { compileWorkflow } from "../compiler/WorkflowCompiler";
import { createNodeExecutorRegistry } from "./NodeExecutorRegistry";
import { delayScheduler } from "../engines/DelayScheduler";
import { createExecutionId, nowIso } from "../types";
import { enrichAppointmentExists } from "../services/AppointmentLookup";
import { resolveCampaignFromConfig } from "../services/CampaignSuppression";
import { deriveFollowupObject } from "../services/FollowupContext";
import { logRuntime } from "../logging/StructuredLogger";

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
   */
  async run({
    configuration,
    workflowId,
    workflowName,
    triggerPayload = {},
    patient = {},
    doctor = {},
    appointment = {},
    appointments = undefined,
    prescription = {},
    medicine = {},
    hospital = {},
    payment = {},
    invoice = {},
    organization = {},
    followup = {},
    /** When true, duration waits of 0 (or test override) resume immediately. */
    waitOverrideMs = null,
  }) {
    const graph = compileWorkflow({ workflowId, workflowName, configuration });

    if (!graph.entryNodeId) {
      throw new Error("WorkflowExecutor: no entry node in compiled graph.");
    }

    const campaign = resolveCampaignFromConfig(configuration, triggerPayload);
    const triggeredAt = nowIso();
    const appointmentObj =
      appointment && typeof appointment === "object" ? { ...appointment } : {};
    const followupObj = deriveFollowupObject(appointmentObj, followup);

    const execution = this.executionStore.create({
      workflowId,
      workflowName,
      patientId: patient?.id ?? null,
      hospitalId: hospital?.id ?? hospital?.hospital_id ?? null,
      campaignKey: campaign?.key ?? null,
    });
    const executionId = execution.id;

    /** @type {import('../types').ExecutionContext} */
    const context = {
      executionId,
      workflowId,
      workflowName,
      triggerPayload,
      patient,
      doctor,
      appointment: appointmentObj,
      followup: followupObj,
      appointments,
      prescription,
      medicine,
      hospital,
      payment,
      invoice,
      organization,
      variables: {
        booking_link:
          hospital?.booking_link ||
          hospital?.booking_url ||
          triggerPayload?.booking_link ||
          "",
        hospital_phone: hospital?.phone || hospital?.hospital_phone || "",
        hospital_name: hospital?.name || hospital?.hospital_name || "",
        patient_name: patient?.name || patient?.patient_name || "",
        followup_date: followupObj.date || "",
        pharmacy_link:
          prescription?.pharmacy_link ||
          triggerPayload?.pharmacy_link ||
          "",
        prescription_id:
          prescription?.id || prescription?.prescription_id || "",
      },
      system: {
        triggered_at: triggeredAt,
        workflow_id: workflowId,
      },
      trigger: {
        type:
          triggerPayload?.trigger_type ||
          triggerPayload?.type ||
          graph.trigger?.nodeType ||
          null,
        triggered_at: triggeredAt,
      },
      campaign: campaign || undefined,
      waitOverrideMs,
    };

    await enrichAppointmentExists(context);

    logRuntime("execution.started", {
      workflowId,
      executionId,
      patientId: patient?.id ?? null,
      campaignKey: campaign?.key ?? null,
      triggerType: context.trigger?.type,
      appointmentExists: context.appointment?.exists,
    });

    this.executionStore.update(executionId, {
      status: "running",
      currentNodeId: graph.entryNodeId,
    });

    try {
      await this.#traverse(graph, graph.entryNodeId, context, executionId);
    } catch (err) {
      const current = this.executionStore.get(executionId);
      if (current?.status === "cancelled") {
        return this.#finalize(executionId);
      }
      this.executionStore.update(executionId, {
        status: "failed",
        error: err?.message || "Execution failed",
        completedAt: nowIso(),
        durationMs: Date.now() - new Date(execution.startedAt).getTime(),
      });
      logRuntime("execution.failed", {
        workflowId,
        executionId,
        patientId: patient?.id ?? null,
        failureReason: err?.message || "Execution failed",
      });
      throw err;
    }

    return this.#finalize(executionId);
  }

  #finalize(executionId) {
    const final = this.executionStore.get(executionId);
    if (final) {
      final.trace = this.tracer.getTrace(executionId);
    }
    return final;
  }

  #isCancelled(executionId) {
    const record = this.executionStore.get(executionId);
    return record?.status === "cancelled";
  }

  async #traverse(graph, nodeId, context, executionId) {
    if (this.#isCancelled(executionId)) {
      logRuntime("execution.skipped", {
        workflowId: context.workflowId,
        executionId,
        patientId: context.patient?.id ?? null,
        nodeId,
        skipReason: "execution_cancelled",
      });
      return;
    }

    const step = graph.steps[nodeId];
    if (!step) {
      throw new Error(`WorkflowExecutor: unknown node "${nodeId}".`);
    }

    // Re-check appointment before conditions and messaging (nurturing safety).
    if (step.isCondition || step.isAction) {
      await enrichAppointmentExists(context);
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

    logRuntime("node.completed", {
      workflowId: context.workflowId,
      executionId,
      patientId: context.patient?.id ?? null,
      nodeId,
      nodeType: step.nodeType,
      action: result.action,
      conditionResult:
        result.action === "branch" ? result.branchHandle : undefined,
      skipReason: result.output?.skipReason,
      failureReason: result.error,
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
      let delayMs = result.delayMs ?? 0;
      if (context.waitOverrideMs != null) {
        delayMs = Number(context.waitOverrideMs);
      }

      if (delayMs <= 0) {
        if (this.#isCancelled(executionId)) return;
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
      const resumeAt = new Date(Date.now() + delayMs).toISOString();
      this.executionStore.update(executionId, {
        status: "scheduled",
        delayJobId: jobId,
        resumeAt,
      });

      logRuntime("wait.scheduled", {
        workflowId: context.workflowId,
        executionId,
        patientId: context.patient?.id ?? null,
        nodeId,
        nodeType: step.nodeType,
        scheduledTime: resumeAt,
      });

      return new Promise((resolve, reject) => {
        this.delayScheduler.schedule({
          jobId,
          nodeId,
          executionId,
          delayMs,
          onResume: async () => {
            try {
              if (this.#isCancelled(executionId)) {
                logRuntime("wait.skipped", {
                  workflowId: context.workflowId,
                  executionId,
                  patientId: context.patient?.id ?? null,
                  nodeId,
                  skipReason: "execution_cancelled",
                });
                resolve(undefined);
                return;
              }

              this.executionStore.update(executionId, {
                status: "running",
                delayJobId: null,
              });
              await enrichAppointmentExists(context);

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
              if (this.#isCancelled(executionId)) {
                resolve(undefined);
                return;
              }
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
      if (result.branchHandle === "true") return outgoing[0]?.targetId ?? null;
      return outgoing[1]?.targetId ?? null;
    }

    return outgoing[0]?.targetId ?? null;
  }
}

export const createWorkflowExecutor = (deps) => new WorkflowExecutor(deps);
