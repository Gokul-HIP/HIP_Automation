/**
 * Shared options for hospital workflow Trigger nodes.
 */

/** @typedef {{ value: string | number, label: string }} SelectOption */

/** @type {SelectOption[]} */
export const EXECUTION_STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "paused", label: "Paused" },
  { value: "archived", label: "Archived" },
];

/** @type {SelectOption[]} */
export const AI_PROVIDER_OPTIONS = [
  { value: "openai", label: "OpenAI" },
  { value: "azure_openai", label: "Azure OpenAI" },
  { value: "google", label: "Google Gemini" },
  { value: "anthropic", label: "Anthropic" },
  { value: "custom", label: "Custom / Hospital Model" },
];

export const RECIPIENT_OPTIONS = [
  { value: "patient", label: "Patient" },
  { value: "doctor", label: "Doctor" },
  { value: "caregiver", label: "Caregiver" },
];

export const EXECUTION_DELAY_OPTIONS = [
  { value: "immediate", label: "Immediately" },
  { value: "5m", label: "5 Minutes" },
  { value: "10m", label: "10 Minutes" },
  { value: "30m", label: "30 Minutes" },
  { value: "1h", label: "1 Hour" },
  { value: "24h", label: "24 Hours" },
];

/** Delivery channels for reminder-style triggers (e.g. Medicine Reminder). */
export const TRIGGER_CHANNEL_OPTIONS = [
  { value: "push", label: "Push Notification" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "sms", label: "SMS" },
  { value: "email", label: "Email" },
  // { value: "in_app", label: "In-App Notification" },
];

/**
 * Coerce channels to a string[] for MultiSelect / JSON payload.
 * @param {unknown} value
 * @returns {string[]}
 */
export function normalizeChannelList(value) {
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map((v) => String(v).trim()).filter(Boolean);
        }
      } catch {
        /* fall through to CSV */
      }
    }
    return trimmed
      .split(/[,\s]+/)
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
}

export const RETRY_INTERVAL_OPTIONS = [
  { value: 5, label: "5 Minutes" },
  { value: 10, label: "10 Minutes" },
  { value: 15, label: "15 Minutes" },
  { value: 30, label: "30 Minutes" },
  { value: 60, label: "1 Hour" },
];

/**
 * Event-only baseline for trigger nodes.
 * @param {object} overrides
 */
export function createBaseTriggerDefaults(overrides = {}) {
  return {
    label: "Trigger",
    status: "draft",
    ...overrides,
  };
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

/**
 * Normalize legacy Medicine Reminder data keys for backward compatibility.
 * Strips prescription-editor leftovers so JSON stays trigger-config only.
 * @param {Record<string, unknown>} data
 */
export function normalizeMedicineReminderData(data = {}) {
  if (!data || data.nodeType !== "medicineReminder") return data;

  const next = { ...data };
  const legacyTiming = {
    at_due: "at_time",
    before_due: "before_30",
    exact: "at_time",
    before_15: "before_30",
  };

  if (next.triggerTiming && legacyTiming[next.triggerTiming]) {
    next.triggerTiming = legacyTiming[next.triggerTiming];
  }

  if (!Array.isArray(next.channels)) {
    next.channels = normalizeChannelList(next.channels);
    if (!next.channels.length) next.channels = ["push"];
  } else {
    next.channels = normalizeChannelList(next.channels);
  }

  if (next.repeatReminder == null) next.repeatReminder = false;
  if (next.retryInterval == null) next.retryInterval = 15;
  if (next.maxRetryCount == null) next.maxRetryCount = 2;
  if (next.messageTemplate == null) next.messageTemplate = "";
  if (!next.triggerName && next.label) next.triggerName = String(next.label);

  delete next.medicineName;
  delete next.dosage;
  delete next.frequency;
  delete next.startDate;
  delete next.endDate;
  delete next.reminderTime;
  delete next.reminderType;
  delete next.recipient;
  delete next.minutesBefore;

  return next;
}
