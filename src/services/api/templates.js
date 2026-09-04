import { apiClient, unwrapData } from "./client";

/**
 * @param {unknown} response
 */
export function normalizeTemplates(response) {
  const raw = unwrapData(response);
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.templates)
      ? raw.templates
      : Array.isArray(raw?.data)
        ? raw.data
        : [];

  return list.map((item) => normalizeTemplateItem(item));
}

/**
 * @param {Record<string, unknown>} item
 */
function normalizeTemplateItem(item) {
  if (!item || typeof item !== "object") {
    return {
      id: "",
      name: "Template",
      channel: "whatsapp",
      description: "",
      subject: null,
      title: null,
      body: null,
      message: null,
      buttons: null,
      priority: null,
      status: "active",
    };
  }

  return {
    id: String(item.id ?? item.key ?? ""),
    name: String(item.name ?? item.title ?? "Template"),
    channel: String(item.channel ?? item.type ?? "whatsapp").toLowerCase(),
    description: String(item.description ?? ""),
    subject: item.subject ?? null,
    title: item.title ?? item.push_title ?? null,
    body: item.body ?? item.content ?? item.message ?? null,
    message: item.message ?? item.body ?? item.content ?? null,
    buttons: item.buttons ?? item.button_text ?? item.cta ?? null,
    priority: item.priority ?? null,
    status: item.status ?? "active",
  };
}

/**
 * Normalize template preview API response into a structured preview object.
 * @param {unknown} response
 */
export function normalizeTemplatePreview(response) {
  const raw = unwrapData(response);

  if (typeof raw === "string") {
    return {
      title: null,
      subject: null,
      body: raw,
      message: raw,
      buttons: null,
      priority: null,
      preview: raw,
    };
  }

  if (!raw || typeof raw !== "object") {
    return {
      title: null,
      subject: null,
      body: null,
      message: null,
      buttons: null,
      priority: null,
      preview: "",
    };
  }

  const body =
    raw.body ??
    raw.content ??
    raw.message ??
    raw.preview ??
    raw.text ??
    null;

  const buttons = normalizeButtons(raw.buttons ?? raw.button_text ?? raw.cta);

  return {
    title: raw.title ?? raw.push_title ?? raw.name ?? null,
    subject: raw.subject ?? null,
    body: body != null ? String(body) : null,
    message: raw.message != null ? String(raw.message) : body != null ? String(body) : null,
    buttons,
    priority: raw.priority ?? null,
    preview:
      raw.preview != null
        ? String(raw.preview)
        : [raw.subject, raw.title, body].filter(Boolean).join("\n\n"),
  };
}

function normalizeButtons(value) {
  if (value == null || value === "") return null;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item;
        return item?.text ?? item?.label ?? item?.title ?? "";
      })
      .filter(Boolean)
      .join("\n");
  }
  if (typeof value === "object") {
    return value.text ?? value.label ?? JSON.stringify(value);
  }
  return String(value);
}

/**
 * Map preview / template data onto editable messaging node fields for a node type.
 * Does not overwrite Display Name / templateId.
 * @param {string} nodeType
 * @param {ReturnType<typeof normalizeTemplatePreview> & Record<string, unknown>} preview
 * @param {Record<string, unknown>} [templateMeta]
 */
export function mapTemplatePreviewToNodeFields(nodeType, preview, templateMeta = {}) {
  const source = { ...templateMeta, ...preview };
  const patch = {};

  const message = source.message ?? source.body ?? null;
  const body = source.body ?? source.message ?? null;
  const subject = source.subject ?? null;
  const title = source.title ?? null;
  const buttons = source.buttons ?? null;
  const priority = source.priority ?? null;

  switch (nodeType) {
    case "sendEmail":
      if (subject != null) patch.subject = String(subject);
      if (body != null) patch.body = String(body);
      break;
    case "sendPush": {
      const title =
        source.title ?? source.push_title ?? source.subject ?? source.name ?? null;
      const pushBody = body ?? message;
      if (title != null) patch.title = String(title);
      if (pushBody != null) patch.body = String(pushBody);
      if (priority != null) patch.priority = String(priority);
      break;
    }
    case "sendWhatsApp":
      if (message != null) patch.message = String(message);
      if (buttons != null) patch.buttons = String(buttons);
      break;
    case "sendSms":
      if (message != null) patch.message = String(message);
      break;
    case "sendAiChat":
    case "sendAiVoice":
      if (message != null) patch.prompt = String(message);
      break;
    default:
      if (message != null) patch.message = String(message);
      break;
  }

  return patch;
}

export async function fetchTemplates(channel = null) {
  const params = channel ? { channel } : {};
  const response = await apiClient.get("/workflow/templates", { params });
  return normalizeTemplates(response.data);
}

/**
 * Create a notification template via the existing Builder Connect templates resource.
 * Companion to GET /workflow/templates (no prior create helper existed in this repo).
 *
 * @param {Record<string, unknown>} payload
 */
export async function createTemplate(payload) {
  const response = await apiClient.post("/workflow/templates", payload);
  const raw = unwrapData(response.data);
  const item =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? raw.template && typeof raw.template === "object"
        ? raw.template
        : raw
      : null;
  return normalizeTemplateItem(item || response.data);
}

export async function previewTemplate(id, payload = {}) {
  const response = await apiClient.post(`/workflow/templates/${id}/preview`, payload);
  return normalizeTemplatePreview(response.data);
}
