import {
  EXECUTION_STATUS_OPTIONS,
  AI_PROVIDER_OPTIONS,
  createBaseTriggerDefaults,
} from "./shared";

export const MEDICINE_TIMING_OPTIONS = [
  { value: "at_due", label: "At Due Time" },
  { value: "before_due", label: "Before Due Time" },
];

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
  { label: "Patient", variables: ["{{PatientName}}", "{{patient_mobile}}"] },
  { label: "Hospital", variables: ["{{hospital_name}}"] },
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
      "Starts when a medicine reminder is due. Connect messaging nodes to notify the patient.",
    laravelContext: [
      "context.patient",
      "context.prescription",
      "context.medicines",
      "context.doctor",
      "context.hospital",
    ],
    contextCard: {
      title: "Prescription Data",
      note: "Prescription details are loaded automatically by Laravel.",
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
      doctor_name: "Dr. Rajesh",
      hospital_name: "HIP Hospital",
    },
    fields: eventFields({
      timingKey: "triggerTiming",
      timingLabel: "Reminder Timing",
      timingOptions: MEDICINE_TIMING_OPTIONS,
      extras: [
        {
          key: "minutesBefore",
          type: "number",
          label: "Minutes Before",
          min: 5,
          max: 120,
          hint: "Used when Reminder Timing is Before Due Time.",
        },
      ],
    }),
    defaults: createBaseTriggerDefaults({
      label: "Medicine Reminder Due",
      triggerTiming: "at_due",
      minutesBefore: 15,
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
    fields: eventFields({
      timingKey: "triggerTiming",
      timingLabel: "Trigger Timing",
      timingOptions: [{ value: "on_missed", label: "When Missed" }],
    }),
    defaults: createBaseTriggerDefaults({
      label: "Appointment Missed",
      triggerTiming: "on_missed",
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
