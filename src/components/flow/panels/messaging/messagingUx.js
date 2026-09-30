/**
 * Messaging content validation — template OR manual content where supported.
 */

import {
  canAddManualContentAsTemplate,
  hasSelectedTemplate,
  isFilled,
  isManualContentValid,
} from "./messagingTemplateSave";

export { canAddManualContentAsTemplate, hasSelectedTemplate, isManualContentValid };

/**
 * Insert a token into a string at the given cursor range.
 * @param {string} value
 * @param {string} token
 * @param {number | null | undefined} start
 * @param {number | null | undefined} end
 */
export function insertAtCursor(value, token, start = null, end = null) {
  const text = String(value ?? "");
  const safeStart =
    typeof start === "number" && start >= 0 ? start : text.length;
  const safeEnd = typeof end === "number" && end >= safeStart ? end : safeStart;
  const next = `${text.slice(0, safeStart)}${token}${text.slice(safeEnd)}`;
  return {
    value: next,
    cursor: safeStart + token.length,
  };
}

/**
 * Human label for a messaging channel key.
 * @param {string | null | undefined} channel
 */
export function channelDisplayName(channel) {
  const map = {
    whatsapp: "WhatsApp",
    sms: "SMS",
    email: "Email",
    push: "Push",
    ai: "AI",
    voice: "Voice",
    ivr: "IVR",
  };
  return map[String(channel || "").toLowerCase()] || "this channel";
}

/**
 * Send Email is valid when either a template is selected OR
 * both subject and body are provided manually.
 * @param {Record<string, unknown>} data
 */
export function isSendEmailContentValid(data) {
  return hasSelectedTemplate(data) || isManualContentValid("sendEmail", data);
}

/**
 * Send Push is valid when either a template is selected OR
 * both title and body are provided manually.
 * @param {Record<string, unknown>} data
 */
export function isSendPushContentValid(data) {
  return hasSelectedTemplate(data) || isManualContentValid("sendPush", data);
}

/**
 * @param {Record<string, unknown>} data
 */
export function isSendWhatsAppContentValid(data) {
  return hasSelectedTemplate(data) || isManualContentValid("sendWhatsApp", data);
}

/**
 * @param {Record<string, unknown>} data
 */
export function isSendSmsContentValid(data) {
  return hasSelectedTemplate(data) || isManualContentValid("sendSms", data);
}

/**
 * @param {Record<string, unknown>} data
 */
export function isSendAiChatContentValid(data) {
  return hasSelectedTemplate(data) || isManualContentValid("sendAiChat", data);
}

/**
 * @param {Record<string, unknown>} data
 */
export function isSendAiVoiceContentValid(data) {
  return hasSelectedTemplate(data) || isManualContentValid("sendAiVoice", data);
}

/**
 * Required messaging fields by node type for catalog-style checks.
 * Conditional nodes return [] — see getMessagingFieldErrors.
 * @param {string} nodeType
 * @returns {{ key: string, label: string }[]}
 */
export function getMessagingRequiredFields(nodeType) {
  switch (nodeType) {
    case "sendEmail":
    case "sendPush":
    case "sendWhatsApp":
    case "sendSms":
    case "sendAiChat":
    case "sendAiVoice":
      return [];
    case "sendTemplate":
      return [
        { key: "templateId", label: "Template" },
        { key: "channel", label: "Primary Channel" },
        { key: "recipient", label: "Recipient" },
      ];
    case "sendIvr":
      return [{ key: "templateId", label: "Template" }];
    default:
      return [{ key: "templateId", label: "Template" }];
  }
}

/**
 * @param {Record<string, unknown>} data
 * @param {string} nodeType
 * @returns {Record<string, string>}
 */
export function getMessagingFieldErrors(data, nodeType) {
  const errors = {};
  const d = data || {};

  if (nodeType === "sendEmail") {
    if (isSendEmailContentValid(d)) return errors;
    errors.templateId = "Select a template or enter subject and body.";
    if (!isFilled(d.subject)) {
      errors.subject = "Subject required when no template is selected";
    }
    if (!isFilled(d.body)) {
      errors.body = "Body required when no template is selected";
    }
    return errors;
  }

  if (nodeType === "sendPush") {
    if (isSendPushContentValid(d)) return errors;
    errors.templateId = "Select a template or enter a title and body.";
    if (!isFilled(d.title)) {
      errors.title = "Title required when no template is selected";
    }
    if (!isFilled(d.body)) {
      errors.body = "Body required when no template is selected";
    }
    return errors;
  }

  if (nodeType === "sendWhatsApp") {
    if (isSendWhatsAppContentValid(d)) return errors;
    errors.templateId = "Select a template or enter a message.";
    if (!isFilled(d.message)) {
      errors.message = "Message required when no template is selected";
    }
    return errors;
  }

  if (nodeType === "sendSms") {
    if (isSendSmsContentValid(d)) return errors;
    errors.templateId = "Select a template or enter a message.";
    if (!isFilled(d.message)) {
      errors.message = "Message required when no template is selected";
    }
    return errors;
  }

  if (nodeType === "sendAiChat") {
    if (isSendAiChatContentValid(d)) return errors;
    errors.templateId = "Select a template or enter a prompt.";
    if (!isFilled(d.prompt)) {
      errors.prompt = "Prompt required when no template is selected";
    }
    return errors;
  }

  if (nodeType === "sendAiVoice") {
    if (isSendAiVoiceContentValid(d)) return errors;
    errors.templateId = "Select a voice template or enter a prompt.";
    if (!isFilled(d.prompt)) {
      errors.prompt = "Prompt required when no template is selected";
    }
    return errors;
  }

  for (const field of getMessagingRequiredFields(nodeType)) {
    const value = d[field.key];
    if (!isFilled(value)) {
      errors[field.key] = `${field.label} required`;
    }
  }
  return errors;
}
