export const WAIT_SCHEMAS = {
  wait: {
    description: "Pause the workflow for a configured duration.",
    fields: [
      { key: "label", type: "text", label: "Display Name", required: true },
      { key: "waitType", type: "select", label: "Wait Type", options: [
        { value: "duration", label: "Duration" },
        { value: "until", label: "Wait Until Date" },
        { value: "cron", label: "Cron Schedule" },
        { value: "recurring", label: "Recurring" },
      ], required: true },
      { key: "amount", type: "number", label: "Amount", min: 1, showWhen: { waitType: "duration" } },
      { key: "unit", type: "select", label: "Unit", options: [
        { value: "minutes", label: "Minutes" },
        { value: "hours", label: "Hours" },
        { value: "days", label: "Days" },
      ], showWhen: { waitType: "duration" } },
      { key: "untilDate", type: "text", label: "Until Date / Time", placeholder: "2026-07-21T10:00", showWhen: { waitType: "until" } },
      { key: "cron", type: "text", label: "Cron Expression", placeholder: "0 9 * * *", showWhen: { waitType: "cron" } },
      { key: "recurringInterval", type: "select", label: "Recurring Interval", options: [
        { value: "daily", label: "Daily" },
        { value: "weekly", label: "Weekly" },
        { value: "monthly", label: "Monthly" },
      ], showWhen: { waitType: "recurring" } },
    ],
    defaults: {
      label: "Wait",
      status: "draft",
      waitType: "duration",
      amount: 30,
      unit: "minutes",
      untilDate: "",
      cron: "",
      recurringInterval: "daily",
    },
  },

  delay: {
    description: "Delay before the next step executes.",
    fields: [
      { key: "label", type: "text", label: "Display Name", required: true },
      { key: "amount", type: "number", label: "Amount", required: true, min: 1 },
      { key: "unit", type: "select", label: "Unit", options: [
        { value: "minutes", label: "Minutes" },
        { value: "hours", label: "Hours" },
        { value: "days", label: "Days" },
      ], required: true },
    ],
    defaults: { label: "Delay", status: "draft", amount: 1, unit: "hours" },
  },

  waitUntil: {
    description: "Wait until a specific date and time.",
    fields: [
      { key: "label", type: "text", label: "Display Name", required: true },
      { key: "untilDate", type: "text", label: "Until Date / Time", required: true, placeholder: "2026-07-21T10:00" },
    ],
    defaults: { label: "Wait Until", status: "draft", untilDate: "" },
  },

  cronSchedule: {
    description: "Schedule the next step using a cron expression.",
    fields: [
      { key: "label", type: "text", label: "Display Name", required: true },
      { key: "cron", type: "text", label: "Cron Expression", required: true, placeholder: "0 9 * * *" },
    ],
    defaults: { label: "Cron Schedule", status: "draft", cron: "0 9 * * *" },
  },

  recurring: {
    description: "Repeat on a recurring interval.",
    fields: [
      { key: "label", type: "text", label: "Display Name", required: true },
      { key: "recurringInterval", type: "select", label: "Interval", options: [
        { value: "daily", label: "Daily" },
        { value: "weekly", label: "Weekly" },
        { value: "monthly", label: "Monthly" },
      ], required: true },
    ],
    defaults: { label: "Recurring", status: "draft", recurringInterval: "weekly" },
  },
};

export function getWaitSchema(type) {
  return WAIT_SCHEMAS[type] ?? null;
}

export function buildWaitDefaults(type) {
  const schema = getWaitSchema(type);
  if (!schema) return null;
  return structuredClone(schema.defaults);
}
