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

/** Reward points update types. */
export const REWARD_UPDATE_OPTIONS = [
  { value: "any", label: "Any" },
  { value: "points_added", label: "Points Added" },
  { value: "points_redeemed", label: "Points Redeemed" },
  { value: "points_adjusted", label: "Points Adjusted" },
];

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
  if (!next.reminderTiming) next.reminderTiming = "at_due";

  if (next.minutesBefore == null || next.minutesBefore === "") {
    next.minutesBefore = 30;
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
