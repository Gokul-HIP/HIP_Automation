import {
  HiOutlineBell,
  HiOutlineCalendar,
  HiOutlineDocumentReport,
  HiOutlinePhotograph,
  HiOutlineUserGroup,
  HiOutlineGift,
  HiOutlineClipboardList,
  HiOutlineChatAlt2,
  HiOutlineSparkles,
  HiOutlineStar,
  HiOutlineAnnotation,
  HiOutlineSwitchHorizontal,
  HiOutlineClock,
  HiOutlineCollection,
  HiOutlineMail,
  HiOutlineDeviceMobile,
  HiOutlineTemplate,
  HiOutlineChip,
  HiOutlineVariable,
  HiOutlineDatabase,
  HiOutlineGlobeAlt,
  HiOutlineCode,
  HiOutlineCog,
  HiOutlinePlay,
  HiOutlineFilter,
} from "react-icons/hi";
import { getTriggerSchema, buildTriggerDefaults } from "./triggers";

/**
 * Build a Trigger catalog entry from the shared schema registry.
 * Triggers never store backend business entities — only workflow behavior.
 */
function triggerNode({ type, title, icon, tone }) {
  const schema = getTriggerSchema(type);
  return {
    type,
    category: "triggers",
    title,
    description: schema?.description || title,
    icon,
    tone,
    isTrigger: true,
    customPanel: "trigger",
    defaultData: buildTriggerDefaults(type) || { label: title },
    // Validation keys for required behavior fields (schema-driven UI)
    fields: (schema?.fields || [])
      .filter((f) => f.required && f.key && f.type !== "retry")
      .map((f) => ({
        key: f.key,
        label: f.label,
        type: f.type,
        required: true,
      })),
  };
}

/**
 * Node definitions for the Hospital Workflow Automation Builder.
 */
