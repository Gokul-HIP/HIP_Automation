import { createExecutionId, nowIso } from "../types";

/**
 * Base channel adapter — implement per channel in Laravel or here.
 */
export class BaseChannelAdapter {
  constructor(channel) {
    this.channel = channel;
  }

  /**
   * @param {object} payload
   * @returns {Promise<{success:boolean, messageId?:string, error?:string}>}
   */
  async send(payload) {
    return {
      success: true,
      messageId: createExecutionId("msg"),
      meta: { channel: this.channel, stub: true, payload },
    };
  }
}

function createAdapter(channel) {
  return new (class extends BaseChannelAdapter {
    constructor() {
      super(channel);
    }
  })();
}

/**
 * Dispatches messaging to channel adapters with retry and fallback.
 */
export class ChannelManager {
  constructor({ communicationLogStore = null } = {}) {
    /** @type {Map<string, BaseChannelAdapter>} */
    this.adapters = new Map();
    this.communicationLogStore = communicationLogStore;
    this.#registerDefaults();
  }

  #registerDefaults() {
    for (const ch of [
      "whatsapp",
      "sms",
      "email",
      "push",
      // "in_app",
      "ai_chat",
      "ai_voice",
      "ivr",
    ]) {
      this.adapters.set(ch, createAdapter(ch));
    }
  }

  register(channel, adapter) {
    this.adapters.set(channel, adapter);
  }

  /**
   * @param {object} params
   * @param {string} params.channel
   * @param {string} params.executionId
   * @param {string|number} params.workflowId
   * @param {string} params.nodeId
   * @param {string|null} params.patientId
   * @param {string} params.recipient
   * @param {string} params.body
   * @param {string} [params.subject]
   * @param {boolean} [params.retry]
   * @param {number} [params.retryInterval]
   * @param {number} [params.maxRetryCount]
   * @param {string} [params.fallbackChannel]
   */
  async send({
    channel,
    executionId,
    workflowId,
    nodeId,
    patientId = null,
    recipient,
    body,
    subject = "",
    retry = false,
    retryInterval = 15,
    maxRetryCount = 2,
    fallbackChannel = "",
  }) {
    const logId = createExecutionId("clog");
    const baseLog = {
      id: logId,
      executionId,
      workflowId,
      nodeId,
      patientId,
      channel,
      status: "queued",
      createdAt: nowIso(),
      sentAt: null,
      deliveredAt: null,
      readAt: null,
      retryCount: 0,
      error: null,
      meta: { recipient, subject },
    };

    this.communicationLogStore?.create({ ...baseLog });

    let result = await this.#attemptSend(channel, { recipient, body, subject });

    if (!result.success && fallbackChannel) {
      this.communicationLogStore?.update(logId, {
        status: "retried",
        retryCount: 1,
        error: result.error,
      });
      result = await this.#attemptSend(fallbackChannel, { recipient, body, subject });
    }

    if (retry && !result.success && maxRetryCount > 0) {
      for (let i = 0; i < maxRetryCount && !result.success; i++) {
        await this.#sleep(retryInterval * 60 * 1000);
        this.communicationLogStore?.update(logId, {
          status: "retried",
          retryCount: i + 2,
        });
        result = await this.#attemptSend(channel, { recipient, body, subject });
      }
    }

    const finalStatus = result.success ? "sent" : "failed";
    this.communicationLogStore?.update(logId, {
      status: finalStatus,
      sentAt: result.success ? nowIso() : null,
      error: result.error ?? null,
      meta: { ...baseLog.meta, messageId: result.messageId },
    });

    return { ...result, logId, channel };
  }

  async #attemptSend(channel, payload) {
    const adapter = this.adapters.get(channel);
    if (!adapter) {
      return { success: false, error: `Unknown channel: ${channel}` };
    }
    try {
      return await adapter.send(payload);
    } catch (err) {
      return { success: false, error: err?.message || "Channel send failed" };
    }
  }

  #sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const createChannelManager = (deps) => new ChannelManager(deps);
