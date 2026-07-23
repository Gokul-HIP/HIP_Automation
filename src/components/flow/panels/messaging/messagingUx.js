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
 * @param {unknown} value
 */
function isFilled(value) {
  return value != null && String(value).trim() !== "";
}

/**
 * Template OR manual content validation shared by email / push nodes.
 * @param {Record<string, unknown>} data
 * @param {{ primary: string, secondary: string }} fields
 */
function isTemplateOrManualValid(data, { primary, secondary }) {
  const hasTemplate = isFilled(data?.templateId ?? data?.template_id);
  if (hasTemplate) return true;
  return isFilled(data?.[primary]) && isFilled(data?.[secondary]);
}

/**
 * Send Email is valid when either a template is selected OR
 * both subject and body are provided manually.
 * @param {Record<string, unknown>} data
 */
export function isSendEmailContentValid(data) {
  return isTemplateOrManualValid(data || {}, {
    primary: "subject",
    secondary: "body",
  });
}

/**
 * Send Push is valid when either a template is selected OR
 * both title and body are provided manually.
 * @param {Record<string, unknown>} data
 */
export function isSendPushContentValid(data) {
  return isTemplateOrManualValid(data || {}, {
    primary: "title",
    secondary: "body",
  });
}

/**
 * Required messaging fields by node type for inline validation.
 * Email / Push use conditional rules — see getMessagingFieldErrors.
 * @param {string} nodeType
 * @returns {{ key: string, label: string }[]}
 */
export function getMessagingRequiredFields(nodeType) {
  switch (nodeType) {
    case "sendEmail":
    case "sendPush":
      return [];
    case "sendWhatsApp":
      return [
        { key: "templateId", label: "Template" },
        { key: "message", label: "Message" },
      ];
    case "sendSms":
      return [
        { key: "templateId", label: "Template" },
        { key: "message", label: "Message" },
      ];
    case "sendAiChat":
      return [
        { key: "templateId", label: "Template" },
        { key: "prompt", label: "Prompt" },
      ];
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

  if (nodeType === "sendEmail") {
    if (isSendEmailContentValid(data || {})) return errors;

    if (!isFilled(data?.templateId ?? data?.template_id)) {
      errors.templateId = "Select a template or enter subject and body";
    }
    if (!isFilled(data?.subject)) {
      errors.subject = "Subject required when no template is selected";
    }
    if (!isFilled(data?.body)) {
      errors.body = "Body required when no template is selected";
    }
    return errors;
  }

  if (nodeType === "sendPush") {
    if (isSendPushContentValid(data || {})) return errors;

    if (!isFilled(data?.templateId ?? data?.template_id)) {
      errors.templateId = "Select a template or enter title and body";
    }
    if (!isFilled(data?.title)) {
      errors.title = "Title required when no template is selected";
    }
    if (!isFilled(data?.body)) {
      errors.body = "Body required when no template is selected";
    }
    return errors;
  }

  for (const field of getMessagingRequiredFields(nodeType)) {
    const value = data?.[field.key];
    if (!isFilled(value)) {
      errors[field.key] = `${field.label} required`;
    }
  }
  return errors;
}
