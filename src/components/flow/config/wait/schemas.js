export const WAIT_SCHEMAS = {
  wait: {
    description:
      "Pause the workflow for a duration, until a date, or relative to a context date (e.g. follow-up).",
    fields: [
      { key: "label", type: "text", label: "Display Name", required: true },
      {
        key: "waitType",
        type: "select",
        label: "Wait Type",
        options: [
          { value: "duration", label: "Duration" },
          { value: "until", label: "Wait Until Date" },
          { value: "relative_date", label: "Relative to Date Field" },
          { value: "cron", label: "Cron Schedule" },
          { value: "recurring", label: "Recurring" },
        ],
        required: true,
      },
      {
        key: "amount",
        type: "number",
        label: "Amount",
        min: 1,
        required: true,
        showWhen: { waitType: "duration" },
      },
      {
        key: "unit",
        type: "select",
        label: "Unit",
        options: [
          { value: "minutes", label: "Minutes" },
          { value: "hours", label: "Hours" },
          { value: "days", label: "Days" },
          { value: "weeks", label: "Weeks" },
        ],
        required: true,
        showWhen: { waitType: "duration" },
      },
      {
        key: "untilDate",
        type: "text",
        label: "Until Date / Time",
        placeholder: "2026-07-21T10:00",
        showWhen: { waitType: "until" },
      },
      {
        key: "relativeDateField",
        type: "select",
        label: "Date Field",
        options: [
          { value: "followup.date", label: "Follow-up date" },
          {
            value: "appointment.followup_date",
            label: "Appointment follow-up date",
          },
          { value: "appointment.date", label: "Appointment date" },
          {
            value: "appointment.appointment_date",
            label: "Appointment date (alias)",
          },
        ],
        required: true,
        showWhen: { waitType: "relative_date" },
        hint: "Resolved from workflow context at runtime (Laravel injects follow-up dates).",
      },
      {
        key: "relativeOffsetDirection",
        type: "select",
        label: "When",
        options: [
          { value: "before", label: "Before date" },
          { value: "on", label: "On date" },
          { value: "after", label: "After date" },
        ],
        required: true,
        showWhen: { waitType: "relative_date" },
      },
      {
        key: "relativeOffsetAmount",
        type: "number",
        label: "Offset Amount",
        min: 0,
        showWhen: { waitType: "relative_date" },
        hint: "Ignored when When = On date. Example: 4 + Days + Before = day-4 reminder.",
      },
      {
        key: "relativeOffsetUnit",
        type: "select",
        label: "Offset Unit",
        options: [
          { value: "minutes", label: "Minutes" },
          { value: "hours", label: "Hours" },
          { value: "days", label: "Days" },
          { value: "weeks", label: "Weeks" },
        ],
        showWhen: { waitType: "relative_date" },
      },
      {
        key: "cron",
        type: "text",
        label: "Cron Expression",
        placeholder: "0 9 * * *",
        showWhen: { waitType: "cron" },
      },
      {
        key: "recurringInterval",
        type: "select",
        label: "Recurring Interval",
        options: [
          { value: "daily", label: "Daily" },
          { value: "weekly", label: "Weekly" },
          { value: "monthly", label: "Monthly" },
        ],
        showWhen: { waitType: "recurring" },
      },
    ],
    defaults: {
      label: "Wait",
      status: "draft",
      waitType: "duration",
      amount: 30,
      unit: "minutes",
      untilDate: "",
      relativeDateField: "followup.date",
      relativeOffsetDirection: "before",
      relativeOffsetAmount: 4,
      relativeOffsetUnit: "days",
      cron: "",
      recurringInterval: "daily",
    },
  },

  delay: {
    description: "Delay before the next step executes.",
    fields: [
      { key: "label", type: "text", label: "Display Name", required: true },
      { key: "amount", type: "number", label: "Amount", required: true, min: 1 },
      {
        key: "unit",
        type: "select",
        label: "Unit",
        options: [
          { value: "minutes", label: "Minutes" },
          { value: "hours", label: "Hours" },
          { value: "days", label: "Days" },
        ],
        required: true,
      },
    ],
    defaults: { label: "Delay", status: "draft", amount: 1, unit: "hours" },
  },

  waitUntil: {
    description: "Wait until a specific date and time.",
    fields: [
      { key: "label", type: "text", label: "Display Name", required: true },
      {
        key: "untilDate",
        type: "text",
        label: "Until Date / Time",
        required: true,
        placeholder: "2026-07-21T10:00",
      },
    ],
    defaults: { label: "Wait Until", status: "draft", untilDate: "" },
  },

  cronSchedule: {
    description: "Schedule the next step using a cron expression.",
    fields: [
      { key: "label", type: "text", label: "Display Name", required: true },
      {
        key: "cron",
        type: "text",
        label: "Cron Expression",
        required: true,
        placeholder: "0 9 * * *",
      },
    ],
    defaults: { label: "Cron Schedule", status: "draft", cron: "0 9 * * *" },
  },

  recurring: {
    description: "Repeat on a recurring interval.",
    fields: [
      { key: "label", type: "text", label: "Display Name", required: true },
      {
        key: "recurringInterval",
        type: "select",
        label: "Interval",
        options: [
          { value: "daily", label: "Daily" },
          { value: "weekly", label: "Weekly" },
          { value: "monthly", label: "Monthly" },
        ],
        required: true,
      },
    ],
    defaults: {
      label: "Recurring",
      status: "draft",
      recurringInterval: "weekly",
    },
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
