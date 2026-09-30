/** @typedef {{ value: string | number, label: string }} SelectOption */

/**
 * Node type → template API channel.
 * Used by the property panel — never ask the user to pick a channel.
 * @type {Record<string, string>}
 */
export const TEMPLATE_CHANNEL_BY_NODE = {
  sendWhatsApp: "whatsapp",
  sendSms: "sms",
  sendEmail: "email",
  sendPush: "push",
  sendAiChat: "ai",
  sendAiVoice: "voice",
  sendIvr: "ivr",
};

/**
 * @param {string | null | undefined} nodeType
 * @returns {string | null}
 */
export function getTemplateChannelForNode(nodeType) {
  if (!nodeType) return null;
  return TEMPLATE_CHANNEL_BY_NODE[nodeType] ?? null;
}

/** @type {SelectOption[]} */
export const NOTIFICATION_CHANNEL_OPTIONS = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "sms", label: "SMS" },
  { value: "email", label: "Email" },
  { value: "push", label: "Push Notification" },
  // { value: "in_app", label: "In-App Notification" },
];

/** @type {SelectOption[]} */
export const RECIPIENT_OPTIONS = [
  { value: "patient", label: "Patient" },
  { value: "doctor", label: "Doctor" },
  { value: "caregiver", label: "Caregiver" },
  { value: "custom", label: "Custom expression" },
];

/** @type {SelectOption[]} */
export const RETRY_INTERVAL_OPTIONS = [
  { value: 5, label: "5 Minutes" },
  { value: 10, label: "10 Minutes" },
  { value: 15, label: "15 Minutes" },
  { value: 30, label: "30 Minutes" },
  { value: 60, label: "1 Hour" },
];

/** @type {SelectOption[]} */
export const PUSH_PRIORITY_OPTIONS = [
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
];

export function createMessagingDefaults(overrides = {}) {
  return {
    label: "Send Message",
    status: "draft",
    templateId: "",
    recipient: "patient",
    repeatReminder: false,
    retryInterval: 15,
    maxRetryCount: 2,
    fallbackChannel: "",
    variables: {},
    ...overrides,
  };
}

/** Backend Send Email / Send WhatsApp node key (camelCase). */
export const ATTACH_INVOICE_PDF_KEY = "attachInvoicePdf";
export const ATTACH_PRESCRIPTION_PDF_KEY = "attachPrescriptionPdf";

/**
 * WhatsJet send-media-message supports document attachments
 * (media_type=document, media_url=public invoice/prescription PDF).
 */
export const WHATSAPP_DOCUMENT_ATTACHMENTS_SUPPORTED = true;

/**
 * Shared Attachments → Attach Invoice PDF field.
 * @param {"sendEmail" | "sendWhatsApp"} nodeType
 */
export function getAttachInvoicePdfField(nodeType) {
  const whatsappUnsupported =
    nodeType === "sendWhatsApp" && !WHATSAPP_DOCUMENT_ATTACHMENTS_SUPPORTED;
  return {
    key: ATTACH_INVOICE_PDF_KEY,
    type: "boolean",
    label: "Attach Invoice PDF",
    section: "Attachments",
    disabled: whatsappUnsupported,
    description: whatsappUnsupported
      ? "Invoice PDF attachments are not currently supported by the WhatsApp provider."
      : undefined,
  };
}

/**
 * Shared Attachments → Attach Prescription PDF field.
 * Section title is omitted so it sits under the Invoice PDF heading.
 * @param {"sendEmail" | "sendWhatsApp"} nodeType
 */
export function getAttachPrescriptionPdfField(nodeType) {
  const whatsappUnsupported =
    nodeType === "sendWhatsApp" && !WHATSAPP_DOCUMENT_ATTACHMENTS_SUPPORTED;
  return {
    key: ATTACH_PRESCRIPTION_PDF_KEY,
    type: "boolean",
    label: "Attach Prescription PDF",
    disabled: whatsappUnsupported,
    description: whatsappUnsupported
      ? "Prescription PDF attachments are not currently supported by the WhatsApp provider."
      : undefined,
  };
}

/**
 * @param {unknown} value
 * @param {string} camel
 * @param {string} snake
 * @returns {boolean}
 */
function readAttachmentFlag(value, camel, snake) {
  if (value && typeof value === "object") {
    return Boolean(value[camel] ?? value[snake] ?? false);
  }
  return Boolean(value);
}

/**
 * @param {unknown} value
 * @returns {boolean}
 */
export function isAttachInvoicePdfEnabled(value) {
  return readAttachmentFlag(value, ATTACH_INVOICE_PDF_KEY, "attach_invoice_pdf");
}

/**
 * @param {unknown} value
 * @returns {boolean}
 */
export function isAttachPrescriptionPdfEnabled(value) {
  return readAttachmentFlag(
    value,
    ATTACH_PRESCRIPTION_PDF_KEY,
    "attach_prescription_pdf"
  );
}

/**
 * Normalize attachment flags on messaging node data.
 * Maps snake_case aliases to the backend camelCase keys.
 * @param {Record<string, unknown> | null | undefined} data
 */
export function normalizeAttachInvoicePdfData(data) {
  if (!data || typeof data !== "object") return data ?? {};
  const nodeType = data.nodeType;
  if (nodeType !== "sendEmail" && nodeType !== "sendWhatsApp") {
    return data;
  }

  const next = {
    ...data,
    attachInvoicePdf: isAttachInvoicePdfEnabled(data),
    attachPrescriptionPdf: isAttachPrescriptionPdfEnabled(data),
  };
  delete next.attach_invoice_pdf;
  delete next.attach_prescription_pdf;
  return next;
}
