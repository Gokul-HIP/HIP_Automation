import { MESSAGING_NODE_TYPES, DATABASE_NODE_TYPES, INTEGRATION_NODE_TYPES, AI_NODE_TYPES } from "../types";
import { enrichAppointmentExists } from "../services/AppointmentLookup";
import {
  buildMessageIdempotencyKey,
  hasSentMessage,
  markMessageSent,
} from "../services/MessageIdempotency";
import { logRuntime } from "../logging/StructuredLogger";

/**
 * Routes action nodes to the correct handler category.
 * WorkflowExecutor never contains business logic — only dispatches here.
 */
export class ActionDispatcher {
  constructor({ channelManager, templateManager, variableResolver }) {
    this.channelManager = channelManager;
    this.templateManager = templateManager;
    this.variableResolver = variableResolver;
  }

  /**
   * @param {import('../types').ExecutionStep} step
   * @param {import('../types').ExecutionContext} context
   */
  async dispatch(step, context) {
    const { nodeType, data } = step;

    if (MESSAGING_NODE_TYPES.has(nodeType)) {
      return this.#dispatchMessaging(nodeType, data, step, context);
    }

    if (DATABASE_NODE_TYPES.has(nodeType)) {
      return this.#dispatchDatabase(nodeType, data, context);
    }

    if (INTEGRATION_NODE_TYPES.has(nodeType)) {
      return this.#dispatchIntegration(nodeType, data, context);
    }

    if (AI_NODE_TYPES.has(nodeType)) {
      return this.#dispatchAI(nodeType, data, context);
    }

    return { success: true, output: { skipped: true, nodeType } };
  }

  async #dispatchMessaging(nodeType, data, step, context) {
    const channelMap = {
      sendWhatsApp: "whatsapp",
      sendSms: "sms",
      sendEmail: "email",
      sendPush: "push",
      // sendInApp: "in_app",
      sendAiChat: "ai_chat",
      sendAiVoice: "ai_voice",
      sendIvr: "ivr",
      sendTemplate: data.channel || "whatsapp",
    };

    const channel = channelMap[nodeType] || "whatsapp";
    const patientId = context.patient?.id ? String(context.patient.id) : null;
    const campaignStep = data.campaignStep || data.campaign_step || step.id;

    // Re-evaluate appointment.exists before every message (nurturing safety).
    const appointmentExists = await enrichAppointmentExists(context);
    const suppressOnBooking = Boolean(context.campaign?.suppressOnAppointment);
    if (suppressOnBooking && appointmentExists) {
      logRuntime("message.skipped", {
        workflowId: context.workflowId,
        executionId: context.executionId,
        patientId,
        nodeId: step.id,
        nodeType,
        skipReason: "appointment.exists",
      });
      return {
        success: true,
        output: {
          skipped: true,
          skipReason: "appointment.exists",
          appointmentExists: true,
        },
        error: null,
      };
    }

    const idempotencyKey = buildMessageIdempotencyKey({
      workflowId: context.workflowId,
      executionId: context.executionId,
      patientId,
      nodeId: step.id,
      campaignStep,
      scheduledPeriod: context.system?.triggered_at ?? null,
    });

    if (hasSentMessage(idempotencyKey)) {
      logRuntime("message.skipped", {
        workflowId: context.workflowId,
        executionId: context.executionId,
        patientId,
        nodeId: step.id,
        nodeType,
        skipReason: "idempotent_duplicate",
      });
      return {
        success: true,
        output: {
          skipped: true,
          skipReason: "idempotent_duplicate",
          idempotencyKey,
        },
        error: null,
      };
    }

    const templateId = String(
      data.templateId || data.template_id || data.messageBody || ""
    ).trim();
    const hasTemplate = Boolean(templateId);
    const rendered = hasTemplate
      ? this.templateManager.render(templateId, context)
      : { channel, subject: "", body: "" };

    const recipient =
      data.recipient === "custom"
        ? String(data.customRecipient ?? "")
        : this.#resolveRecipient(data.recipient, context);

    const subjectRaw = String(
      data.title || data.subject || rendered.subject || ""
    );
    const bodyRaw = String(
      data.body || data.message || rendered.body || ""
    );

    const result = await this.channelManager.send({
      channel: nodeType === "sendTemplate" ? data.channel || rendered.channel : channel,
      executionId: context.executionId,
      workflowId: context.workflowId,
      nodeId: step.id,
      patientId,
      recipient,
      body: this.variableResolver.resolve(bodyRaw, context),
      subject: this.variableResolver.resolve(subjectRaw, context),
      retry: Boolean(data.repeatReminder),
      retryInterval: Number(data.retryInterval ?? 15),
      maxRetryCount: Number(data.maxRetryCount ?? 2),
      fallbackChannel: String(data.fallbackChannel || ""),
      idempotencyKey,
    });

    if (result.success) {
      markMessageSent(idempotencyKey);
    }

    logRuntime("message.dispatch", {
      workflowId: context.workflowId,
      executionId: context.executionId,
      patientId,
      nodeId: step.id,
      nodeType,
      messageDispatchResult: result.success ? "sent" : "failed",
      failureReason: result.error ?? undefined,
    });

    return {
      success: result.success,
      output: { ...result, idempotencyKey },
      error: result.error ?? null,
    };
  }

  #resolveRecipient(type, context) {
    const map = {
      patient: context.patient?.mobile || context.patient?.email,
      doctor: context.doctor?.mobile || context.doctor?.email,
      caregiver: context.patient?.caregiver_contact,
    };
    return map[type] ?? context.patient?.mobile ?? "";
  }

  async #dispatchDatabase(nodeType, data, context) {
    return {
      success: true,
      output: {
        action: "database",
        nodeType,
        entity: data.entity,
        stub: true,
        contextSnapshot: { patientId: context.patient?.id },
      },
    };
  }

  async #dispatchIntegration(nodeType, data, context) {
    return {
      success: true,
      output: {
        action: "integration",
        nodeType,
        endpoint: data.endpoint || data.url,
        stub: true,
      },
    };
  }

  async #dispatchAI(nodeType, data, context) {
    return {
      success: true,
      output: {
        action: "ai",
        nodeType,
        prompt: data.prompt,
        stub: true,
      },
    };
  }
}

export const createActionDispatcher = (deps) => new ActionDispatcher(deps);
