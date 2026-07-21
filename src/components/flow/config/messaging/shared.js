/** @typedef {{ value: string | number, label: string }} SelectOption */

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
