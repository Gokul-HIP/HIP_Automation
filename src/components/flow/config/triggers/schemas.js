import {
  EXECUTION_STATUS_OPTIONS,
  AI_PROVIDER_OPTIONS,
  createBaseTriggerDefaults,
  RECIPIENT_OPTIONS,
  EXECUTION_DELAY_OPTIONS,
  TRIGGER_CHANNEL_OPTIONS,
} from "./shared";

export const MEDICINE_TIMING_OPTIONS = [
  { value: "immediate", label: "Immediately" },
  { value: "before_30", label: "30 Minutes Before" },
  { value: "before_60", label: "1 Hour Before" },
  { value: "at_time", label: "At Scheduled Time" },
  { value: "after_missed_30", label: "30 Minutes After Missed" },
];

/** @deprecated Prefer MEDICINE_TIMING_OPTIONS — kept for older saved values. */
export const LEGACY_MEDICINE_TIMING_MAP = {
  at_due: "at_time",
  before_due: "before_30",
  exact: "at_time",
  before_15: "before_30",
  before_30: "before_30",
  before_60: "before_60",
};

export const APPOINTMENT_TIMING_OPTIONS = [
  { value: "on_booked", label: "When Booked" },
  { value: "before_24h", label: "24 Hours Before" },
  { value: "before_12h", label: "12 Hours Before" },
  { value: "before_6h", label: "6 Hours Before" },
  { value: "before_1h", label: "1 Hour Before" },
  { value: "at_time", label: "At Appointment Time" },
];

export const FOLLOWUP_TIMING_OPTIONS = [
  { value: "1d", label: "1 Day After Visit" },
  { value: "3d", label: "3 Days After Visit" },
  { value: "7d", label: "7 Days After Visit" },
  { value: "14d", label: "14 Days After Visit" },
  { value: "30d", label: "30 Days After Visit" },
];

export const PACKAGE_EXPIRY_TIMING_OPTIONS = [
  { value: "1d", label: "1 Day Before Expiry" },
  { value: "3d", label: "3 Days Before Expiry" },
  { value: "7d", label: "7 Days Before Expiry" },
  { value: "14d", label: "14 Days Before Expiry" },
];

export const EMERGENCY_THRESHOLD_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "moderate", label: "Moderate" },
  { value: "high", label: "High" },
  { value: "emergency", label: "Emergency" },
];

export const FEEDBACK_FORM_OPTIONS = [
  { value: "post_visit", label: "Post-Visit Feedback" },
  { value: "nps", label: "NPS Survey" },
  { value: "opd_experience", label: "OPD Experience" },
  { value: "discharge", label: "Discharge Feedback" },
];

const COMMON_PATIENT_VARS = [
  {
    label: "Patient",
    variables: [
      { key: "patient_name", label: "Patient", token: "{{patient_name}}" },
      { key: "patient_mobile", label: "Patient Mobile", token: "{{patient_mobile}}" },
    ],
  },
  {
    label: "Hospital",
    variables: [
      { key: "hospital_name", label: "Hospital", token: "{{hospital_name}}" },
    ],
  },
];

/** Event-only trigger fields — no channels, templates, or retry. */
function eventFields({ timingKey, timingLabel, timingOptions, extras = [] }) {
  return [
    { key: "label", type: "text", label: "Trigger Name", required: true },
    {
      key: timingKey,
      type: "select",
      label: timingLabel,
      options: timingOptions,
      required: true,
    },
    ...extras,
  ];
}