export const WORKFLOW_NODES = [
  /* ── Triggers ────────────────────────────────────────── */
  {
    type: "start",
    category: "triggers",
    title: "Workflow Start",
    description: "Entry point for every hospital automation workflow.",
    icon: HiOutlinePlay,
    tone: "success",
    isStart: true,
    defaultData: {
      label: "Workflow Start",
      status: "ready",
      triggerSource: "manual",
    },
    fields: [
      { key: "label", label: "Display name", type: "text", required: true },
      {
        key: "triggerSource",
        label: "Trigger source",
        type: "select",
        options: [
          { value: "manual", label: "Manual / test" },
          { value: "system", label: "System event" },
          { value: "schedule", label: "Schedule" },
        ],
      },
    ],
  },
  triggerNode({
    type: "medicineReminder",
    title: "Medicine Reminder",
    icon: HiOutlineBell,
    tone: "primary",
  }),
  triggerNode({
    type: "appointmentReminder",
    title: "Appointment Reminder",
    icon: HiOutlineCalendar,
    tone: "primary",
  }),
  triggerNode({
    type: "labReportNotification",
    title: "Lab Report Notification",
    icon: HiOutlineDocumentReport,
    tone: "info",
  }),
  triggerNode({
    type: "scanReportNotification",
    title: "Scan Report Notification",
    icon: HiOutlinePhotograph,
    tone: "info",
  }),
  triggerNode({
    type: "doctorFollowUp",
    title: "Doctor Follow-up",
    icon: HiOutlineUserGroup,
    tone: "success",
  }),
  triggerNode({
    type: "healthPackageReminder",
    title: "Health Package Reminder",
    icon: HiOutlineGift,
    tone: "warning",
  }),
  triggerNode({
    type: "prescriptionNotification",
    title: "Prescription Notification",
    icon: HiOutlineClipboardList,
    tone: "primary",
  }),
  triggerNode({
    type: "chatbotTrigger",
    title: "Chatbot",
    icon: HiOutlineChatAlt2,
    tone: "primary",
  }),
  triggerNode({
    type: "aiSymptomsChecker",
    title: "AI Symptoms Checker",
    icon: HiOutlineSparkles,
    tone: "info",
  }),
  triggerNode({
    type: "reviewReminder",
    title: "Review Reminder",
    icon: HiOutlineStar,
    tone: "warning",
  }),
  triggerNode({
    type: "patientFeedback",
    title: "Patient Feedback",
    icon: HiOutlineAnnotation,
    tone: "success",
  }),

  /* ── Logic ───────────────────────────────────────────── */
  {
    type: "condition",
    category: "logic",
    title: "Condition",
    description: "Branch the workflow based on rules.",
    icon: HiOutlineSwitchHorizontal,
    tone: "info",
    defaultData: {
      label: "Condition",
      status: "draft",
      expression: "",
    },
    fields: [
      { key: "label", label: "Display name", type: "text", required: true },
      {
        key: "expression",
        label: "Condition expression",
        type: "textarea",
        required: true,
        placeholder: "patient.age >= 18 && report.status == 'ready'",
      },
    ],
  },
  {
    type: "delay",
    category: "logic",
    title: "Delay",
    description: "Wait for a duration before continuing.",
    icon: HiOutlineClock,
    tone: "warning",
    defaultData: {
      label: "Delay",
      status: "draft",
      amount: 1,
      unit: "hours",
    },
    fields: [
      { key: "label", label: "Display name", type: "text", required: true },
      { key: "amount", label: "Amount", type: "number", required: true },
      {
        key: "unit",
        label: "Unit",
        type: "select",
        options: [
          { value: "minutes", label: "Minutes" },
          { value: "hours", label: "Hours" },
          { value: "days", label: "Days" },
        ],
      },
    ],
  },
  {
    type: "switch",
    category: "logic",
    title: "Switch",
    description: "Route to multiple paths by matching cases.",
    icon: HiOutlineCollection,
    tone: "info",
    defaultData: {
      label: "Switch",
      status: "draft",
      switchField: "",
      cases: "",
    },
    fields: [
      { key: "label", label: "Display name", type: "text", required: true },
      {
        key: "switchField",
        label: "Field to evaluate",
        type: "text",
        required: true,
      },
      {
        key: "cases",
        label: "Cases (comma separated)",
        type: "textarea",
        placeholder: "urgent, routine, follow_up",
      },
    ],
  },
  {
    type: "filter",
    category: "logic",
    title: "Filter",
    description: "Continue only when filter criteria match.",
    icon: HiOutlineFilter,
    tone: "info",
    defaultData: {
      label: "Filter",
      status: "draft",
      criteria: "",
    },
    fields: [
      { key: "label", label: "Display name", type: "text", required: true },
      {
        key: "criteria",
        label: "Filter criteria",
        type: "textarea",
        required: true,
      },
    ],
  },

  /* ── Messaging ───────────────────────────────────────── */
  {
    type: "sendWhatsApp",
    category: "messaging",
    title: "Send WhatsApp",
    description: "Deliver a WhatsApp message to the patient.",
    icon: HiOutlineDeviceMobile,
    tone: "primary",
    defaultData: {
      label: "Send WhatsApp",
      status: "draft",
      templateId: "",
      messageBody: "",
    },
    fields: [
      { key: "label", label: "Display name", type: "text", required: true },
      { key: "templateId", label: "Template ID", type: "text" },
      {
        key: "messageBody",
        label: "Message body",
        type: "textarea",
        required: true,
      },
    ],
  },
  {
    type: "sendSms",
    category: "messaging",
    title: "Send SMS",
    description: "Send an SMS notification.",
    icon: HiOutlineDeviceMobile,
    tone: "primary",
    defaultData: {
      label: "Send SMS",
      status: "draft",
      messageBody: "",
    },
    fields: [
      { key: "label", label: "Display name", type: "text", required: true },
      {
        key: "messageBody",
        label: "Message body",
        type: "textarea",
        required: true,
      },
    ],
  },
  {
    type: "sendEmail",
    category: "messaging",
    title: "Send Email",
    description: "Send a transactional email.",
    icon: HiOutlineMail,
    tone: "primary",
    defaultData: {
      label: "Send Email",
      status: "draft",
      subject: "",
      messageBody: "",
    },
    fields: [
      { key: "label", label: "Display name", type: "text", required: true },
      { key: "subject", label: "Subject", type: "text", required: true },
      {
        key: "messageBody",
        label: "Body",
        type: "textarea",
        required: true,
      },
    ],
  },
  {
    type: "sendTemplate",
    category: "messaging",
    title: "Send Template",
    description: "Send an approved multi-channel template.",
    icon: HiOutlineTemplate,
    tone: "primary",
    defaultData: {
      label: "Send Template",
      status: "draft",
      templateId: "",
      channel: "whatsapp",
    },
    fields: [
      { key: "label", label: "Display name", type: "text", required: true },
      {
        key: "templateId",
        label: "Template ID",
        type: "text",
        required: true,
      },
      {
        key: "channel",
        label: "Channel",
        type: "select",
        options: [
          { value: "whatsapp", label: "WhatsApp" },
          { value: "sms", label: "SMS" },
          { value: "email", label: "Email" },
        ],
      },
    ],
  },

  /* ── AI ──────────────────────────────────────────────── */
  {
    type: "aiMessage",
    category: "ai",
    title: "AI Message",
    description: "Generate a contextual patient-facing message.",
    icon: HiOutlineSparkles,
    tone: "info",
    defaultData: {
      label: "AI Message",
      status: "draft",
      prompt: "",
      toneOfVoice: "empathetic",
    },
    fields: [
      { key: "label", label: "Display name", type: "text", required: true },
      { key: "prompt", label: "Prompt", type: "textarea", required: true },
      {
        key: "toneOfVoice",
        label: "Tone",
        type: "select",
        options: [
          { value: "empathetic", label: "Empathetic" },
          { value: "clinical", label: "Clinical" },
          { value: "concise", label: "Concise" },
        ],
      },
    ],
  },
  {
    type: "aiClassify",
    category: "ai",
    title: "AI Classification",
    description: "Classify intent, urgency, or feedback sentiment.",
    icon: HiOutlineChip,
    tone: "info",
    defaultData: {
      label: "AI Classification",
      status: "draft",
      inputField: "",
      taxonomy: "urgency",
    },
    fields: [
      { key: "label", label: "Display name", type: "text", required: true },
      {
        key: "inputField",
        label: "Input field",
        type: "text",
        required: true,
      },
      {
        key: "taxonomy",
        label: "Taxonomy",
        type: "select",
        options: [
          { value: "urgency", label: "Urgency" },
          { value: "intent", label: "Intent" },
          { value: "sentiment", label: "Sentiment" },
          { value: "department", label: "Department" },
        ],
      },
    ],
  },

  /* ── Variables ───────────────────────────────────────── */
  {
    type: "setVariable",
    category: "variables",
    title: "Set Variable",
    description: "Write a value into the workflow context.",
    icon: HiOutlineVariable,
    tone: "warning",
    defaultData: {
      label: "Set Variable",
      status: "draft",
      variableName: "",
      variableValue: "",
    },
    fields: [
      { key: "label", label: "Display name", type: "text", required: true },
      {
        key: "variableName",
        label: "Variable name",
        type: "text",
        required: true,
      },
      {
        key: "variableValue",
        label: "Value / expression",
        type: "textarea",
        required: true,
      },
    ],
  },
  {
    type: "getVariable",
    category: "variables",
    title: "Get Variable",
    description: "Read a variable into the current step.",
    icon: HiOutlineVariable,
    tone: "warning",
    defaultData: {
      label: "Get Variable",
      status: "draft",
      variableName: "",
    },
    fields: [
      { key: "label", label: "Display name", type: "text", required: true },
      {
        key: "variableName",
        label: "Variable name",
        type: "text",
        required: true,
      },
    ],
  },

  /* ── Database ────────────────────────────────────────── */
  {
    type: "dbQuery",
    category: "database",
    title: "Database Query",
    description: "Read patient or encounter records.",
    icon: HiOutlineDatabase,
    tone: "info",
    defaultData: {
      label: "Database Query",
      status: "draft",
      entity: "patient",
      query: "",
    },
    fields: [
      { key: "label", label: "Display name", type: "text", required: true },
      {
        key: "entity",
        label: "Entity",
        type: "select",
        options: [
          { value: "patient", label: "Patient" },
          { value: "appointment", label: "Appointment" },
          { value: "lab", label: "Lab order" },
          { value: "prescription", label: "Prescription" },
        ],
      },
      {
        key: "query",
        label: "Query / filter",
        type: "textarea",
        required: true,
      },
    ],
  },
  {
    type: "dbUpdate",
    category: "database",
    title: "Database Update",
    description: "Update a hospital record safely.",
    icon: HiOutlineDatabase,
    tone: "info",
    defaultData: {
      label: "Database Update",
      status: "draft",
      entity: "patient",
      payload: "",
    },
    fields: [
      { key: "label", label: "Display name", type: "text", required: true },
      {
        key: "entity",
        label: "Entity",
        type: "select",
        options: [
          { value: "patient", label: "Patient" },
          { value: "appointment", label: "Appointment" },
          { value: "lab", label: "Lab order" },
          { value: "prescription", label: "Prescription" },
        ],
      },
      {
        key: "payload",
        label: "Update payload (JSON)",
        type: "textarea",
        required: true,
      },
    ],
  },

  /* ── HTTP ────────────────────────────────────────────── */
  {
    type: "httpRequest",
    category: "http",
    title: "HTTP Request",
    description: "Call an external hospital or partner API.",
    icon: HiOutlineCode,
    tone: "success",
    defaultData: {
      label: "HTTP Request",
      status: "draft",
      method: "GET",
      url: "",
      body: "",
    },
    fields: [
      { key: "label", label: "Display name", type: "text", required: true },
      {
        key: "method",
        label: "Method",
        type: "select",
        options: [
          { value: "GET", label: "GET" },
          { value: "POST", label: "POST" },
          { value: "PUT", label: "PUT" },
          { value: "PATCH", label: "PATCH" },
          { value: "DELETE", label: "DELETE" },
        ],
      },
      { key: "url", label: "URL", type: "text", required: true },
      { key: "body", label: "Body (optional)", type: "textarea" },
    ],
  },
  {
    type: "webhook",
    category: "http",
    title: "Webhook",
    description: "Emit or listen for an outbound webhook.",
    icon: HiOutlineGlobeAlt,
    tone: "success",
    defaultData: {
      label: "Webhook",
      status: "draft",
      endpoint: "",
      eventName: "",
    },
    fields: [
      { key: "label", label: "Display name", type: "text", required: true },
      { key: "endpoint", label: "Endpoint", type: "text", required: true },
      { key: "eventName", label: "Event name", type: "text" },
    ],
  },

  /* ── Utilities ───────────────────────────────────────── */
  {
    type: "note",
    category: "utilities",
    title: "Note",
    description: "Document intent for care-ops collaborators.",
    icon: HiOutlineCog,
    tone: "warning",
    defaultData: {
      label: "Note",
      status: "ready",
      notes: "",
    },
    fields: [
      { key: "label", label: "Display name", type: "text", required: true },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
];

const byType = Object.fromEntries(WORKFLOW_NODES.map((n) => [n.type, n]));

export function getWorkflowNode(type) {
  return byType[type] ?? null;
}

export function getNodesByCategory(categoryId) {
  return WORKFLOW_NODES.filter((n) => n.category === categoryId);
}

export function createNodeDefaults(type) {
  const def = getWorkflowNode(type);
  if (!def) return null;

  const data = {
    nodeType: def.type,
    category: def.category,
    tone: def.tone,
    ...structuredClone(def.defaultData),
  };

  // Sync canvas badge with execution status for triggers
  if (data.executionStatus && !data.status) {
    data.status = data.executionStatus;
  }

  return data;
}
