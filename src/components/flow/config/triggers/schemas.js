import {
  NOTIFICATION_CHANNEL_OPTIONS,
  EXECUTION_STATUS_OPTIONS,
  RETRY_INTERVAL_OPTIONS,
  AI_PROVIDER_OPTIONS,
  DELAY_OPTIONS,
  createBaseTriggerDefaults,
} from "./shared";

/** Medicine dose window timing */
export const MEDICINE_TIMING_OPTIONS = [
  { value: "exact", label: "At Exact Medicine Time" },
  { value: "before_15", label: "15 Minutes Before" },
  { value: "before_30", label: "30 Minutes Before" },
  { value: "before_60", label: "1 Hour Before" },
];

export const APPOINTMENT_TIMING_OPTIONS = [
  { value: "before_24h", label: "24 Hours Before" },
  { value: "before_12h", label: "12 Hours Before" },
  { value: "before_6h", label: "6 Hours Before" },
  { value: "before_3h", label: "3 Hours Before" },
  { value: "before_2h", label: "2 Hours Before" },
  { value: "before_1h", label: "1 Hour Before" },
  { value: "before_30m", label: "30 Minutes Before" },
  { value: "before_15m", label: "15 Minutes Before" },
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

/** Placeholder lists — replace with Laravel API responses later */
export const FEEDBACK_FORM_OPTIONS = [
  { value: "post_visit", label: "Post-Visit Feedback" },
  { value: "nps", label: "NPS Survey" },
  { value: "opd_experience", label: "OPD Experience" },
  { value: "discharge", label: "Discharge Feedback" },
];

const COMMON_PATIENT_VARS = [
  { label: "Patient", variables: ["{{patient_name}}", "{{patient_mobile}}"] },
  { label: "Hospital", variables: ["{{hospital_name}}"] },
];

function notificationFields({ timingKey, timingLabel, timingOptions, extras = [] }) {
  return [
    {
      key: "label",
      type: "text",
      label: "Display Name",
      required: true,
    },
    {
      key: timingKey,
      type: "select",
      label: timingLabel,
      options: timingOptions,
      required: true,
    },
    {
      key: "delay",
      type: "select",
      label: "Delay",
      options: DELAY_OPTIONS,
      hint: "Optional delay after the trigger condition is met.",
    },
    {
      key: "channels",
      type: "channels",
      label: "Notification Channels",
      options: NOTIFICATION_CHANNEL_OPTIONS,
      required: true,
    },
    { key: "retry", type: "retry" },
    ...extras,
    {
      key: "messageTemplate",
      type: "template",
      label: "Message Template",
      required: true,
    },
    {
      key: "executionStatus",
      type: "select",
      label: "Execution Status",
      options: EXECUTION_STATUS_OPTIONS,
      required: true,
    },
  ];
}

/**
 * Declarative schemas for all Trigger category nodes.
 * Dynamic option lists can be swapped with API data later without UI rewrites.
 */
export const TRIGGER_SCHEMAS = {
  medicineReminder: {
    description:
      "Automatically sends reminders for medicines contained in a patient's prescription.",
    laravelContext: [
      "context.patient",
      "context.prescription",
      "context.medicines",
      "context.doctor",
      "context.hospital",
    ],
    contextCard: {
      title: "Prescription Data",
      note: "Prescription details are loaded automatically by Laravel. Configure reminder behavior only.",
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
      time: "08:00 AM",
      date: "15 Jul 2026",
    },
    variableGroups: [
      ...COMMON_PATIENT_VARS,
      {
        label: "Medicine",
        variables: ["{{medicine_name}}", "{{dosage}}", "{{frequency}}", "{{time}}", "{{date}}"],
      },
      { label: "Doctor", variables: ["{{doctor_name}}"] },
    ],
    fields: notificationFields({
      timingKey: "triggerTiming",
      timingLabel: "Trigger Timing",
      timingOptions: MEDICINE_TIMING_OPTIONS,
    }),
    defaults: createBaseTriggerDefaults({
      label: "Medicine Reminder",
      triggerTiming: "exact",
      channels: ["whatsapp", "push"],
      messageTemplate:
        "Hi {{patient_name}}, reminder from {{hospital_name}} to take {{medicine_name}} ({{dosage}}) — {{frequency}}. Time: {{time}} on {{date}}.",
    }),
  },

  appointmentReminder: {
    description:
      "Automatically sends reminders before scheduled patient appointments.",
    laravelContext: [
      "context.patient",
      "context.appointment",
      "context.doctor",
      "context.department",
      "context.branch",
      "context.hospital",
    ],
    contextCard: {
      title: "Appointment Context",
      note: "Appointment details come from Laravel when the workflow runs.",
      rows: [
        { label: "Patient", key: "patient_name" },
        { label: "Doctor", key: "doctor_name" },
        { label: "Department", key: "department" },
        { label: "Hospital", key: "hospital_name" },
        { label: "Date", key: "appointment_date" },
        { label: "Time", key: "appointment_time" },
      ],
    },
    sampleContext: {
      patient_name: "John Doe",
      doctor_name: "Dr Rajesh",
      department: "Cardiology",
      hospital_name: "HIP Hospital",
      appointment_date: "Tomorrow",
      appointment_time: "10:30 AM",
      branch_name: "Main Campus",
    },
    variableGroups: [
      ...COMMON_PATIENT_VARS,
      { label: "Doctor", variables: ["{{doctor_name}}"] },
      { label: "Department", variables: ["{{department}}"] },
      {
        label: "Appointment",
        variables: ["{{appointment_date}}", "{{appointment_time}}", "{{branch_name}}"],
      },
    ],
    fields: notificationFields({
      timingKey: "triggerTiming",
      timingLabel: "Reminder Timing",
      timingOptions: APPOINTMENT_TIMING_OPTIONS,
    }),
    defaults: createBaseTriggerDefaults({
      label: "Appointment Reminder",
      triggerTiming: "before_24h",
      channels: ["whatsapp", "push", "email"],
      messageTemplate: `Hello {{patient_name}}

This is a reminder that you have an appointment.

Doctor: {{doctor_name}}
Department: {{department}}
Hospital: {{hospital_name}}
Date: {{appointment_date}}
Time: {{appointment_time}}
Location: {{branch_name}}

Please arrive 15 minutes early.`,
    }),
  },

  labReportNotification: {
    description:
      "Notifies patients when lab reports are ready. Report details come from Laravel.",
    laravelContext: [
      "context.patient",
      "context.lab_report",
      "context.doctor",
      "context.hospital",
    ],
    contextCard: {
      title: "Lab Report Context",
      note: "Report details are injected by Laravel — configure notification behavior only.",
      rows: [
        { label: "Patient", key: "patient_name" },
        { label: "Report", key: "report_name" },
        { label: "Status", key: "report_status" },
        { label: "Doctor", key: "doctor_name" },
      ],
    },
    sampleContext: {
      patient_name: "John Doe",
      report_name: "Complete Blood Count",
      report_status: "Ready",
      doctor_name: "Dr Rajesh",
      hospital_name: "HIP Hospital",
      report_date: "15 Jul 2026",
    },
    variableGroups: [
      ...COMMON_PATIENT_VARS,
      {
        label: "Report",
        variables: ["{{report_name}}", "{{report_status}}", "{{report_date}}"],
      },
      { label: "Doctor", variables: ["{{doctor_name}}"] },
    ],
    fields: notificationFields({
      timingKey: "triggerTiming",
      timingLabel: "Trigger Timing",
      timingOptions: [
        { value: "on_ready", label: "When Report Is Ready" },
        { value: "after_ready", label: "After Report Is Ready (use Delay)" },
      ],
    }),
    defaults: createBaseTriggerDefaults({
      label: "Lab Report Notification",
      triggerTiming: "on_ready",
      messageTemplate:
        "Hi {{patient_name}}, your lab report ({{report_name}}) is {{report_status}} at {{hospital_name}}. Date: {{report_date}}.",
    }),
  },

  scanReportNotification: {
    description:
      "Notifies patients when scan / imaging reports are published. Report details come from Laravel.",
    laravelContext: [
      "context.patient",
      "context.scan_report",
      "context.doctor",
      "context.hospital",
    ],
    contextCard: {
      title: "Scan Report Context",
      note: "Scan report details are injected by Laravel — configure notification behavior only.",
      rows: [
        { label: "Patient", key: "patient_name" },
        { label: "Scan", key: "scan_name" },
        { label: "Status", key: "report_status" },
        { label: "Doctor", key: "doctor_name" },
      ],
    },
    sampleContext: {
      patient_name: "John Doe",
      scan_name: "Chest X-Ray",
      report_status: "Ready",
      doctor_name: "Dr Rajesh",
      hospital_name: "HIP Hospital",
      report_date: "15 Jul 2026",
    },
    variableGroups: [
      ...COMMON_PATIENT_VARS,
      {
        label: "Scan",
        variables: ["{{scan_name}}", "{{report_status}}", "{{report_date}}"],
      },
      { label: "Doctor", variables: ["{{doctor_name}}"] },
    ],
    fields: notificationFields({
      timingKey: "triggerTiming",
      timingLabel: "Trigger Timing",
      timingOptions: [
        { value: "on_ready", label: "When Scan Report Is Ready" },
        { value: "after_ready", label: "After Report Is Ready (use Delay)" },
      ],
    }),
    defaults: createBaseTriggerDefaults({
      label: "Scan Report Notification",
      triggerTiming: "on_ready",
      messageTemplate:
        "Hi {{patient_name}}, your scan report ({{scan_name}}) is {{report_status}} at {{hospital_name}}. Date: {{report_date}}.",
    }),
  },

  doctorFollowUp: {
    description:
      "Schedules post-consultation follow-up reminders. Doctor and patient information come from Laravel.",
    laravelContext: [
      "context.patient",
      "context.doctor",
      "context.visit",
      "context.hospital",
    ],
    contextCard: {
      title: "Follow-up Context",
      note: "Visit, doctor, and patient data are provided by Laravel.",
      rows: [
        { label: "Patient", key: "patient_name" },
        { label: "Doctor", key: "doctor_name" },
        { label: "Visit Date", key: "visit_date" },
        { label: "Hospital", key: "hospital_name" },
      ],
    },
    sampleContext: {
      patient_name: "John Doe",
      doctor_name: "Dr Rajesh",
      visit_date: "10 Jul 2026",
      hospital_name: "HIP Hospital",
    },
    variableGroups: [
      ...COMMON_PATIENT_VARS,
      { label: "Doctor", variables: ["{{doctor_name}}"] },
      { label: "Visit", variables: ["{{visit_date}}"] },
    ],
    fields: notificationFields({
      timingKey: "triggerTiming",
      timingLabel: "Follow-up Timing",
      timingOptions: FOLLOWUP_TIMING_OPTIONS,
    }),
    defaults: createBaseTriggerDefaults({
      label: "Doctor Follow-up",
      triggerTiming: "7d",
      messageTemplate:
        "Hi {{patient_name}}, this is a follow-up from {{doctor_name}} at {{hospital_name}} regarding your visit on {{visit_date}}.",
    }),
  },

  healthPackageReminder: {
    description:
      "Sends reminders before health package expiry. Package details come from Laravel.",
    laravelContext: [
      "context.patient",
      "context.health_package",
      "context.hospital",
    ],
    contextCard: {
      title: "Health Package Context",
      note: "Package details are loaded by Laravel — configure expiry reminder timing only.",
      rows: [
        { label: "Patient", key: "patient_name" },
        { label: "Package", key: "package_name" },
        { label: "Expiry", key: "expiry_date" },
        { label: "Hospital", key: "hospital_name" },
      ],
    },
    sampleContext: {
      patient_name: "John Doe",
      package_name: "Executive Health Check",
      expiry_date: "30 Jul 2026",
      hospital_name: "HIP Hospital",
    },
    variableGroups: [
      ...COMMON_PATIENT_VARS,
      {
        label: "Package",
        variables: ["{{package_name}}", "{{expiry_date}}"],
      },
    ],
    fields: notificationFields({
      timingKey: "triggerTiming",
      timingLabel: "Expiry Reminder Timing",
      timingOptions: PACKAGE_EXPIRY_TIMING_OPTIONS,
    }),
    defaults: createBaseTriggerDefaults({
      label: "Health Package Reminder",
      triggerTiming: "3d",
      messageTemplate:
        "Hi {{patient_name}}, your {{package_name}} package expires on {{expiry_date}}. Book at {{hospital_name}}.",
    }),
  },

  prescriptionNotification: {
    description:
      "Notifies patients when a prescription is issued or updated. Prescription data comes from Laravel.",
    laravelContext: [
      "context.patient",
      "context.prescription",
      "context.doctor",
      "context.hospital",
    ],
    contextCard: {
      title: "Prescription Context",
      note: "Prescription contents come from Laravel. Configure send timing and optional pharmacy link.",
      rows: [
        { label: "Patient", key: "patient_name" },
        { label: "Doctor", key: "doctor_name" },
        { label: "Rx ID", key: "prescription_id" },
        { label: "Hospital", key: "hospital_name" },
      ],
    },
    sampleContext: {
      patient_name: "John Doe",
      doctor_name: "Dr Rajesh",
      prescription_id: "RX-8821",
      hospital_name: "HIP Hospital",
      pharmacy_link: "https://pharmacy.example.com/rx/8821",
    },
    variableGroups: [
      ...COMMON_PATIENT_VARS,
      { label: "Doctor", variables: ["{{doctor_name}}"] },
      {
        label: "Prescription",
        variables: ["{{prescription_id}}", "{{pharmacy_link}}"],
      },
    ],
    fields: notificationFields({
      timingKey: "triggerTiming",
      timingLabel: "Notification Timing",
      timingOptions: [
        { value: "on_issued", label: "When Prescription Is Issued" },
        { value: "on_updated", label: "When Prescription Is Updated" },
        { value: "delayed", label: "After Issue (use Delay)" },
      ],
      extras: [
        {
          key: "includePharmacyLink",
          type: "boolean",
          label: "Include Pharmacy Link",
          description: "Append optional pharmacy fulfillment link when available.",
        },
      ],
    }),
    defaults: createBaseTriggerDefaults({
      label: "Prescription Notification",
      triggerTiming: "on_issued",
      includePharmacyLink: true,
      messageTemplate:
        "Hi {{patient_name}}, your prescription {{prescription_id}} from {{doctor_name}} is ready at {{hospital_name}}. Pharmacy: {{pharmacy_link}}",
    }),
  },

  chatbotTrigger: {
    description:
      "Starts a conversational patient journey. Conversation context is managed by the chatbot runtime.",
    laravelContext: ["context.patient", "context.session", "context.hospital"],
    contextCard: {
      title: "Chat Session Context",
      note: "Patient and session data are provided by Laravel / chatbot runtime.",
      rows: [
        { label: "Patient", key: "patient_name" },
        { label: "Hospital", key: "hospital_name" },
        { label: "Channel", key: "channel" },
      ],
    },
    sampleContext: {
      patient_name: "John Doe",
      hospital_name: "HIP Hospital",
      channel: "WhatsApp",
    },
    variableGroups: COMMON_PATIENT_VARS,
    fields: [
      { key: "label", type: "text", label: "Display Name", required: true },
      {
        key: "aiProvider",
        type: "select",
        label: "AI Provider",
        options: AI_PROVIDER_OPTIONS,
        required: true,
        dynamic: true,
      },
      {
        key: "sessionTimeoutMins",
        type: "number",
        label: "Session Timeout (minutes)",
        min: 5,
        max: 240,
        required: true,
      },
      {
        key: "welcomeMessage",
        type: "textarea",
        label: "Welcome Message",
        required: true,
        placeholder: "Hi {{patient_name}}, how can we help you today?",
      },
      {
        key: "humanHandoff",
        type: "boolean",
        label: "Human Handoff",
        description: "Allow escalation to a live hospital agent.",
      },
      {
        key: "executionStatus",
        type: "select",
        label: "Execution Status",
        options: EXECUTION_STATUS_OPTIONS,
        required: true,
      },
    ],
    defaults: createBaseTriggerDefaults({
      label: "Chatbot",
      aiProvider: "openai",
      sessionTimeoutMins: 30,
      welcomeMessage:
        "Hi {{patient_name}}, welcome to {{hospital_name}}. How can we help you today?",
      humanHandoff: true,
      channels: null,
      messageTemplate: null,
      retryInterval: null,
      maxRetryCount: null,
      repeatReminder: null,
      delay: null,
    }),
  },

  aiSymptomsChecker: {
    description:
      "Runs AI-assisted symptom assessment. Triage thresholds and escalation are configured here; clinical context comes from Laravel.",
    laravelContext: [
      "context.patient",
      "context.symptoms",
      "context.hospital",
    ],
    contextCard: {
      title: "Symptoms Session Context",
      note: "Symptom payload and patient data are injected by Laravel at runtime.",
      rows: [
        { label: "Patient", key: "patient_name" },
        { label: "Chief Complaint", key: "chief_complaint" },
        { label: "Hospital", key: "hospital_name" },
      ],
    },
    sampleContext: {
      patient_name: "John Doe",
      chief_complaint: "Chest discomfort",
      hospital_name: "HIP Hospital",
    },
    variableGroups: [
      ...COMMON_PATIENT_VARS,
      { label: "Symptoms", variables: ["{{chief_complaint}}"] },
    ],
    fields: [
      { key: "label", type: "text", label: "Display Name", required: true },
      {
        key: "aiProvider",
        type: "select",
        label: "AI Provider",
        options: AI_PROVIDER_OPTIONS,
        required: true,
        dynamic: true,
      },
      {
        key: "emergencyThreshold",
        type: "select",
        label: "Emergency Threshold",
        options: EMERGENCY_THRESHOLD_OPTIONS,
        required: true,
      },
      {
        key: "appointmentEscalation",
        type: "boolean",
        label: "Appointment Escalation",
        description: "Offer appointment booking when acuity is above threshold.",
      },
      {
        key: "generateSummary",
        type: "boolean",
        label: "Summary Generation",
        description: "Generate a clinician-ready summary for the care team.",
      },
      {
        key: "executionStatus",
        type: "select",
        label: "Execution Status",
        options: EXECUTION_STATUS_OPTIONS,
        required: true,
      },
    ],
    defaults: createBaseTriggerDefaults({
      label: "AI Symptoms Checker",
      aiProvider: "openai",
      emergencyThreshold: "high",
      appointmentEscalation: true,
      generateSummary: true,
      channels: null,
      messageTemplate: null,
      retryInterval: null,
      maxRetryCount: null,
      repeatReminder: null,
      delay: null,
    }),
  },

  reviewReminder: {
    description:
      "Asks patients to leave a review after care. Delay, URL, channels, and template are configured here.",
    laravelContext: ["context.patient", "context.visit", "context.hospital"],
    contextCard: {
      title: "Review Context",
      note: "Visit and patient details come from Laravel.",
      rows: [
        { label: "Patient", key: "patient_name" },
        { label: "Visit", key: "visit_date" },
        { label: "Hospital", key: "hospital_name" },
      ],
    },
    sampleContext: {
      patient_name: "John Doe",
      visit_date: "10 Jul 2026",
      hospital_name: "HIP Hospital",
      review_url: "https://g.page/r/example",
    },
    variableGroups: [
      ...COMMON_PATIENT_VARS,
      { label: "Review", variables: ["{{review_url}}", "{{visit_date}}"] },
    ],
    fields: [
      { key: "label", type: "text", label: "Display Name", required: true },
      {
        key: "delay",
        type: "select",
        label: "Reminder Delay",
        options: DELAY_OPTIONS,
        required: true,
      },
      {
        key: "reviewUrl",
        type: "text",
        label: "Review URL",
        required: true,
        placeholder: "https://…",
        dynamic: true,
        hint: "Can be overridden by Laravel context.review_url when available.",
      },
      {
        key: "channels",
        type: "channels",
        label: "Notification Channels",
        options: NOTIFICATION_CHANNEL_OPTIONS,
        required: true,
      },
      { key: "retry", type: "retry" },
      {
        key: "messageTemplate",
        type: "template",
        label: "Message Template",
        required: true,
      },
      {
        key: "executionStatus",
        type: "select",
        label: "Execution Status",
        options: EXECUTION_STATUS_OPTIONS,
        required: true,
      },
    ],
    defaults: createBaseTriggerDefaults({
      label: "Review Reminder",
      delay: "2d",
      reviewUrl: "",
      channels: ["whatsapp", "sms"],
      messageTemplate:
        "Hi {{patient_name}}, thanks for visiting {{hospital_name}} on {{visit_date}}. Please leave a review: {{review_url}}",
    }),
  },

  patientFeedback: {
    description:
      "Collects structured patient feedback after a visit. Form catalog can be loaded from Laravel later.",
    laravelContext: [
      "context.patient",
      "context.visit",
      "context.feedback_form",
      "context.hospital",
    ],
    contextCard: {
      title: "Feedback Context",
      note: "Patient and visit data come from Laravel. Form list can be populated via API.",
      rows: [
        { label: "Patient", key: "patient_name" },
        { label: "Visit", key: "visit_date" },
        { label: "Form", key: "form_name" },
      ],
    },
    sampleContext: {
      patient_name: "John Doe",
      visit_date: "10 Jul 2026",
      form_name: "Post-Visit Feedback",
      hospital_name: "HIP Hospital",
      feedback_link: "https://forms.example.com/feedback/1",
    },
    variableGroups: [
      ...COMMON_PATIENT_VARS,
      {
        label: "Feedback",
        variables: ["{{form_name}}", "{{feedback_link}}", "{{visit_date}}"],
      },
    ],
    fields: [
      { key: "label", type: "text", label: "Display Name", required: true },
      {
        key: "feedbackForm",
        type: "select",
        label: "Feedback Form",
        options: FEEDBACK_FORM_OPTIONS,
        required: true,
        dynamic: true,
        hint: "Options can be loaded from Laravel later.",
      },
      {
        key: "delay",
        type: "select",
        label: "Delay",
        options: DELAY_OPTIONS,
        required: true,
      },
      {
        key: "channels",
        type: "channels",
        label: "Delivery Channels",
        options: NOTIFICATION_CHANNEL_OPTIONS,
        required: true,
      },
      { key: "retry", type: "retry" },
      {
        key: "messageTemplate",
        type: "template",
        label: "Message Template",
        required: true,
      },
      {
        key: "executionStatus",
        type: "select",
        label: "Execution Status",
        options: EXECUTION_STATUS_OPTIONS,
        required: true,
      },
    ],
    defaults: createBaseTriggerDefaults({
      label: "Patient Feedback",
      feedbackForm: "post_visit",
      delay: "1d",
      channels: ["whatsapp", "email", "in_app"],
      messageTemplate:
        "Hi {{patient_name}}, please share feedback about your visit on {{visit_date}}: {{feedback_link}}",
    }),
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

export { RETRY_INTERVAL_OPTIONS };
