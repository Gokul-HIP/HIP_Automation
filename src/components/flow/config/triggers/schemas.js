import {
  createBaseTriggerDefaults,
  BOOKING_SOURCE_OPTIONS,
  INVOICE_SOURCE_OPTIONS,
  CANCELLED_BY_OPTIONS,
  REGISTRATION_SOURCE_OPTIONS,
  PATIENT_TYPE_OPTIONS,
  MESSAGE_CHANNEL_OPTIONS,
  MESSAGE_TYPE_OPTIONS,
  MESSAGE_MATCH_OPTIONS,
  MEDICINE_REMINDER_TIMING_OPTIONS,
  APPOINTMENT_REMINDER_TIMING_OPTIONS,
  BIRTHDAY_TIMING_OPTIONS,
  ANNIVERSARY_TYPE_OPTIONS,
  DATE_TIMING_OPTIONS,
  EXPIRY_TIMING_OPTIONS,
  REWARD_UPDATE_OPTIONS,
  FAMILY_TIER_UPDATE_OPTIONS,
  PAYMENT_MODE_OPTIONS,
  WEBHOOK_METHOD_OPTIONS,
  SCHEDULE_TYPE_OPTIONS,
  REPEAT_FREQUENCY_OPTIONS,
  END_CONDITION_OPTIONS,
} from "./shared";

/** @param {string} [hint] */
function nameField(hint = "Enter trigger name") {
  return {
    key: "label",
    type: "text",
    label: "Trigger Name",
    required: true,
    hint,
    placeholder: hint,
  };
}

