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

/** Booking / booking-like sources. */
export const BOOKING_SOURCE_OPTIONS = [
  { value: "any", label: "Any" },
  { value: "mobile", label: "Mobile" },
  { value: "website", label: "Website" },
  { value: "admin", label: "Admin" },
];

/** Invoice sources (includes API). */
export const INVOICE_SOURCE_OPTIONS = [
  { value: "any", label: "Any" },
  { value: "mobile", label: "Mobile" },
  { value: "website", label: "Website" },
  { value: "admin", label: "Admin" },
  { value: "api", label: "API" },
];

/** Who cancelled an appointment. */
export const CANCELLED_BY_OPTIONS = [
  { value: "any", label: "Any" },
  { value: "patient", label: "Patient" },
  { value: "doctor", label: "Doctor" },
  { value: "admin", label: "Admin" },
];

/** Registration sources for Patient Registered. */
export const REGISTRATION_SOURCE_OPTIONS = [
  { value: "any", label: "Any" },
  { value: "app", label: "App" },
  { value: "website", label: "Website" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "hospital", label: "Hospital" },
  { value: "api", label: "API" },
];

/** Patient type filter. */
export const PATIENT_TYPE_OPTIONS = [
  { value: "any", label: "Any" },
  { value: "new", label: "New" },
  { value: "existing", label: "Existing" },
];

/** Channels for On Message Received. */
export const MESSAGE_CHANNEL_OPTIONS = [
  { value: "any", label: "Any" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "web_chat", label: "Web Chat" },
  { value: "app_chat", label: "App Chat" },
];

/** Message types for On Message Received. */
export const MESSAGE_TYPE_OPTIONS = [
  { value: "any", label: "Any" },
  { value: "text", label: "Text" },
  { value: "image", label: "Image" },
  { value: "document", label: "Document" },
  { value: "audio", label: "Audio" },
  { value: "button_reply", label: "Button Reply" },
];

/** Match modes for On Message Received. */
export const MESSAGE_MATCH_OPTIONS = [
  { value: "any", label: "Any Message" },
  { value: "contains", label: "Contains" },
  { value: "exact", label: "Exact Match" },
  { value: "starts_with", label: "Starts With" },
];

/** Medicine Reminder Due timing. */
export const MEDICINE_REMINDER_TIMING_OPTIONS = [
  { value: "at_due", label: "At Due Time" },
  { value: "before_due", label: "Before Due Time" },
];

/** Appointment Reminder timing. */
export const APPOINTMENT_REMINDER_TIMING_OPTIONS = [
  { value: "before_24h", label: "24 Hours Before" },
  { value: "before_12h", label: "12 Hours Before" },
  { value: "before_6h", label: "6 Hours Before" },
  { value: "before_1h", label: "1 Hour Before" },
  { value: "at_time", label: "At Appointment Time" },
];

/** Birthday trigger timing. */
export const BIRTHDAY_TIMING_OPTIONS = [
  { value: "on_birthday", label: "On Birthday" },
  { value: "before_birthday", label: "Before Birthday" },
];

/** Anniversary type. */
export const ANNIVERSARY_TYPE_OPTIONS = [
  { value: "wedding", label: "Wedding" },
  { value: "registration", label: "Registration" },
  { value: "membership", label: "Membership" },
  { value: "womens_day", label: "Women's Day" },
  { value: "custom", label: "Custom" },
];

/** Anniversary / date trigger timing. */
export const DATE_TIMING_OPTIONS = [
  { value: "on_date", label: "On Date" },
  { value: "before_date", label: "Before Date" },
];

/** Membership / plan expiry timing. */
export const EXPIRY_TIMING_OPTIONS = [
  { value: "before_expiry", label: "Before Expiry" },
  { value: "on_expiry", label: "On Expiry" },
  { value: "after_expiry", label: "After Expiry" },
];

/**
 * Reward points update types.
 * Values are the backend contract: any/empty = every balance change.
 */
export const REWARD_UPDATE_OPTIONS = [
  { value: "any", label: "Any" },
  { value: "earned", label: "Points Added" },
  { value: "redeemed", label: "Points Redeemed" },
  { value: "adjusted", label: "Points Adjusted" },
];

/**
 * Reward sources already emitted on reward_source.
 * payment_earnings is the builder group for the four payment earnings.
 * any and an empty selection include every source.
 */
export const PAYMENT_EARNING_SOURCES = [
  "appointment_payment",
  "package_booking",
  "second_opinion_payment",
  "pharmacy_payment",
];