export const TRIGGER_SCHEMAS = {
  medicineReminder: {
    description:
      "Starts when a medicine reminder is due. Prescription details (medicine, dosage, frequency) come from Laravel — never enter them here.",
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
    sampleContext: {
      patient_name: "John Doe",
      medicine_name: "Paracetamol",
      dosage: "500 mg",
      frequency: "Morning • Afternoon • Night",
      time: "08:00 AM",
      date: "Today",
      doctor_name: "Dr. Rajesh",
      hospital_name: "HIP Hospital",
    },
    variableGroups: [
      {
        label: "Patient",
        variables: [
          { key: "patient_name", label: "Patient", token: "{{patient_name}}" },
        ],
      },
      {
        label: "Hospital",
        variables: [
          { key: "hospital_name", label: "Hospital", token: "{{hospital_name}}" },
        ],
      },
      {
        label: "Medicine",
        variables: [
          { key: "medicine_name", label: "Medicine", token: "{{medicine_name}}" },
          { key: "dosage", label: "Dosage", token: "{{dosage}}" },
          { key: "frequency", label: "Frequency", token: "{{frequency}}" },
          { key: "time", label: "Time", token: "{{time}}" },
          { key: "date", label: "Date", token: "{{date}}" },
        ],
      },
    ],
    fields: [
      {
        key: "label",
        type: "text",
        label: "Display Name",
        required: true,
        hint: "Shown on the canvas node card.",
      },
      {
        key: "triggerName",
        type: "text",
        label: "Trigger Name",
        required: true,
        hint: "Internal name used in logs and execution history.",
      },
      {
        key: "triggerTiming",
        type: "select",
        label: "Trigger Timing",
        options: MEDICINE_TIMING_OPTIONS,
        required: true,
        hint: "When relative to the prescription schedule this workflow should start.",
      },
      {
        key: "channels",
        type: "channels",
        label: "Delivery Channels",
        options: TRIGGER_CHANNEL_OPTIONS,
        required: true,
        hint: "Select one or more channels for the reminder message.",
      },
      {
        key: "retry",
        type: "retry",
        label: "Repeat Reminder",
      },
      {
        key: "messageTemplate",
        type: "template",
        label: "Message Template",
        required: true,
        hint: "Use {{variables}} — values resolve from Laravel prescription context.",
      },
    ],
    defaults: createBaseTriggerDefaults({
      label: "Medicine Reminder",
      triggerName: "Medicine Reminder",
      triggerTiming: "at_time",
      channels: ["push", "whatsapp"],
      repeatReminder: false,
      retryInterval: 15,
      maxRetryCount: 2,
      messageTemplate:
        "Hi {{patient_name}}, reminder from {{hospital_name}}: take {{medicine_name}} ({{dosage}}) at {{time}}.",
    }),
  },

  appointmentReminder: {
    description: "Starts relative to a scheduled appointment.",
    laravelContext: ["context.patient", "context.appointment", "context.doctor", "context.hospital"],
    contextCard: {
      title: "Appointment Context",
      note: "Appointment details come from Laravel when the workflow runs.",
      rows: [
        { label: "Patient", key: "patient_name" },
        { label: "Doctor", key: "doctor_name" },
        { label: "Date", key: "appointment_date" },
        { label: "Time", key: "appointment_time" },
      ],
    },
    sampleContext: {
      patient_name: "John Doe",
      doctor_name: "Dr Rajesh",
      appointment_date: "Tomorrow",
      appointment_time: "10:30 AM",
    },
    fields: eventFields({
      timingKey: "triggerTiming",
      timingLabel: "Trigger Timing",
      timingOptions: APPOINTMENT_TIMING_OPTIONS,
    }),
    defaults: createBaseTriggerDefaults({
      label: "Appointment Reminder",
      triggerTiming: "before_24h",
    }),
  },

  appointmentBooked: {
    description: "Starts when a patient books an appointment.",
    fields: eventFields({
      timingKey: "triggerTiming",
      timingLabel: "Trigger Timing",
      timingOptions: [{ value: "on_booked", label: "When Booked" }],
    }),
    defaults: createBaseTriggerDefaults({
      label: "Appointment Booked",
      triggerTiming: "on_booked",
    }),
  },

  appointmentCancelled: {
    description: "Starts when an appointment is cancelled.",
    fields: eventFields({
      timingKey: "triggerTiming",
      timingLabel: "Trigger Timing",
      timingOptions: [{ value: "on_cancelled", label: "When Cancelled" }],
    }),
    defaults: createBaseTriggerDefaults({
      label: "Appointment Cancelled",
      triggerTiming: "on_cancelled",
    }),
  },

  appointmentMissed: {
    description: "Starts when a patient misses an appointment.",
    laravelContext: [
      "context.patient",
      "context.appointment",
      "context.doctor",
      "context.hospital",
    ],
    contextCard: {
      title: "Appointment Context",
      note: "Missed appointment details come from Laravel at runtime.",
      rows: [
        { label: "Patient", key: "patient_name" },
        { label: "Doctor", key: "doctor_name" },
        { label: "Date", key: "appointment_date" },
        { label: "Time", key: "appointment_time" },
      ],
    },
    sampleContext: {
      patient_name: "John Doe",
      doctor_name: "Dr Rajesh",
      appointment_date: "Today",
      appointment_time: "10:30 AM",
    },
    fields: [
      {
        key: "label",
        type: "text",
        label: "Display Name",
        required: true,
        hint: "Shown on the canvas node card.",
      },
      {
        key: "triggerName",
        type: "text",
        label: "Trigger Name",
        required: true,
        hint: "Internal name for logs and executions.",
      },
      {
        key: "triggerEvent",
        type: "select",
        label: "Trigger Event",
        options: [{ value: "appointment_missed", label: "Appointment Missed" }],
        required: true,
        hint: "Fixed event type for this trigger.",
      },
      {
        key: "executionDelay",
        type: "select",
        label: "Execution Delay",
        options: EXECUTION_DELAY_OPTIONS,
        required: true,
        hint: "How long to wait after the missed appointment before starting.",
      },
      {
        key: "runOnlyOnce",
        type: "boolean",
        label: "Run Only Once",
        description: "Prevent duplicate runs for the same missed appointment.",
      },
      {
        key: "department",
        type: "text",
        label: "Department",
        hint: "Optional filter — leave blank for all departments.",
        placeholder: "e.g. Cardiology",
      },
      {
        key: "doctor",
        type: "text",
        label: "Doctor",
        hint: "Optional filter — leave blank for all doctors.",
        placeholder: "e.g. Dr. Rajesh",
      },
      {
        key: "hospitalBranch",
        type: "text",
        label: "Hospital Branch",
        hint: "Optional filter — leave blank for all branches.",
        placeholder: "e.g. Main Campus",
      },
      {
        key: "description",
        type: "textarea",
        label: "Description",
        hint: "Optional notes for your team about this trigger.",
        placeholder: "Follow up with no-show patients…",
      },
    ],
    defaults: createBaseTriggerDefaults({
      label: "Appointment Missed",
      triggerName: "Appointment Missed",
      triggerEvent: "appointment_missed",
      triggerTiming: "on_missed",
      executionDelay: "immediate",
      runOnlyOnce: true,
      department: "",
      doctor: "",
      hospitalBranch: "",
      description: "",
    }),
  },

  appointmentRescheduled: {
    description: "Starts when an appointment is rescheduled.",
    laravelContext: [
      "context.patient",
      "context.appointment",
      "context.doctor",
      "context.hospital",
    ],
    contextCard: {
      title: "Reschedule Context",
      note: "Old and new appointment values come from Laravel at runtime.",
      rows: [
        { label: "Old Date", key: "old_date" },
        { label: "New Date", key: "new_date" },
        { label: "Old Time", key: "old_time" },
        { label: "New Time", key: "new_time" },
        { label: "Doctor", key: "doctor_name" },
      ],
    },
    sampleContext: {
      old_date: "12 Mar 2026",
      new_date: "15 Mar 2026",
      old_time: "10:00 AM",
      new_time: "11:30 AM",
      doctor_name: "Dr Rajesh",
      patient_name: "John Doe",
    },
    fields: [
      {
        key: "label",
        type: "text",
        label: "Display Name",
        required: true,
        hint: "Shown on the canvas node card.",
      },
      {
        key: "triggerName",
        type: "text",
        label: "Trigger Name",
        required: true,
        hint: "Internal name for logs and executions.",
      },
      {
        key: "triggerEvent",
        type: "select",
        label: "Trigger Event",
        options: [
          { value: "appointment_rescheduled", label: "Appointment Rescheduled" },
        ],
        required: true,
        hint: "Fixed event type for this trigger.",
      },
      {
        key: "notifyPatient",
        type: "boolean",
        label: "Notify Patient",
        description: "Mark that patient notification is expected downstream.",
      },
      {
        key: "notifyDoctor",
        type: "boolean",
        label: "Notify Doctor",
        description: "Mark that doctor notification is expected downstream.",
      },
      {
        key: "notifyHospital",
        type: "boolean",
        label: "Notify Hospital",
        description: "Mark that hospital/ops notification is expected downstream.",
      },
      {
        key: "variablesPreview",
        type: "variablesPreview",
        label: "Variables Preview",
        tokens: [
          "{{old_date}}",
          "{{new_date}}",
          "{{old_time}}",
          "{{new_time}}",
          "{{doctor_name}}",
        ],
        hint: "Use these placeholders in connected messaging nodes.",
      },
      {
        key: "description",
        type: "textarea",
        label: "Description",
        hint: "Optional notes for your team about this trigger.",
        placeholder: "Notify patient when appointment is moved…",
      },
    ],
    defaults: createBaseTriggerDefaults({
      label: "Appointment Rescheduled",
      triggerName: "Appointment Rescheduled",
      triggerEvent: "appointment_rescheduled",
      triggerTiming: "on_rescheduled",
      notifyPatient: true,
      notifyDoctor: false,
      notifyHospital: false,
      description: "",
    }),
  },

  patientRegistered: {
    description: "Starts when a new patient is registered.",
    fields: eventFields({
      timingKey: "triggerTiming",
      timingLabel: "Trigger Timing",
      timingOptions: [{ value: "on_registered", label: "When Registered" }],
    }),
    defaults: createBaseTriggerDefaults({
      label: "Patient Registered",
      triggerTiming: "on_registered",
    }),
  },

  onChatMessage: {
    description: "Starts when a patient sends a chat message.",
    fields: eventFields({
      timingKey: "triggerTiming",
      timingLabel: "Trigger Timing",
      timingOptions: [{ value: "on_message", label: "When Message Received" }],
    }),
    defaults: createBaseTriggerDefaults({
      label: "On Chat Message",
      triggerTiming: "on_message",
    }),
  },

  prescriptionAdded: {
    description: "Starts when a prescription is added or updated.",
    fields: eventFields({
      timingKey: "triggerTiming",
      timingLabel: "Trigger Timing",
      timingOptions: [
        { value: "on_added", label: "When Prescription Added" },
        { value: "on_updated", label: "When Prescription Updated" },
      ],
      extras: [
        {
          key: "includePharmacyLink",
          type: "boolean",
          label: "Include Pharmacy Link in Context",
          description: "Expose pharmacy link to downstream messaging nodes.",
        },
      ],
    }),
    defaults: createBaseTriggerDefaults({
      label: "Prescription Added",
      triggerTiming: "on_added",
      includePharmacyLink: true,
    }),
  },

  labReportNotification: {
    description: "Starts when a lab report becomes ready.",
    contextCard: {
      title: "Lab Report Context",
      note: "Report details are injected by Laravel.",
      rows: [
        { label: "Patient", key: "patient_name" },
        { label: "Report", key: "report_name" },
        { label: "Status", key: "report_status" },
      ],
    },
    fields: eventFields({
      timingKey: "triggerTiming",
      timingLabel: "Trigger Timing",
      timingOptions: [
        { value: "on_ready", label: "When Report Is Ready" },
        { value: "on_ordered", label: "When Lab Test Ordered" },
      ],
    }),
    defaults: createBaseTriggerDefaults({
      label: "Lab Report Ready",
      triggerTiming: "on_ready",
    }),
  },

  labTestOrdered: {
    description: "Starts when a lab test is ordered.",
    fields: eventFields({
      timingKey: "triggerTiming",
      timingLabel: "Trigger Timing",
      timingOptions: [{ value: "on_ordered", label: "When Ordered" }],
    }),
    defaults: createBaseTriggerDefaults({
      label: "Lab Test Ordered",
      triggerTiming: "on_ordered",
    }),
  },

  scanReportNotification: {
    description: "Starts when a scan / imaging report is published.",
    fields: eventFields({
      timingKey: "triggerTiming",
      timingLabel: "Trigger Timing",
      timingOptions: [{ value: "on_ready", label: "When Scan Report Is Ready" }],
    }),
    defaults: createBaseTriggerDefaults({
      label: "Scan Report Ready",
      triggerTiming: "on_ready",
    }),
  },

  pharmacyRefillDue: {
    description: "Starts when a pharmacy refill is due.",
    fields: eventFields({
      timingKey: "triggerTiming",
      timingLabel: "Trigger Timing",
      timingOptions: [
        { value: "on_due", label: "When Refill Is Due" },
        { value: "before_due", label: "Before Refill Due" },
      ],
    }),
    defaults: createBaseTriggerDefaults({
      label: "Pharmacy Refill Due",
      triggerTiming: "on_due",
    }),
  },

  doctorFollowUp: {
    description: "Starts after a consultation for follow-up workflows.",
    fields: eventFields({
      timingKey: "triggerTiming",
      timingLabel: "Follow-up Timing",
      timingOptions: FOLLOWUP_TIMING_OPTIONS,
    }),
    defaults: createBaseTriggerDefaults({
      label: "Doctor Follow-up",
      triggerTiming: "7d",
    }),
  },

  healthPackageReminder: {
    description: "Starts before a health package expires.",
    fields: eventFields({
      timingKey: "triggerTiming",
      timingLabel: "Expiry Reminder Timing",
      timingOptions: PACKAGE_EXPIRY_TIMING_OPTIONS,
    }),
    defaults: createBaseTriggerDefaults({
      label: "Membership Expiry",
      triggerTiming: "3d",
    }),
  },

  prescriptionNotification: {
    description: "Legacy alias for prescription events.",
    fields: eventFields({
      timingKey: "triggerTiming",
      timingLabel: "Trigger Timing",
      timingOptions: [
        { value: "on_issued", label: "When Prescription Is Issued" },
        { value: "on_updated", label: "When Prescription Is Updated" },
      ],
    }),
    defaults: createBaseTriggerDefaults({
      label: "Prescription Notification",
      triggerTiming: "on_issued",
    }),
  },

  birthday: {
    description: "Starts on a patient's birthday.",
    fields: eventFields({
      timingKey: "triggerTiming",
      timingLabel: "Trigger Timing",
      timingOptions: [
        { value: "on_day", label: "On Birthday" },
        { value: "before_1d", label: "1 Day Before" },
      ],
    }),
    defaults: createBaseTriggerDefaults({ label: "Birthday", triggerTiming: "on_day" }),
  },

  anniversary: {
    description: "Starts on a patient relationship anniversary.",
    fields: eventFields({
      timingKey: "triggerTiming",
      timingLabel: "Trigger Timing",
      timingOptions: [{ value: "on_day", label: "On Anniversary" }],
    }),
    defaults: createBaseTriggerDefaults({ label: "Anniversary", triggerTiming: "on_day" }),
  },

  membershipExpiry: {
    description: "Starts before membership expires.",
    fields: eventFields({
      timingKey: "triggerTiming",
      timingLabel: "Expiry Timing",
      timingOptions: PACKAGE_EXPIRY_TIMING_OPTIONS,
    }),
    defaults: createBaseTriggerDefaults({ label: "Membership Expiry", triggerTiming: "7d" }),
  },

  rewardUpdated: {
    description: "Starts when loyalty rewards are updated.",
    fields: eventFields({
      timingKey: "triggerTiming",
      timingLabel: "Trigger Timing",
      timingOptions: [{ value: "on_updated", label: "When Reward Updated" }],
    }),
    defaults: createBaseTriggerDefaults({ label: "Reward Updated", triggerTiming: "on_updated" }),
  },

  paymentReceived: {
    description: "Starts when a payment is received.",
    fields: eventFields({
      timingKey: "triggerTiming",
      timingLabel: "Trigger Timing",
      timingOptions: [{ value: "on_received", label: "When Payment Received" }],
    }),
    defaults: createBaseTriggerDefaults({ label: "Payment Received", triggerTiming: "on_received" }),
  },

  webhookEvent: {
    description: "Starts when an inbound webhook event is received.",
    fields: [
      { key: "label", type: "text", label: "Trigger Name", required: true },
      { key: "eventName", type: "text", label: "Event Name", required: true, placeholder: "patient.created" },
    ],
    defaults: createBaseTriggerDefaults({ label: "Webhook Event", eventName: "" }),
  },

  apiEvent: {
    description: "Starts when an API event is emitted from the hospital system.",
    fields: [
      { key: "label", type: "text", label: "Trigger Name", required: true },
      { key: "eventName", type: "text", label: "API Event", required: true },
    ],
    defaults: createBaseTriggerDefaults({ label: "API Event", eventName: "" }),
  },

  scheduledEvent: {
    description: "Starts on a cron or scheduled timetable.",
    fields: [
      { key: "label", type: "text", label: "Trigger Name", required: true },
      { key: "cron", type: "text", label: "Cron Schedule", required: true, placeholder: "0 9 * * *" },
    ],
    defaults: createBaseTriggerDefaults({ label: "Scheduled Event", cron: "0 9 * * *" }),
  },

  chatbotTrigger: {
    description: "Starts a conversational patient journey.",
    variableGroups: COMMON_PATIENT_VARS,
    fields: [
      { key: "label", type: "text", label: "Trigger Name", required: true },
      { key: "aiProvider", type: "select", label: "AI Provider", options: AI_PROVIDER_OPTIONS, required: true },
      { key: "sessionTimeoutMins", type: "number", label: "Session Timeout (minutes)", min: 5, max: 240, required: true },
      { key: "humanHandoff", type: "boolean", label: "Human Handoff", description: "Allow escalation to a live agent." },
    ],
    defaults: createBaseTriggerDefaults({
      label: "Chatbot",
      aiProvider: "openai",
      sessionTimeoutMins: 30,
      humanHandoff: true,
    }),
  },

  aiSymptomsChecker: {
    description: "Starts AI-assisted symptom assessment.",
    fields: [
      { key: "label", type: "text", label: "Trigger Name", required: true },
      { key: "aiProvider", type: "select", label: "AI Provider", options: AI_PROVIDER_OPTIONS, required: true },
      { key: "emergencyThreshold", type: "select", label: "Emergency Threshold", options: EMERGENCY_THRESHOLD_OPTIONS, required: true },
      { key: "appointmentEscalation", type: "boolean", label: "Appointment Escalation" },
      { key: "generateSummary", type: "boolean", label: "Summary Generation" },
    ],
    defaults: createBaseTriggerDefaults({
      label: "AI Symptoms Checker",
      aiProvider: "openai",
      emergencyThreshold: "high",
      appointmentEscalation: true,
      generateSummary: true,
    }),
  },

  reviewReminder: {
    description: "Starts after a visit to collect a review.",
    fields: [
      { key: "label", type: "text", label: "Trigger Name", required: true },
      { key: "daysAfterVisit", type: "number", label: "Days After Visit", min: 0, required: true },
      { key: "reviewUrl", type: "text", label: "Review URL", hint: "Can be overridden by Laravel context." },
    ],
    defaults: createBaseTriggerDefaults({ label: "Review Reminder", daysAfterVisit: 2, reviewUrl: "" }),
  },

  patientFeedback: {
    description: "Starts to collect structured patient feedback.",
    fields: [
      { key: "label", type: "text", label: "Trigger Name", required: true },
      { key: "feedbackForm", type: "select", label: "Feedback Form", options: FEEDBACK_FORM_OPTIONS, required: true },
      { key: "daysAfterVisit", type: "number", label: "Days After Visit", min: 0, required: true },
    ],
    defaults: createBaseTriggerDefaults({ label: "Patient Feedback", feedbackForm: "post_visit", daysAfterVisit: 1 }),
  },
};

export function getTriggerSchema(type) {
  return TRIGGER_SCHEMAS[type] ?? null;
}

export function buildTriggerDefaults(type) {
  const schema = getTriggerSchema(type);
  if (!schema) return null;
  return structuredClone(schema.defaults);
}