export const TRIGGER_SCHEMAS = {
  /* ── 1. On Message Received ── */
  onChatMessage: {
    description:
      "Triggers the workflow whenever a new incoming message is received through a supported communication channel.",
    laravelContext: ["context.patient", "context.message", "context.hospital"],
    contextCard: {
      title: "Message Context",
      note: "Injected by Laravel · read only",
      rows: [
        { label: "Patient", key: "patient_name" },
        { label: "Channel", key: "channel" },
        { label: "Message", key: "message_text" },
      ],
    },
    fields: [
      nameField(),
      {
        key: "channel",
        type: "multiselect",
        label: "Channel",
        options: MESSAGE_CHANNEL_OPTIONS,
        required: true,
        hint: "Which channels should start this workflow.",
      },
      {
        key: "messageType",
        type: "multiselect",
        label: "Message Type",
        options: MESSAGE_TYPE_OPTIONS,
        required: true,
        hint: "Filter by incoming message type.",
      },
      {
        key: "messageMatch",
        type: "select",
        label: "Message Match",
        options: MESSAGE_MATCH_OPTIONS,
        required: true,
        hint: "How the message content should be matched.",
      },
      {
        key: "tags",
        type: "tags",
        label: "Tags",
        hint: "Enter keywords such as appointment, doctor, help",
        placeholder: "appointment, doctor, help",
      },
    ],
    defaults: createBaseTriggerDefaults({
      label: "On Message Received",
      channel: ["any"],
      messageType: ["any"],
      messageMatch: "any",
      tags: [],
    }),
  },

  /* ── 2. Patient Registered ── */
  patientRegistered: {
    description:
      "Triggers the workflow whenever a patient is registered in the HIP system.",
    laravelContext: ["context.patient", "context.hospital"],
    contextCard: {
      title: "Patient Context",
      note: "Injected by Laravel · read only",
      rows: [
        { label: "Patient", key: "patient_name" },
        { label: "Mobile", key: "patient_mobile" },
        { label: "Hospital", key: "hospital_name" },
      ],
    },
    fields: [
      nameField(),
      {
        key: "registrationSource",
        type: "multiselect",
        label: "Registration Source",
        options: REGISTRATION_SOURCE_OPTIONS,
        required: true,
        hint: "Which registration sources should start this workflow.",
      },
      {
        key: "patientType",
        type: "select",
        label: "Patient Type",
        options: PATIENT_TYPE_OPTIONS,
        required: true,
      },
    ],
    defaults: createBaseTriggerDefaults({
      label: "Patient Registered",
      registrationSource: ["any"],
      patientType: "any",
    }),
  },

  /* ── 3. Appointment Booked ── */
  appointmentBooked: {
    description:
      "Triggers the workflow whenever a new appointment is successfully booked.",
    laravelContext: [
      "context.patient",
      "context.appointment",
      "context.doctor",
      "context.hospital",
    ],
    contextCard: {
      title: "Appointment Context",
      note: "Injected by Laravel · read only",
      rows: [
        { label: "Patient", key: "patient_name" },
        { label: "Doctor", key: "doctor_name" },
        { label: "Date", key: "appointment_date" },
        { label: "Time", key: "appointment_time" },
      ],
    },
    fields: [
      nameField(),
      {
        key: "source",
        type: "multiselect",
        label: "Source",
        options: BOOKING_SOURCE_OPTIONS,
        required: true,
        hint: "Which booking sources should start this workflow.",
      },
    ],
    defaults: createBaseTriggerDefaults({
      label: "Appointment Booked",
      source: ["any"],
    }),
  },

  /* ── Appointment Rescheduled ── */
  appointmentRescheduled: {
    description:
      "Triggers the workflow whenever an existing appointment is rescheduled.",
    laravelContext: [
      "context.patient",
      "context.appointment",
      "context.doctor",
      "context.hospital",
    ],
    contextCard: {
      title: "Appointment Context",
      note: "Injected by Laravel · read only",
      rows: [
        { label: "Patient", key: "patient_name" },
        { label: "Doctor", key: "doctor_name" },
        { label: "Old Date", key: "old_date" },
        { label: "New Date", key: "new_date" },
      ],
    },
    fields: [
      nameField(),
      {
        key: "source",
        type: "multiselect",
        label: "Source",
        options: BOOKING_SOURCE_OPTIONS,
        required: true,
        hint: "Which booking sources should start this workflow.",
      },
    ],
    defaults: createBaseTriggerDefaults({
      label: "Appointment Rescheduled",
      source: ["any"],
    }),
  },

  /* ── Appointment Completed ── */
  appointmentCompleted: {
    description:
      "Triggers the workflow whenever an appointment is marked as completed.",
    laravelContext: [
      "context.patient",
      "context.appointment",
      "context.followup",
      "context.doctor",
      "context.hospital",
    ],
    contextCard: {
      title: "Appointment Context",
      note: "Injected by Laravel · read only",
      rows: [
        { label: "Patient", key: "patient_name" },
        { label: "Doctor", key: "doctor_name" },
        { label: "Date", key: "appointment_date" },
        { label: "Time", key: "appointment_time" },
        { label: "Follow-up date", key: "followup_date" },
      ],
    },
    fields: [
      nameField(),
      {
        key: "source",
        type: "multiselect",
        label: "Source",
        options: BOOKING_SOURCE_OPTIONS,
        required: true,
        hint: "Which booking sources should start this workflow.",
      },
      {
        key: "requireFollowUp",
        type: "select",
        label: "Require Follow-up",
        options: [
          { value: "any", label: "Any completed visit" },
          { value: "yes", label: "Only when follow-up is set" },
        ],
        required: true,
        hint: "Use “Only when follow-up is set” for post-visit follow-up campaigns.",
      },
    ],
    defaults: createBaseTriggerDefaults({
      label: "Appointment Completed",
      source: ["any"],
      requireFollowUp: "any",
    }),
  },

  /* ── 4. Appointment Cancelled ── */
  appointmentCancelled: {
    description:
      "Triggers the workflow whenever an existing appointment is cancelled.",
    laravelContext: [
      "context.patient",
      "context.appointment",
      "context.doctor",
      "context.hospital",
    ],
    contextCard: {
      title: "Appointment Context",
      note: "Injected by Laravel · read only",
      rows: [
        { label: "Patient", key: "patient_name" },
        { label: "Doctor", key: "doctor_name" },
        { label: "Date", key: "appointment_date" },
      ],
    },
    fields: [
      nameField(),
      {
        key: "source",
        type: "multiselect",
        label: "Source",
        options: BOOKING_SOURCE_OPTIONS,
        required: true,
        hint: "Which booking sources should start this workflow.",
      },
      {
        key: "cancelledBy",
        type: "multiselect",
        label: "Cancelled By",
        options: CANCELLED_BY_OPTIONS,
        required: true,
        hint: "Who cancelled the appointment.",
      },
    ],
    defaults: createBaseTriggerDefaults({
      label: "Appointment Cancelled",
      source: ["any"],
      cancelledBy: ["any"],
    }),
  },

  /* ── 5. Appointment Missed ── */
  appointmentMissed: {
    description:
      "Triggers the workflow when a scheduled appointment is marked as missed or no-show.",
    laravelContext: [
      "context.patient",
      "context.appointment",
      "context.doctor",
      "context.hospital",
    ],
    contextCard: {
      title: "Appointment Context",
      note: "Injected by Laravel · read only",
      rows: [
        { label: "Patient", key: "patient_name" },
        { label: "Doctor", key: "doctor_name" },
        { label: "Date", key: "appointment_date" },
        { label: "Time", key: "appointment_time" },
      ],
    },
    fields: [nameField()],
    defaults: createBaseTriggerDefaults({ label: "Appointment Missed" }),
  },

  /* ── 6. Prescription Added (alias: digitalPrescription) ── */
  prescriptionAdded: {
    description:
      "Triggers when a prescription is added (including digital prescription share). Alias: digitalPrescription.",
    laravelContext: [
      "context.patient",
      "context.prescription",
      "context.doctor",
      "context.hospital",
    ],
    contextCard: {
      title: "Prescription Context",
      note: "Injected by Laravel · read only",
      rows: [
        { label: "Patient", key: "patient_name" },
        { label: "Doctor", key: "doctor_name" },
        { label: "Medicine", key: "medicine_name" },
        { label: "Prescription ID", key: "prescription_id" },
        { label: "Pharmacy link", key: "pharmacy_link" },
      ],
    },
    fields: [
      nameField(),
      {
        key: "source",
        type: "multiselect",
        label: "Source",
        options: BOOKING_SOURCE_OPTIONS,
        required: true,
      },
    ],
    defaults: createBaseTriggerDefaults({
      label: "Prescription Added",
      source: ["any"],
    }),
  },

  /* ── 7. Medicine Reminder Due ── */
  medicineReminder: {
    description:
      "Triggers the workflow when a scheduled medicine reminder becomes due.",
    laravelContext: [
      "context.patient",
      "context.prescription",
      "context.medicines",
      "context.doctor",
      "context.hospital",
    ],
    contextCard: {
      title: "Prescription Data",
      note: "Loaded automatically by Laravel at runtime. Do not hardcode clinical values.",
      rows: [
        { label: "Medicine", key: "medicine_name" },
        { label: "Dosage", key: "dosage" },
        { label: "Frequency", key: "frequency" },
        { label: "Doctor", key: "doctor_name" },
        { label: "Patient", key: "patient_name" },
      ],
    },
    fields: [
      nameField(),
      {
        key: "reminderTiming",
        type: "select",
        label: "Reminder Timing",
        options: MEDICINE_REMINDER_TIMING_OPTIONS,
        required: true,
      },
      {
        key: "minutesBefore",
        type: "number",
        label: "Minutes Before",
        min: 1,
        max: 1440,
        required: true,
        hint: "Enter number of minutes before the reminder",
        showWhen: { reminderTiming: "before_due" },
      },
    ],
    defaults: createBaseTriggerDefaults({
      label: "Medicine Reminder Due",
      reminderTiming: "at_due",
      minutesBefore: 30,
    }),
  },

  /* ── 8. Lab Test Ordered ── */
  labTestOrdered: {
    description:
      "Triggers the workflow whenever a new laboratory test is ordered for a patient.",
    laravelContext: ["context.patient", "context.lab", "context.hospital"],
    fields: [
      nameField(),
      {
        key: "source",
        type: "multiselect",
        label: "Source",
        options: BOOKING_SOURCE_OPTIONS,
        required: true,
      },
    ],
    defaults: createBaseTriggerDefaults({
      label: "Lab Test Ordered",
      source: ["any"],
    }),
  },

  /* ── 9. Lab Report Ready ── */
  labReportNotification: {
    description:
      "Triggers the workflow when a patient's laboratory report becomes available.",
    laravelContext: ["context.patient", "context.lab", "context.hospital"],
    contextCard: {
      title: "Lab Report Context",
      note: "Injected by Laravel · read only",
      rows: [
        { label: "Patient", key: "patient_name" },
        { label: "Report", key: "report_name" },
        { label: "Status", key: "report_status" },
      ],
    },
    fields: [nameField()],
    defaults: createBaseTriggerDefaults({ label: "Lab Report Ready" }),
  },

  /* ── 10. Pharmacy Refill Due ── */
  pharmacyRefillDue: {
    description:
      "Triggers the workflow when a patient's medicine refill is due or approaching its due date.",
    laravelContext: ["context.patient", "context.pharmacy", "context.hospital"],
    fields: [
      nameField(),
      {
        key: "daysBeforeRefill",
        type: "number",
        label: "Days Before Refill",
        min: 0,
        max: 365,
        required: true,
        hint: "Enter number of days before refill date",
      },
    ],
    defaults: createBaseTriggerDefaults({
      label: "Pharmacy Refill Due",
      daysBeforeRefill: 3,
    }),
  },

  /* ── 11. Birthday ── */
  birthday: {
    description: "Triggers the workflow based on a patient's birthday.",
    laravelContext: ["context.patient", "context.hospital"],
    fields: [
      nameField(),
      {
        key: "triggerTiming",
        type: "select",
        label: "Trigger Timing",
        options: BIRTHDAY_TIMING_OPTIONS,
        required: true,
      },
      {
        key: "daysBefore",
        type: "number",
        label: "Days Before",
        min: 1,
        max: 365,
        required: true,
        hint: "Enter number of days before birthday",
        showWhen: { triggerTiming: "before_birthday" },
      },
      {
        key: "executionTime",
        type: "time",
        label: "Execution Time",
        required: true,
        hint: "Select execution time",
      },
    ],
    defaults: createBaseTriggerDefaults({
      label: "Birthday",
      triggerTiming: "on_birthday",
      daysBefore: 1,
      executionTime: "09:00",
    }),
  },

  /* ── 12. Anniversary ── */
  anniversary: {
    description:
      "Triggers on an anniversary or calendar occasion (registration, membership, Women's Day, custom).",
    laravelContext: ["context.patient", "context.hospital"],
    fields: [
      nameField(),
      {
        key: "anniversaryType",
        type: "select",
        label: "Anniversary Type",
        options: ANNIVERSARY_TYPE_OPTIONS,
        required: true,
      },
      {
        key: "triggerTiming",
        type: "select",
        label: "Trigger Timing",
        options: DATE_TIMING_OPTIONS,
        required: true,
      },
      {
        key: "daysBefore",
        type: "number",
        label: "Days Before",
        min: 1,
        max: 365,
        required: true,
        hint: "Enter number of days",
        showWhen: { triggerTiming: "before_date" },
      },
      {
        key: "executionTime",
        type: "time",
        label: "Execution Time",
        required: true,
        hint: "Select execution time",
      },
    ],
    defaults: createBaseTriggerDefaults({
      label: "Anniversary",
      anniversaryType: "registration",
      triggerTiming: "on_date",
      daysBefore: 1,
      executionTime: "09:00",
    }),
  },

  /* ── 13. Hospital Membership Expiry ── */
  membershipExpiry: {
    description:
      "Triggers the workflow when a patient's hospital membership is approaching expiry, expires, or has expired.",
    laravelContext: ["context.patient", "context.membership", "context.hospital"],
    fields: [
      nameField(),
      {
        key: "triggerTiming",
        type: "select",
        label: "Trigger Timing",
        options: EXPIRY_TIMING_OPTIONS,
        required: true,
      },
      {
        key: "numberOfDays",
        type: "number",
        label: "Number of Days",
        min: 0,
        max: 365,
        required: true,
        hint: "Enter number of days",
        showWhen: { triggerTiming: ["before_expiry", "after_expiry"] },
      },
      {
        key: "executionTime",
        type: "time",
        label: "Execution Time",
        required: true,
        hint: "Select execution time",
      },
    ],
    defaults: createBaseTriggerDefaults({
      label: "Hospital Membership Expiry",
      triggerTiming: "before_expiry",
      numberOfDays: 7,
      executionTime: "09:00",
    }),
  },

  /* ── 14. User Plan Expiry ── */
  userPlanExpiry: {
    description:
      "Triggers the workflow based on the expiry date of a user's subscription or service plan.",
    laravelContext: ["context.patient", "context.plan", "context.hospital"],
    fields: [
      nameField(),
      {
        key: "triggerTiming",
        type: "select",
        label: "Trigger Timing",
        options: EXPIRY_TIMING_OPTIONS,
        required: true,
      },
      {
        key: "numberOfDays",
        type: "number",
        label: "Number of Days",
        min: 0,
        max: 365,
        required: true,
        hint: "Enter number of days",
        showWhen: { triggerTiming: ["before_expiry", "after_expiry"] },
      },
      {
        key: "executionTime",
        type: "time",
        label: "Execution Time",
        required: true,
        hint: "Select execution time",
      },
    ],
    defaults: createBaseTriggerDefaults({
      label: "User Plan Expiry",
      triggerTiming: "before_expiry",
      numberOfDays: 7,
      executionTime: "09:00",
    }),
  },

  /* ── 15. Reward Points Updated ── */
  rewardUpdated: {
    description:
      "Triggers the workflow whenever a patient's reward points balance is updated.",
    laravelContext: ["context.patient", "context.rewards", "context.hospital"],
    fields: [
      nameField(),
      {
        key: "updateType",
        type: "multiselect",
        label: "Update Type",
        options: REWARD_UPDATE_OPTIONS,
        required: true,
      },
    ],
    defaults: createBaseTriggerDefaults({
      label: "Reward Points Updated",
      updateType: ["any"],
    }),
  },

  /* ── 16. Rewards Tier Upgraded ── */
  rewardsTierUpgraded: {
    description:
      "Triggers the workflow whenever a patient is upgraded to a higher rewards tier.",
    laravelContext: ["context.patient", "context.rewards", "context.hospital"],
    fields: [nameField()],
    defaults: createBaseTriggerDefaults({ label: "Rewards Tier Upgraded" }),
  },

  /* ── 17. Family Package Plan Tier Updated ── */
  familyPackageTierUpdated: {
    description:
      "Triggers the workflow whenever a patient's family package plan tier is changed.",
    laravelContext: ["context.patient", "context.plan", "context.hospital"],
    fields: [
      nameField(),
      {
        key: "updateType",
        type: "select",
        label: "Update Type",
        options: FAMILY_TIER_UPDATE_OPTIONS,
        required: true,
      },
    ],
    defaults: createBaseTriggerDefaults({
      label: "Family Package Plan Tier Updated",
      updateType: "any",
    }),
  },

  /* ── 18. Invoice Generated ── */
  invoiceGenerated: {
    description:
      "Triggers the workflow whenever a new invoice is generated for a patient or user.",
    laravelContext: ["context.patient", "context.invoice", "context.hospital"],
    fields: [
      nameField(),
      {
        key: "source",
        type: "multiselect",
        label: "Source",
        options: INVOICE_SOURCE_OPTIONS,
        required: true,
      },
    ],
    defaults: createBaseTriggerDefaults({
      label: "Invoice Generated",
      source: ["any"],
    }),
  },

  /* ── 19. Payment Received ── */
  paymentReceived: {
    description:
      "Triggers the workflow whenever a payment is successfully received and recorded.",
    laravelContext: ["context.patient", "context.payment", "context.hospital"],
    fields: [
      nameField(),
      {
        key: "paymentMode",
        type: "multiselect",
        label: "Payment Mode",
        options: PAYMENT_MODE_OPTIONS,
        required: true,
      },
      {
        key: "source",
        type: "multiselect",
        label: "Source",
        options: BOOKING_SOURCE_OPTIONS,
        required: true,
      },
    ],
    defaults: createBaseTriggerDefaults({
      label: "Payment Received",
      paymentMode: ["any"],
      source: ["any"],
    }),
  },

  /* ── 20. Webhook Event ── */
  webhookEvent: {
    description:
      "Triggers the workflow when an external system sends data to a configured HIP webhook endpoint.",
    fields: [
      nameField(),
      {
        key: "webhookName",
        type: "text",
        label: "Webhook Name",
        required: true,
        hint: "Enter webhook name",
        placeholder: "Enter webhook name",
      },
      {
        key: "webhookUrl",
        type: "text",
        label: "Webhook URL",
        readOnly: true,
        hint: "Automatically generated by HIP",
      },
      {
        key: "httpMethod",
        type: "select",
        label: "HTTP Method",
        options: WEBHOOK_METHOD_OPTIONS,
        required: true,
      },
      {
        key: "secretKey",
        type: "text",
        label: "Secret Key",
        required: true,
        generate: true,
        hint: "Automatically generate or enter secret key",
        placeholder: "Enter or generate secret key",
      },
      {
        key: "payloadVariables",
        type: "keyValue",
        label: "Payload Variables",
        hint: "Define incoming payload fields and workflow variables",
      },
    ],
    defaults: createBaseTriggerDefaults({
      label: "Webhook Event",
      webhookName: "",
      webhookUrl: "https://api.healthinpocket.in/api/webhooks/{workflow_id}",
      httpMethod: "POST",
      secretKey: "",
      payloadVariables: [{ key: "", variable: "" }],
    }),
  },

  /* ── 21. API Event ── */
  apiEvent: {
    description:
      "Triggers the workflow when an authorized external application sends a configured event through the HIP API.",
    fields: [
      nameField(),
      {
        key: "eventName",
        type: "text",
        label: "Event Name",
        required: true,
        hint: "Enter unique event name",
        placeholder: "Enter unique event name",
      },
      {
        key: "apiKey",
        type: "text",
        label: "API Key",
        required: true,
        generate: true,
        hint: "Generate or select API credential",
        placeholder: "Generate or enter API key",
      },
      {
        key: "payloadVariables",
        type: "keyValue",
        label: "Payload Variables",
        hint: "Define API payload fields and workflow variables",
      },
    ],
    defaults: createBaseTriggerDefaults({
      label: "API Event",
      eventName: "",
      apiKey: "",
      payloadVariables: [{ key: "", variable: "" }],
    }),
  },

  /* ── 22. Scheduled Event ── */
  scheduledEvent: {
    description:
      "Triggers the workflow automatically at a specified date, time, or recurring schedule.",
    fields: [
      nameField(),
      {
        key: "scheduleType",
        type: "select",
        label: "Schedule Type",
        options: SCHEDULE_TYPE_OPTIONS,
        required: true,
      },
      {
        key: "startDate",
        type: "date",
        label: "Start Date",
        required: true,
        hint: "Select start date",
      },
      {
        key: "executionTime",
        type: "time",
        label: "Execution Time",
        required: true,
        hint: "Select execution time",
      },
      {
        key: "repeatFrequency",
        type: "select",
        label: "Repeat Frequency",
        options: REPEAT_FREQUENCY_OPTIONS,
        required: true,
        showWhen: { scheduleType: "recurring" },
      },
      {
        key: "endCondition",
        type: "select",
        label: "End Condition",
        options: END_CONDITION_OPTIONS,
        required: true,
        showWhen: { scheduleType: "recurring" },
      },
    ],
    defaults: createBaseTriggerDefaults({
      label: "Scheduled Event",
      scheduleType: "once",
      startDate: "",
      executionTime: "09:00",
      repeatFrequency: "daily",
      endCondition: "never",
    }),
  },

  /* ── Appointment Reminder (kept alongside Medicine Reminder Due) ── */
  appointmentReminder: {
    description:
      "Triggers the workflow relative to a scheduled appointment time.",
    laravelContext: [
      "context.patient",
      "context.appointment",
      "context.doctor",
      "context.hospital",
    ],
    contextCard: {
      title: "Appointment Context",
      note: "Injected by Laravel · read only",
      rows: [
        { label: "Patient", key: "patient_name" },
        { label: "Doctor", key: "doctor_name" },
        { label: "Date", key: "appointment_date" },
        { label: "Time", key: "appointment_time" },
      ],
    },
    fields: [
      nameField(),
      {
        key: "triggerTiming",
        type: "select",
        label: "Trigger Timing",
        options: APPOINTMENT_REMINDER_TIMING_OPTIONS,
        required: true,
        hint: "When relative to the appointment this workflow should start.",
      },
    ],
    defaults: createBaseTriggerDefaults({
      label: "Appointment Reminder",
      triggerTiming: "before_24h",
    }),
  },
};

