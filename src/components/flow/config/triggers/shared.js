/**
 * Shared options for hospital workflow Trigger nodes.
 * Filter / select lists can later be replaced by Laravel API payloads.
 */

/** @typedef {{ value: string | number, label: string }} SelectOption */

/** @type {SelectOption[]} */
export const NOTIFICATION_CHANNEL_OPTIONS = [
  { value: "push", label: "Push" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "sms", label: "SMS" },
  { value: "email", label: "Email" },
  { value: "in_app", label: "In-App" },
];

/** @type {SelectOption[]} */
export const EXECUTION_STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "paused", label: "Paused" },
  { value: "archived", label: "Archived" },
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
export const AI_PROVIDER_OPTIONS = [
  { value: "openai", label: "OpenAI" },
  { value: "azure_openai", label: "Azure OpenAI" },
  { value: "google", label: "Google Gemini" },
  { value: "anthropic", label: "Anthropic" },
  { value: "custom", label: "Custom / Hospital Model" },
];

/** @type {SelectOption[]} */
export const DELAY_OPTIONS = [
  { value: "immediate", label: "Immediately" },
  { value: "15m", label: "After 15 Minutes" },
  { value: "30m", label: "After 30 Minutes" },
  { value: "1h", label: "After 1 Hour" },
  { value: "2h", label: "After 2 Hours" },
  { value: "6h", label: "After 6 Hours" },
  { value: "12h", label: "After 12 Hours" },
  { value: "24h", label: "After 24 Hours" },
  { value: "2d", label: "After 2 Days" },
  { value: "3d", label: "After 3 Days" },
  { value: "7d", label: "After 7 Days" },
];

/**
 * Shared baseline for notification-style triggers.
 * @param {object} overrides
 */
export function createBaseTriggerDefaults(overrides = {}) {
  const base = {
    label: "Trigger",
    executionStatus: "draft",
    status: "draft",
    channels: ["whatsapp", "push"],
    repeatReminder: false,
    retryInterval: 15,
    maxRetryCount: 2,
    messageTemplate: "",
    delay: "immediate",
  };

  const merged = { ...base, ...overrides };

  // Drop null/undefined override keys so chatbot/AI nodes stay clean
  Object.keys(merged).forEach((key) => {
    if (merged[key] === undefined || merged[key] === null) {
      delete merged[key];
    }
  });

  if (merged.executionStatus) {
    merged.status = merged.executionStatus;
  }

  return merged;
}

/**
 * @param {string} template
 * @param {Record<string, string | number>} [context]
 */
export function renderTemplate(template, context = {}) {
  if (!template) return "";
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = context[key];
    return value == null || value === "" ? match : String(value);
  });
}