export const REWARD_SOURCE_OPTIONS = [
  { value: "any", label: "Any Source" },
  { value: "payment_earnings", label: "Payment Earnings" },
  { value: "appointment_payment", label: "Appointment Payment" },
  { value: "package_booking", label: "Package Booking" },
  { value: "second_opinion_payment", label: "Second Opinion Payment" },
  { value: "pharmacy_payment", label: "Pharmacy Payment" },
  { value: "payment", label: "Payment" },
  { value: "appointment_redemption", label: "Appointment Redemption" },
  { value: "package_redemption", label: "Package Redemption" },
  { value: "second_opinion_redemption", label: "Second Opinion Redemption" },
  { value: "redemption", label: "Redemption" },
  { value: "hip_points", label: "HIP Points" },
  { value: "bill_analysis", label: "Bill Analysis" },
  { value: "wallet", label: "Wallet" },
];

const REWARD_SOURCE_ALIASES = {
  any: "any",
  any_source: "any",
  "any source": "any",
  all: "any",
  payment_earnings: "payment_earnings",
  "payment earnings": "payment_earnings",
  appointment_payment: "appointment_payment",
  "appointment payment": "appointment_payment",
  package_booking: "package_booking",
  "package booking": "package_booking",
  second_opinion_payment: "second_opinion_payment",
  "second opinion payment": "second_opinion_payment",
  pharmacy_payment: "pharmacy_payment",
  "pharmacy payment": "pharmacy_payment",
  payment: "payment",
  appointment_redemption: "appointment_redemption",
  "appointment redemption": "appointment_redemption",
  package_redemption: "package_redemption",
  "package redemption": "package_redemption",
  second_opinion_redemption: "second_opinion_redemption",
  "second opinion redemption": "second_opinion_redemption",
  redemption: "redemption",
  hip_points: "hip_points",
  "hip points": "hip_points",
  bill_analysis: "bill_analysis",
  "bill analysis": "bill_analysis",
  wallet: "wallet",
};

/** Legacy builder values saved before the backend contract used earned/redeemed/adjusted. */
const LEGACY_REWARD_UPDATE_TYPES = {
  any: "any",
  points_added: "earned",
  points_redeemed: "redeemed",
  points_adjusted: "adjusted",
  earned: "earned",
  redeemed: "redeemed",
  adjusted: "adjusted",
};

const REWARD_POINTS_NODE_ALIASES = new Set([
  "rewardUpdated",
  "reward_updated",
  "RewardPointsUpdated",
  "rewardPointsUpdated",
  "reward_points_updated",
]);

/**
 * Map one Update Type entry onto the backend value.
 * Empty input stays empty. Unknown values are dropped.
 * @param {unknown} value
 * @returns {string[]}
 */
export function normalizeRewardUpdateTypeList(value) {
  if (value == null || value === "") return [];
  const list = Array.isArray(value) ? value : [value];
  const next = [];
  const seen = new Set();
  for (const item of list) {
    const raw = String(item ?? "").trim();
    if (!raw) continue;
    const mapped =
      LEGACY_REWARD_UPDATE_TYPES[raw] ||
      LEGACY_REWARD_UPDATE_TYPES[raw.toLowerCase()];
    if (!mapped || seen.has(mapped)) continue;
    seen.add(mapped);
    next.push(mapped);
  }
  return next;
}

/**
 * Map one Reward Source entry onto the stored value.
 * Empty input stays empty. Unknown values are dropped.
 * @param {unknown} value
 * @returns {string[]}
 */
export function normalizeRewardSourceList(value) {
  if (value == null || value === "") return [];
  const list = Array.isArray(value) ? value : [value];
  const next = [];
  const seen = new Set();
  for (const item of list) {
    const raw = String(item ?? "").trim();
    if (!raw) continue;
    const mapped =
      REWARD_SOURCE_ALIASES[raw] ||
      REWARD_SOURCE_ALIASES[raw.toLowerCase()] ||
      REWARD_SOURCE_ALIASES[raw.toLowerCase().replace(/[\s-]+/g, "_")];
    if (!mapped || seen.has(mapped)) continue;
    seen.add(mapped);
    next.push(mapped);
  }
  return next;
}

/**
 * Persist Reward Points Updated with backend update types.
 * `any` and an empty list both mean every balance change.
 * Does not rewrite other triggers that also store `updateType`.
 * @param {Record<string, unknown>} data
 */
export function normalizeRewardUpdatedData(data = {}) {
  if (!data || typeof data !== "object") return data;
  const nodeType = String(data.nodeType || "");
  const triggerKey = String(data.triggerKey || "");
  if (
    !REWARD_POINTS_NODE_ALIASES.has(nodeType) &&
    !REWARD_POINTS_NODE_ALIASES.has(triggerKey)
  ) {
    return data;
  }

  const next = { ...data };
  if (REWARD_POINTS_NODE_ALIASES.has(nodeType) && nodeType !== "rewardUpdated") {
    next.nodeType = "rewardUpdated";
  }
  if (Object.prototype.hasOwnProperty.call(data, "updateType")) {
    next.updateType = normalizeRewardUpdateTypeList(data.updateType);
  }
  if (Object.prototype.hasOwnProperty.call(data, "rewardSource")) {
    next.rewardSource = normalizeRewardSourceList(data.rewardSource);
  }
  return next;
}