/** Resolve camelCase / snake_case / alias trigger keys to a schema. */
const TRIGGER_TYPE_ALIASES = {
  appointment_rescheduled: "appointmentRescheduled",
  appointment_completed: "appointmentCompleted",
  appointment_booked: "appointmentBooked",
  appointment_cancelled: "appointmentCancelled",
  appointment_missed: "appointmentMissed",
  appointment_reminder: "appointmentReminder",
  // Manager / meeting alias — digital prescription shares prescriptionAdded event.
  digitalPrescription: "prescriptionAdded",
  digital_prescription: "prescriptionAdded",
};

export { TRIGGER_TYPE_ALIASES };

function resolveTriggerType(type) {
  const raw = String(type || "").trim();
  if (!raw) return "";
  if (TRIGGER_SCHEMAS[raw]) return raw;
  if (TRIGGER_TYPE_ALIASES[raw]) return TRIGGER_TYPE_ALIASES[raw];
  const camel = raw.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
  if (TRIGGER_SCHEMAS[camel]) return camel;
  return raw;
}

export function getTriggerSchema(type) {
  const key = resolveTriggerType(type);
  return TRIGGER_SCHEMAS[key] ?? null;
}

export function buildTriggerDefaults(type) {
  const schema = getTriggerSchema(type);
  if (!schema) return null;
  return structuredClone(schema.defaults);
}
