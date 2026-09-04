/**
 * Messaging node ↔ notification template helpers.
 * Keeps template-create payload mapping in one place for all messaging nodes.
 */

/**
 * @param {unknown} value
 */
export function isFilled(value) {
  return value != null && String(value).trim() !== "";
}

/**
 * @param {Record<string, unknown> | null | undefined} data
 */
export function hasSelectedTemplate(data) {
  return isFilled(data?.templateId ?? data?.template_id);
}

/**
 * Nodes that support "template OR manual content" + Add to Template.
 * sendTemplate / sendIvr are template-only (no manual content fields).
 */
export const TEMPLATE_OR_MANUAL_NODE_TYPES = new Set([
  "sendEmail",
  "sendSms",
  "sendWhatsApp",
  "sendPush",
  "sendAiChat",
  "sendAiVoice",
]);

/**
 * Whether manual content is complete enough for validation / Add to Template.
 * @param {string} nodeType
 * @param {Record<string, unknown> | null | undefined} data
 */
export function isManualContentValid(nodeType, data = {}) {
  switch (nodeType) {
    case "sendEmail":
      return isFilled(data.subject) && isFilled(data.body);
    case "sendPush":
      return isFilled(data.title) && isFilled(data.body);
    case "sendWhatsApp":
    case "sendSms":
      return isFilled(data.message);
    case "sendAiChat":
    case "sendAiVoice":
      return isFilled(data.prompt);
    default:
      return false;
  }
}

/**
 * Show "+ Add to Template" only when no template is selected and manual content is valid.
 * @param {string} nodeType
 * @param {Record<string, unknown> | null | undefined} data
 */
export function canAddManualContentAsTemplate(nodeType, data = {}) {
  if (!TEMPLATE_OR_MANUAL_NODE_TYPES.has(nodeType)) return false;
  if (hasSelectedTemplate(data)) return false;
  return isManualContentValid(nodeType, data);
}

/**
 * Build POST /workflow/templates payload from node.data + template name.
 * Uses only fields already recognized by normalizeTemplateItem / ApiTemplate.
 *
 * @param {object} params
 * @param {string} params.nodeType
 * @param {Record<string, unknown>} params.data
 * @param {string} params.name
 * @param {string} params.channel
 */
export function buildCreateTemplatePayload({ nodeType, data, name, channel }) {
  const trimmedName = String(name || "").trim();
  const payload = {
    name: trimmedName,
    channel: String(channel || "").toLowerCase(),
    status: "active",
  };

  switch (nodeType) {
    case "sendEmail":
      payload.subject = String(data?.subject ?? "");
      payload.body = String(data?.body ?? "");
      payload.message = String(data?.body ?? "");
      break;
    case "sendPush":
      payload.title = String(data?.title ?? "");
      payload.body = String(data?.body ?? "");
      payload.message = String(data?.body ?? "");
      if (isFilled(data?.priority)) {
        payload.priority = String(data.priority);
      }
      break;
    case "sendWhatsApp":
      payload.message = String(data?.message ?? "");
      payload.body = String(data?.message ?? "");
      if (isFilled(data?.buttons)) {
        payload.buttons = String(data.buttons);
      }
      break;
    case "sendSms":
      payload.message = String(data?.message ?? "");
      payload.body = String(data?.message ?? "");
      break;
    case "sendAiChat":
    case "sendAiVoice":
      payload.message = String(data?.prompt ?? "");
      payload.body = String(data?.prompt ?? "");
      // temperature is node-side config; include only if present on the node
      // so backends that accept it can store it without inventing new UI fields.
      if (data?.temperature != null && data.temperature !== "") {
        payload.temperature = Number(data.temperature);
      }
      break;
    default:
      break;
  }

  return payload;
}

/**
 * Extract created template id from create API response envelopes.
 * @param {unknown} response
 * @returns {string | null}
 */
export function extractCreatedTemplateId(response) {
  const body = response?.data ?? response;
  const item = body?.data ?? body?.template ?? body;
  const id = item?.id ?? item?.key ?? body?.id ?? null;
  return id == null || id === "" ? null : String(id);
}