/** Family package tier update types. */
export const FAMILY_TIER_UPDATE_OPTIONS = [
  { value: "any", label: "Any" },
  { value: "upgraded", label: "Upgraded" },
  { value: "downgraded", label: "Downgraded" },
];

/** Payment modes. */
export const PAYMENT_MODE_OPTIONS = [
  { value: "any", label: "Any" },
  { value: "online", label: "Online" },
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "upi", label: "UPI" },
  { value: "bank_transfer", label: "Bank Transfer" },
];

/** Webhook HTTP methods. */
export const WEBHOOK_METHOD_OPTIONS = [{ value: "POST", label: "POST" }];

/** Scheduled event type. */
export const SCHEDULE_TYPE_OPTIONS = [
  { value: "once", label: "Once" },
  { value: "recurring", label: "Recurring" },
];

/** Recurring frequency. */
export const REPEAT_FREQUENCY_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
  { value: "custom", label: "Custom" },
];

/** Schedule end condition. */
export const END_CONDITION_OPTIONS = [
  { value: "never", label: "Never" },
  { value: "on_date", label: "On Date" },
  { value: "after_runs", label: "After Number of Runs" },
];

/** @deprecated Legacy delivery channels — messaging nodes own channels now. */
export const TRIGGER_CHANNEL_OPTIONS = [
  { value: "push", label: "Push Notification" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "sms", label: "SMS" },
  { value: "email", label: "Email" },
];

/**
 * Coerce multi-select values to string[].
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

const PREVIEW_TOKEN = /\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g;

function normalizePreviewKey(key) {
  return key.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase();
}

function previewScalar(value) {
  if (value == null || value === "") return undefined;
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value === "string" || typeof value === "boolean") return value;
  return undefined;
}

function readPreviewPath(source, path) {
  if (source == null || typeof source !== "object") return undefined;
  if (Object.prototype.hasOwnProperty.call(source, path)) return source[path];
  if (!path.includes(".")) return undefined;
  let current = source;
  for (const part of path.split(".")) {
    if (
      current == null ||
      typeof current !== "object" ||
      !Object.prototype.hasOwnProperty.call(current, part)
    ) {
      return undefined;
    }
    current = current[part];
  }
  return current;
}

/**
 * Local preview only. Substitutes a placeholder when that value is already
 * present, including 0 and negative numbers. Missing or blank values stay
 * visible as the original placeholder. This does not send a message.
 * @param {string} template
 * @param {Record<string, unknown>} [context]
 */
export function renderTemplate(template, context = {}) {
  if (!template) return "";
  return template.replace(PREVIEW_TOKEN, (match, key) => {
    const direct = previewScalar(readPreviewPath(context, key));
    if (direct !== undefined) return String(direct);
    if (key.includes(".")) return match;

    const normalized = normalizePreviewKey(key);
    const alias = previewScalar(readPreviewPath(context, normalized));
    if (alias !== undefined) return String(alias);
    if (normalized === "patient_mobile") {
      const mobile = previewScalar(readPreviewPath(context, "patient.mobile"));
      if (mobile !== undefined) return String(mobile);
    }
    if (normalized === "patient_name") {
      const name = previewScalar(readPreviewPath(context, "patient.name"));
      if (name !== undefined) return String(name);
    }
    return match;
  });
}

/**
 * Normalize Medicine Reminder Due node data to the event-form shape.
 * @param {Record<string, unknown>} data
 */
export function normalizeMedicineReminderData(data = {}) {
  if (!data || data.nodeType !== "medicineReminder") return data;

  const next = { ...data };
  const legacyTiming = {
    at_time: "at_due",
    before_30: "before_due",
    before_60: "before_due",
    immediate: "at_due",
    exact: "at_due",
    before_15: "before_due",
  };

  if (next.reminderTiming == null && next.triggerTiming) {
    next.reminderTiming = legacyTiming[next.triggerTiming] || next.triggerTiming;
  }
  if (next.reminderTiming && legacyTiming[next.reminderTiming]) {
    next.reminderTiming = legacyTiming[next.reminderTiming];
  }

  if (!next.triggerName && next.label) next.triggerName = String(next.label);

  // Strip prescription / messaging leftovers — clinical data comes from Laravel.
  delete next.medicineName;
  delete next.dosage;
  delete next.frequency;
  delete next.startDate;
  delete next.endDate;
  delete next.reminderTime;
  delete next.reminderType;
  delete next.recipient;
  delete next.channels;
  delete next.repeatReminder;
  delete next.retryInterval;
  delete next.maxRetryCount;
  delete next.messageTemplate;
  delete next.triggerTiming;

  return next;
}
