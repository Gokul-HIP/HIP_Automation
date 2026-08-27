/**
 * Generates automation/node-contracts.json and automation/node-workflows/*.json
 * from the inspected frontend catalog + JS runtime contracts.
 *
 * Run: node automation/generate-contracts.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;
const FIXTURES = path.join(ROOT, "node-workflows");

fs.mkdirSync(FIXTURES, { recursive: true });

/** Catalog nodeTypes from src/components/flow/config/nodes/catalog.js */
const CATALOG = [
  { nodeType: "start", category: "triggers", title: "Workflow Start", description: "Entry point for every hospital automation workflow.", kind: "start" },
  { nodeType: "onChatMessage", category: "triggers", title: "On Message Received", description: "Triggers when a new incoming message is received on a supported channel.", kind: "trigger", laravelContext: ["context.patient", "context.message", "context.hospital"], config: { channel: ["any"], messageType: ["any"], messageMatch: "any", tags: [] } },
  { nodeType: "patientRegistered", category: "triggers", title: "Patient Registered", description: "Triggers when a patient is registered in HIP.", kind: "trigger", laravelContext: ["context.patient", "context.hospital"], config: { registrationSource: ["any"], patientType: "any" } },
  { nodeType: "appointmentBooked", category: "triggers", title: "Appointment Booked", description: "Triggers the workflow whenever a new appointment is successfully booked.", kind: "trigger", laravelContext: ["context.patient", "context.appointment", "context.doctor", "context.hospital"], config: { source: ["any"] }, reference: true },
  { nodeType: "appointmentRescheduled", category: "triggers", title: "Appointment Rescheduled", description: "Triggers when an existing appointment is rescheduled.", kind: "trigger", laravelContext: ["context.patient", "context.appointment", "context.doctor", "context.hospital"], config: { source: ["any"] } },
  { nodeType: "appointmentCompleted", category: "triggers", title: "Appointment Completed", description: "Triggers when an appointment is completed.", kind: "trigger", laravelContext: ["context.patient", "context.appointment", "context.doctor", "context.hospital"], config: { source: ["any"] } },
  { nodeType: "appointmentCancelled", category: "triggers", title: "Appointment Cancelled", description: "Triggers when an appointment is cancelled.", kind: "trigger", laravelContext: ["context.patient", "context.appointment", "context.doctor", "context.hospital"], config: { source: ["any"], cancelledBy: ["any"] } },
  { nodeType: "appointmentMissed", category: "triggers", title: "Appointment Missed", description: "Triggers when an appointment is missed / no-show.", kind: "trigger", laravelContext: ["context.patient", "context.appointment", "context.doctor", "context.hospital"], config: {} },
  { nodeType: "prescriptionAdded", category: "triggers", title: "Prescription Added", description: "Triggers when a prescription is added.", kind: "trigger", laravelContext: ["context.patient", "context.prescription", "context.doctor", "context.hospital"], config: { source: ["any"] } },
  { nodeType: "medicineReminder", category: "triggers", title: "Medicine Reminder Due", description: "Triggers when a medicine reminder is due.", kind: "trigger", laravelContext: ["context.patient", "context.prescription", "context.medicines", "context.doctor", "context.hospital"], config: { reminderTiming: "at_due", minutesBefore: 30 } },
  { nodeType: "labTestOrdered", category: "triggers", title: "Lab Test Ordered", description: "Triggers when a lab test is ordered.", kind: "trigger", laravelContext: ["context.patient", "context.lab", "context.hospital"], config: { source: ["any"] } },
  { nodeType: "labReportNotification", category: "triggers", title: "Lab Report Ready", description: "Triggers when a lab report is ready.", kind: "trigger", laravelContext: ["context.patient", "context.lab", "context.hospital"], config: {} },
  { nodeType: "pharmacyRefillDue", category: "triggers", title: "Pharmacy Refill Due", description: "Triggers when a pharmacy refill is due.", kind: "trigger", laravelContext: ["context.patient", "context.pharmacy", "context.hospital"], config: { daysBeforeRefill: 3 } },
  { nodeType: "appointmentReminder", category: "triggers", title: "Appointment Reminder", description: "Triggers relative to appointment time.", kind: "trigger", laravelContext: ["context.patient", "context.appointment", "context.doctor", "context.hospital"], config: { triggerTiming: "before_24h" } },
  { nodeType: "birthday", category: "triggers", title: "Birthday", description: "Triggers on patient birthday.", kind: "trigger", laravelContext: ["context.patient", "context.hospital"], config: { triggerTiming: "on_birthday", daysBefore: 1, executionTime: "09:00" } },
  { nodeType: "anniversary", category: "triggers", title: "Anniversary", description: "Triggers on anniversary date.", kind: "trigger", laravelContext: ["context.patient", "context.hospital"], config: { anniversaryType: "registration", triggerTiming: "on_date", daysBefore: 1, executionTime: "09:00" } },
  { nodeType: "membershipExpiry", category: "triggers", title: "Hospital Membership Expiry", description: "Triggers around hospital membership expiry.", kind: "trigger", laravelContext: ["context.patient", "context.membership", "context.hospital"], config: { triggerTiming: "before_expiry", numberOfDays: 7, executionTime: "09:00" } },
  { nodeType: "userPlanExpiry", category: "triggers", title: "User Plan Expiry", description: "Triggers around user plan expiry.", kind: "trigger", laravelContext: ["context.patient", "context.plan", "context.hospital"], config: { triggerTiming: "before_expiry", numberOfDays: 7, executionTime: "09:00" } },
  { nodeType: "rewardUpdated", category: "triggers", title: "Reward Points Updated", description: "Triggers when reward points are updated.", kind: "trigger", laravelContext: ["context.patient", "context.rewards", "context.hospital"], config: { updateType: ["any"] } },
  { nodeType: "rewardsTierUpgraded", category: "triggers", title: "Rewards Tier Upgraded", description: "Triggers when rewards tier is upgraded.", kind: "trigger", laravelContext: ["context.patient", "context.rewards", "context.hospital"], config: {} },
  { nodeType: "familyPackageTierUpdated", category: "triggers", title: "Family Package Plan Tier Updated", description: "Triggers when family package plan tier changes.", kind: "trigger", laravelContext: ["context.patient", "context.plan", "context.hospital"], config: { updateType: "any" } },
  { nodeType: "invoiceGenerated", category: "triggers", title: "Invoice Generated", description: "Triggers when an invoice is generated.", kind: "trigger", laravelContext: ["context.patient", "context.invoice", "context.hospital"], config: { source: ["any"] } },
  { nodeType: "paymentReceived", category: "triggers", title: "Payment Received", description: "Triggers when a payment is received.", kind: "trigger", laravelContext: ["context.patient", "context.payment", "context.hospital"], config: { paymentMode: ["any"], source: ["any"] } },
  { nodeType: "webhookEvent", category: "triggers", title: "Webhook Event", description: "Triggers from an external webhook.", kind: "trigger", laravelContext: [], config: { webhookName: "", webhookUrl: "https://api.healthinpocket.in/api/webhooks/{workflow_id}", httpMethod: "POST", secretKey: "", payloadVariables: [{ key: "", variable: "" }] } },
  { nodeType: "apiEvent", category: "triggers", title: "API Event", description: "Triggers from an external API event.", kind: "trigger", laravelContext: [], config: { eventName: "", apiKey: "", payloadVariables: [{ key: "", variable: "" }] } },
  { nodeType: "scheduledEvent", category: "triggers", title: "Scheduled Event", description: "Triggers on a date/time or recurring schedule.", kind: "trigger", laravelContext: [], config: { scheduleType: "once", startDate: "", executionTime: "09:00", repeatFrequency: "daily", endCondition: "never" } },

  { nodeType: "condition", category: "conditions", title: "Condition", description: "Evaluate a JEXL expression against the workflow context and route to True or False.", kind: "condition" },
  { nodeType: "wait", category: "wait", title: "Wait", description: "Pause the workflow for a duration or until a schedule.", kind: "wait" },

  { nodeType: "sendWhatsApp", category: "messaging", title: "Send WhatsApp", description: "Send an approved WhatsApp template to the patient or care team.", kind: "messaging", channel: "whatsapp" },
  { nodeType: "sendSms", category: "messaging", title: "Send SMS", description: "Send an SMS using an approved template.", kind: "messaging", channel: "sms" },
  { nodeType: "sendEmail", category: "messaging", title: "Send Email", description: "Send a transactional email.", kind: "messaging", channel: "email" },
  { nodeType: "sendPush", category: "messaging", title: "Send Push Notification", description: "Send a push notification.", kind: "messaging", channel: "push" },
  { nodeType: "sendAiChat", category: "messaging", title: "Send AI Chat", description: "Send an AI chat message.", kind: "messaging", channel: "ai_chat" },
  { nodeType: "sendAiVoice", category: "messaging", title: "Send AI Voice Call", description: "Send an AI voice call.", kind: "messaging", channel: "ai_voice" },
  { nodeType: "sendIvr", category: "messaging", title: "Send IVR", description: "Send an IVR call.", kind: "messaging", channel: "ivr" },
  { nodeType: "sendTemplate", category: "messaging", title: "Send Template", description: "Send a template on a selected channel.", kind: "messaging", channel: "multi" },

  { nodeType: "dbCreate", category: "database", title: "Create Record", description: "Create a hospital record.", kind: "stub", fields: { label: "Create Record" } },
  { nodeType: "dbUpdate", category: "database", title: "Update Record", description: "Update a hospital record.", kind: "stub", fields: { label: "Update Record", entity: "patient" } },
  { nodeType: "dbDelete", category: "database", title: "Delete Record", description: "Delete a hospital record.", kind: "stub", fields: { label: "Delete Record" } },
  { nodeType: "updateAppointment", category: "database", title: "Update Appointment", description: "Update appointment details.", kind: "stub", fields: { label: "Update Appointment" } },
  { nodeType: "updatePrescription", category: "database", title: "Update Prescription", description: "Update prescription data.", kind: "stub", fields: { label: "Update Prescription" } },
  { nodeType: "updateMembership", category: "database", title: "Update Membership", description: "Update membership status.", kind: "stub", fields: { label: "Update Membership" } },
  { nodeType: "dbQuery", category: "database", title: "Database Query", description: "Read patient or encounter records.", kind: "stub", fields: { label: "Database Query", query: "patient.id == context.patient.id" } },

  { nodeType: "httpRequest", category: "integrations", title: "REST API", description: "Call an external REST API.", kind: "stub", fields: { label: "REST API", url: "https://example.com/api" } },
  { nodeType: "ai", category: "ai", title: "AI", description: "Run an AI chat step.", kind: "stub", fields: { label: "AI" } },

  { nodeType: "end", category: "flow", title: "End", description: "Marks the end of a workflow branch.", kind: "end" },
];

const VARIABLES = {
  patient_name: { source: "context.patient.name | flattened as patient_name / PatientName", type: "string", uiPicker: true },
  patient_mobile: { source: "context.patient.mobile", type: "string", uiPicker: true },
  patient_email: { source: "context.patient.email", type: "string", uiPicker: true },
  patient_age: { source: "context.patient.age", type: "number", uiPicker: true },
  patient_gender: { source: "context.patient.gender", type: "string", uiPicker: true },
  doctor_name: { source: "context.doctor.name | flattened as doctor_name", type: "string", uiPicker: true },
  department: { source: "context.doctor.department | context", type: "string", uiPicker: true },
  appointment_date: { source: "context.appointment.date | appointment_date", type: "string", uiPicker: true },
  appointment_time: { source: "context.appointment.time | appointment_time", type: "string", uiPicker: true },
  appointment_id: { source: "context.appointment.id | appointment_id", type: "string|number", uiPicker: true },
  branch_name: { source: "context.appointment.branch_name | hospital branch", type: "string", uiPicker: true },
  invoice_amount: { source: "context.invoice.amount", type: "number", uiPicker: true },
  payment_status: { source: "context.payment.status | patient.payment_status", type: "string", uiPicker: true },
  prescription_id: { source: "context.prescription.id", type: "string|number", uiPicker: true },
  pharmacy_link: { source: "context.prescription.pharmacy_link", type: "string", uiPicker: true },
  medicine_name: { source: "context.medicine.name", type: "string", uiPicker: true },
  dosage: { source: "context.medicine.dosage", type: "string", uiPicker: true },
  frequency: { source: "context.medicine.frequency", type: "string", uiPicker: true },
  reminder_time: { source: "context.medicine.reminder_time", type: "string", uiPicker: true },
  time: { source: "context.medicine.time | generic", type: "string", uiPicker: true },
  date: { source: "context.medicine.date | generic", type: "string", uiPicker: true },
  hospital_name: { source: "context.hospital.name | hospital_name", type: "string", uiPicker: true },
  hospital_phone: { source: "context.hospital.phone | hospital_phone", type: "string", uiPicker: true },
  workflow_id: { source: "context.system.workflow_id", type: "string|number", uiPicker: true },
  triggered_at: { source: "context.system.triggered_at", type: "string", uiPicker: true },
};

/**
 * Runtime flattening also exposes bare keys from context objects.
 * These are used by ActionDispatcher (patient.id) and AppointmentBooked context,
 * but are NOT listed in WORKFLOW_VARIABLE_GROUPS UI picker unless noted.
 */
const RUNTIME_CONTEXT_KEYS_NOTE = {
  patient_id: {
    source: "context.patient.id (flattened as id, patient.id, patient_id)",
    type: "string|number",
    uiPicker: false,
    note: "Not in WORKFLOW_VARIABLE_GROUPS; ActionDispatcher reads context.patient.id",
  },
  doctor_id: {
    source: "context.doctor.id (flattened if present on doctor object)",
    type: "string|number",
    uiPicker: false,
    note: "Not in WORKFLOW_VARIABLE_GROUPS; available only if Laravel injects doctor.id",
  },
  hospital_id: {
    source: "context.hospital.id AND workflow.hospital_id for lookup scoping",
    type: "number",
    uiPicker: false,
    note: "Not in WORKFLOW_VARIABLE_GROUPS. Canonical for workflow selection from DoctorBooking.hospital_id. Required on workflow records; no global/null hospital fallback.",
  },
};

function statusFor(node) {
  if (node.nodeType === "appointmentBooked") return "implemented";
  if (node.kind === "condition" || node.kind === "wait" || node.kind === "end") return "implemented";
  if (node.kind === "start") return "partial";
  if (node.kind === "messaging") return "partial";
  if (node.kind === "trigger") return "partial";
  if (node.kind === "stub") return "stub";
  return "stub";
}

function executorFor(node) {
  switch (node.kind) {
    case "start":
      return "NodeExecutorRegistry.#executePassthrough (JS); frontend-only — stripped before Laravel save";
    case "trigger":
      return node.nodeType === "appointmentBooked"
        ? "Laravel AppointmentBookedTriggerExecutor (reference) + JS NodeExecutorRegistry.#executeTrigger (passthrough metadata)"
        : "JS NodeExecutorRegistry.#executeTrigger (generic passthrough). Laravel executor not present in this repo.";
    case "condition":
      return "ConditionExecutor (JEXL) via ConditionEngine.execute";
    case "wait":
      return "NodeExecutorRegistry.#executeWait + DelayScheduler.calculateDelayMs";
    case "messaging":
      return "ActionDispatcher.#dispatchMessaging → ChannelManager.send (JS adapters currently stub adapters)";
    case "end":
      return "NodeExecutorRegistry.#executeFlow (action: end)";
    case "stub":
      if (node.category === "database") return "ActionDispatcher.#dispatchDatabase (returns stub:true)";
      if (node.category === "integrations") return "ActionDispatcher.#dispatchIntegration (returns stub:true)";
      if (node.category === "ai") return "ActionDispatcher.#dispatchAI (returns stub:true)";
      return "none";
    default:
      return "none";
  }
}

function inputFor(node) {
  if (node.kind === "trigger" || node.kind === "start") {
    const fields = {
      label: { type: "string", required: true, description: "Display name / Trigger Name" },
      status: { type: "string", required: false, description: "draft | ready | published (UI)" },
    };
    for (const [k, v] of Object.entries(node.config || {})) {
      fields[k] = {
        type: Array.isArray(v) ? "array|string" : typeof v,
        required: true,
        description: `Trigger configuration field from frontend schema. Default: ${JSON.stringify(v)}`,
      };
    }
    return fields;
  }
  if (node.kind === "condition") {
    return {
      name: { type: "string", required: false, description: "Condition display name" },
      expression: { type: "string (JEXL)", required: true, description: "Boolean JEXL expression evaluated against execution context" },
      label: { type: "string", required: false, description: "Node label" },
    };
  }
  if (node.kind === "wait") {
    return {
      label: { type: "string", required: true, description: "Display name" },
      waitType: { type: "string", required: true, description: "duration | until | cron | recurring" },
      amount: { type: "number", required: false, description: "Duration amount when waitType=duration. Default 30" },
      unit: { type: "string", required: false, description: "minutes | hours | days when waitType=duration. Default minutes" },
      untilDate: { type: "string", required: false, description: "ISO/date string when waitType=until" },
      cron: { type: "string", required: false, description: "Cron expression when waitType=cron (JS scheduler stubs to 1h)" },
      recurringInterval: { type: "string", required: false, description: "daily | weekly | monthly when waitType=recurring" },
    };
  }
  if (node.kind === "messaging") {
    const base = {
      label: { type: "string", required: true, description: "Display name" },
      templateId: { type: "string", required: node.nodeType === "sendEmail" || node.nodeType === "sendPush" || node.nodeType === "sendAiVoice" ? false : true, description: "Template id / key" },
      recipient: { type: "string", required: false, description: "patient | doctor | caregiver | custom (defaults patient)" },
      customRecipient: { type: "string", required: false, description: "Used when recipient=custom" },
      repeatReminder: { type: "boolean", required: false, description: "Retry on failure" },
      retryInterval: { type: "number", required: false, description: "Minutes between retries (default 15)" },
      maxRetryCount: { type: "number", required: false, description: "Max retries (default 2)" },
      fallbackChannel: { type: "string", required: false, description: "Fallback channel key" },
      variables: { type: "object", required: false, description: "Template variable map" },
    };
    if (node.nodeType === "sendWhatsApp") {
      base.message = { type: "string", required: true, description: "Message body (supports {{tokens}})" };
      base.buttons = { type: "string", required: false, description: "Optional WhatsApp buttons" };
    }
    if (node.nodeType === "sendSms") {
      base.message = { type: "string", required: true, description: "SMS body" };
    }
    if (node.nodeType === "sendEmail") {
      base.subject = { type: "string", required: false, description: "Email subject" };
      base.body = { type: "string", required: false, description: "Email body" };
    }
    if (node.nodeType === "sendPush") {
      base.title = { type: "string", required: false, description: "Push title" };
      base.body = { type: "string", required: false, description: "Push body" };
      base.priority = { type: "string", required: false, description: "normal | high" };
    }
    if (node.nodeType === "sendTemplate") {
      base.channel = { type: "string", required: true, description: "whatsapp | sms | email | push" };
    }
    if (node.nodeType === "sendAiChat") {
      base.prompt = { type: "string", required: true, description: "AI prompt" };
      base.temperature = { type: "number", required: false, description: "0–2" };
    }
    if (node.nodeType === "sendAiVoice") {
      base.voiceProvider = { type: "string", required: true, description: "default | openai | azure | custom" };
      base.prompt = { type: "string", required: true, description: "Voice script / prompt" };
      base.language = { type: "string", required: false, description: "en | hi | ta | te | ar" };
      base.voice = { type: "string", required: false, description: "Voice id" };
      base.gender = { type: "string", required: false, description: "neutral | female | male" };
      base.retryCount = { type: "number", required: false, description: "0–5" };
    }
    return base;
  }
  if (node.kind === "end") {
    return {
      label: { type: "string", required: true, description: "Display name" },
      outcome: { type: "string", required: false, description: "completed | cancelled | failed (default completed)" },
    };
  }
  // stubs
  const fields = {
    label: { type: "string", required: true, description: "Display name" },
  };
  for (const [k, v] of Object.entries(node.fields || {})) {
    if (k === "label") continue;
    fields[k] = { type: typeof v, required: true, description: `Catalog field. Example: ${JSON.stringify(v)}` };
  }
  return fields;
}

function contextRequired(node) {
  if (node.laravelContext?.length) return node.laravelContext;
  if (node.kind === "messaging") {
    return ["context.patient (recipient resolution)", "context.doctor (if recipient=doctor)", "context.hospital"];
  }
  if (node.kind === "condition") {
    return ["JEXL scope: patient, customer(=patient), doctor, hospital, appointment, payment, invoice, prescription, organization, medicine, workflow, variables, outputs"];
  }
  if (node.kind === "wait" || node.kind === "end" || node.kind === "start") return [];
  return [];
}

function configuration(node) {
  if (node.kind === "trigger") {
    return {
      nodeType: node.nodeType,
      category: "triggers",
      label: node.title,
      status: "draft",
      ...(node.config || {}),
      note: "Persisted on node.data in React Flow configuration.nodes[].data",
    };
  }
  if (node.kind === "condition") {
    return {
      nodeType: "condition",
      category: "conditions",
      name: "Condition",
      label: "Condition",
      expression: 'appointment.status == "Confirmed"',
      status: "draft",
    };
  }
  if (node.kind === "wait") {
    return {
      nodeType: "wait",
      category: "wait",
      label: "Wait",
      waitType: "duration",
      amount: 30,
      unit: "minutes",
      status: "draft",
    };
  }
  if (node.kind === "messaging") {
    const cfg = {
      nodeType: node.nodeType,
      category: "messaging",
      label: node.title,
      templateId: "tpl_example",
      recipient: "patient",
      repeatReminder: false,
      retryInterval: 15,
      maxRetryCount: 2,
      fallbackChannel: node.nodeType === "sendWhatsApp" ? "sms" : "",
      variables: {},
      status: "draft",
    };
    if (node.nodeType === "sendWhatsApp") Object.assign(cfg, { message: "Hi {{patient_name}}, appointment with {{doctor_name}} on {{appointment_date}} at {{appointment_time}}.", buttons: "" });
    if (node.nodeType === "sendSms") Object.assign(cfg, { message: "Hi {{patient_name}}, reminder from {{hospital_name}}." });
    if (node.nodeType === "sendEmail") Object.assign(cfg, { subject: "Appointment — {{hospital_name}}", body: "Dear {{patient_name}}, see you on {{appointment_date}}." });
    if (node.nodeType === "sendPush") Object.assign(cfg, { title: "Appointment booked", body: "Hi {{patient_name}}", priority: "normal" });
    if (node.nodeType === "sendTemplate") Object.assign(cfg, { channel: "whatsapp" });
    if (node.nodeType === "sendAiChat") Object.assign(cfg, { prompt: "You are a helpful hospital care assistant.", temperature: 0.7 });
    if (node.nodeType === "sendAiVoice") Object.assign(cfg, { voiceProvider: "default", prompt: "Remind {{patient_name}} about the appointment.", language: "en", voice: "", gender: "neutral", retryCount: 1 });
    return cfg;
  }
  if (node.kind === "end") {
    return { nodeType: "end", category: "flow", label: "End", outcome: "completed", status: "ready" };
  }
  if (node.kind === "start") {
    return { nodeType: "start", category: "triggers", label: "Workflow Start", status: "ready", triggerSource: "manual" };
  }
  return {
    nodeType: node.nodeType,
    category: node.category,
    status: "draft",
    ...(node.fields || { label: node.title }),
  };
}

function outputFor(node, status) {
  if (node.kind === "trigger") {
    return {
      success: true,
      currentImplementation: {
        action: "continue",
        output: {
          triggered: true,
          nodeType: node.nodeType,
          timing: null,
          eventName: null,
        },
      },
      recommendedNormalized: {
        success: true,
        nodeType: node.nodeType,
        data: { triggered: true },
        metadata: {},
      },
      appointmentBookedEventPayloadNote:
        node.nodeType === "appointmentBooked"
          ? "Laravel injects context.patient / appointment / doctor / hospital. UI contextCard keys: patient_name, doctor_name, appointment_date, appointment_time. Variable picker also supports appointment_id, hospital_name. hospital_id is used for workflow lookup, not as a {{token}} in WORKFLOW_VARIABLE_GROUPS."
          : undefined,
    };
  }
  if (node.kind === "condition") {
    return {
      success: true,
      result: true,
      branch: "true",
      currentImplementation: {
        action: "branch",
        branchHandle: "true",
        output: { name: "Condition", expression: "...", passed: true, branch: "true" },
      },
    };
  }
  if (node.kind === "wait") {
    return {
      success: true,
      currentImplementation: {
        action: "delay",
        delayMs: 1800000,
        output: { jobId: "delay_…", delayMs: 1800000, resumeNodeId: "<wait-node-id>" },
      },
      afterResume: { action: "continue to next edge target" },
    };
  }
  if (node.kind === "messaging") {
    return {
      success: true,
      channel: node.channel,
      recipient: "<resolved>",
      currentImplementation: {
        action: "continue",
        output: {
          success: true,
          messageId: "msg_…",
          logId: "clog_…",
          channel: node.channel === "multi" ? "whatsapp" : node.channel,
          meta: { channel: node.channel, stub: true },
        },
      },
      recommendedNormalized: {
        success: true,
        nodeType: node.nodeType,
        data: { channel: node.channel, recipient: "<resolved>", messageId: "…" },
        metadata: {},
      },
    };
  }
  if (node.kind === "end") {
    return {
      success: true,
      currentImplementation: { action: "end", output: { outcome: "completed" } },
      executionStatus: "completed",
    };
  }
  if (node.kind === "start") {
    return {
      success: true,
      currentImplementation: { action: "continue", output: { nodeType: "start", context: "<executionId>" } },
      note: "Stripped from Laravel payload by stripFrontendStartNodes / serializeWorkflow",
    };
  }
  return {
    success: true,
    currentImplementation: {
      action: "continue",
      output: { action: node.category === "database" ? "database" : node.category === "integrations" ? "integration" : "ai", nodeType: node.nodeType, stub: true },
    },
    note: "Stub — no production side effects in JS runtime",
  };
}

function failureFor(node) {
  if (node.kind === "condition") {
    return { type: "error", message: "Invalid condition expression. | Condition evaluation failed.", currentImplementation: { action: "error", error: "<message>", output: { name: "…", expression: "…" } } };
  }
  if (node.kind === "messaging") {
    return { type: "error", message: "Action failed | Unknown channel | Channel send failed", currentImplementation: { action: "error", error: "<message>", output: { success: false, error: "…" } } };
  }
  if (node.kind === "wait") {
    return { type: "none-documented", message: "Wait node does not currently return action:error in NodeExecutorRegistry; invalid untilDate yields delayMs=0" };
  }
  if (statusFor(node) === "stub") {
    return { type: "not_applicable", message: "Stub dispatcher currently returns success:true with stub:true — failures not modeled yet" };
  }
  return { type: "execution_error", message: "WorkflowExecutor throws when action=error or missing outgoing edge" };
}

function nextStepBehavior(node) {
  if (node.kind === "condition") return "action=branch; WorkflowExecutor matches outgoing edge sourceHandle === 'true'|'false'";
  if (node.kind === "wait") return "action=delay; scheduler resumes then follows first outgoing edge";
  if (node.kind === "end") return "action=end; execution status=completed; branch terminates";
  if (node.kind === "start") return "continue to first outgoing edge (usually trigger); omitted from persisted Laravel graph";
  return "action=continue; follow first outgoing edge (parallel fan-out not implemented)";
}

function buildNodeContract(node) {
  const status = statusFor(node);
  const contract = {
    nodeType: node.nodeType,
    category: node.category,
    status,
    description: node.description,
    title: node.title,
    input: inputFor(node),
    contextRequired: contextRequired(node),
    configuration: configuration(node),
    output: outputFor(node, status),
    failure: failureFor(node),
    executor: executorFor(node),
    nextStepBehavior: nextStepBehavior(node),
  };

  if (node.nodeType === "appointmentBooked") {
    contract.triggerContract = {
      configuration: { source: ["any"], label: "Appointment Booked", status: "draft" },
      eventPayload: {
        note: "Laravel DoctorBooking / AppointmentBookedTriggerExecutor — not defined in this frontend repo. Document only keys known from frontend contracts.",
        knownUiContextCardKeys: ["patient_name", "doctor_name", "appointment_date", "appointment_time"],
        knownVariablePickerKeys: ["patient_name", "doctor_name", "appointment_date", "appointment_time", "appointment_id", "hospital_name", "hospital_phone"],
        hospitalIsolation: {
          hospital_id_source: "DoctorBooking.hospital_id (canonical)",
          workflowLookup: {
            trigger_type: "appointmentBooked",
            status: "published|active",
            hospital_id: "booking.hospital_id",
            noGlobalNullFallback: true,
          },
        },
        idsNotInUiPicker: {
          patient_id: "Available via context.patient.id if injected",
          doctor_id: "Available via context.doctor.id if injected",
          hospital_id: "Used for workflow scoping; not a UI {{token}}",
          appointment_id: "In UI variable picker as appointment_id",
        },
      },
      runtimeContext: ["context.patient", "context.appointment", "context.doctor", "context.hospital"],
      output: contract.output,
    };
  }

  return contract;
}

const SAMPLE_CONTEXT = {
  executionId: "exec_fixture_1",
  workflowId: 101,
  workflowName: "Fixture Workflow",
  triggerPayload: { source: "mobile" },
  patient: {
    id: 501,
    name: "Riya Sharma",
    patient_name: "Riya Sharma",
    mobile: "+919876543210",
    email: "riya@example.com",
    age: 32,
    gender: "female",
  },
  doctor: {
    id: 77,
    name: "Dr. Mehta",
    doctor_name: "Dr. Mehta",
    department: "Cardiology",
    mobile: "+919811122233",
  },
  appointment: {
    id: 9001,
    appointment_id: 9001,
    appointment_date: "2026-08-27",
    appointment_time: "10:30",
    status: "Confirmed",
    branch_name: "Main Campus",
  },
  hospital: {
    id: 12,
    hospital_id: 12,
    name: "Sunrise Hospital",
    hospital_name: "Sunrise Hospital",
    phone: "+912212345678",
    hospital_phone: "+912212345678",
  },
  prescription: {},
  medicine: {},
  payment: {},
  invoice: {},
  organization: { id: 2 },
  variables: {},
  system: { triggered_at: "2026-08-26T06:00:00.000Z", workflow_id: 101 },
};

function nodeData(nodeType, data) {
  return {
    id: `n_${nodeType}`,
    type: "workflow",
    position: { x: 280, y: 160 },
    data: {
      nodeType,
      ...data,
    },
  };
}

function endNode(id = "n_end", x = 560, y = 160) {
  return {
    id,
    type: "workflow",
    position: { x, y },
    data: { nodeType: "end", category: "flow", label: "End", outcome: "completed", status: "ready" },
  };
}

function triggerNode(overrides = {}) {
  return {
    id: "n_appointmentBooked",
    type: "workflow",
    position: { x: 40, y: 160 },
    data: {
      nodeType: "appointmentBooked",
      category: "triggers",
      label: "Appointment Booked",
      status: "draft",
      source: ["any"],
      ...overrides,
    },
  };
}

function edge(id, source, target, sourceHandle = null) {
  const e = {
    id,
    source,
    target,
    type: "smoothstep",
    sourceHandle: sourceHandle,
    targetHandle: null,
  };
  return e;
}

function wrapWorkflow({ name, focusNodeType, nodes, edges, test }) {
  return {
    meta: {
      name,
      focusNodeType,
      hospitalIsolation: {
        hospital_id: 12,
        rule: "Production workflow lookup MUST filter trigger_type + status(published/active) + hospital_id=booking.hospital_id. No global/null hospital fallback.",
      },
      notes: [
        "Minimal executable fixture for Laravel Automation Engine implementation/tests.",
        "start node omitted (frontend-only; stripped on save).",
        "Valid nodeType + configuration fields from frontend catalog/schemas.",
      ],
    },
    workflow: {
      name,
      organization_id: 2,
      hospital_id: 12,
      status: "inactive",
      trigger: "appointmentBooked",
      module: "appointments",
      configuration: {
        builderVersion: "1",
        reactFlowVersion: "12.x",
        viewport: { x: 0, y: 0, zoom: 1 },
        nodes,
        edges,
      },
    },
    test,
  };
}

function messagingConfig(node) {
  return configuration(node);
}

function buildFixture(node) {
  const focus = node.nodeType;

  if (node.kind === "start") {
    return wrapWorkflow({
      name: `Fixture — ${focus}`,
      focusNodeType: focus,
      nodes: [
        {
          id: "n_start",
          type: "workflow",
          position: { x: -200, y: 160 },
          data: configuration(node),
        },
        triggerNode(),
        endNode(),
      ],
      edges: [
        edge("e1", "n_start", "n_appointmentBooked"),
        edge("e2", "n_appointmentBooked", "n_end"),
      ],
      test: {
        inputContext: SAMPLE_CONTEXT,
        expectedNodeExecution: ["start (passthrough)", "appointmentBooked (continue)", "end"],
        expectedOutput: { start: { action: "continue" }, end: { action: "end", outcome: "completed" } },
        expectedNextNode: { n_start: "n_appointmentBooked", n_appointmentBooked: "n_end" },
        expectedFailureBehavior: "Missing outgoing edge throws",
        note: "start is stripped before Laravel persistence; production graphs begin at trigger.",
      },
    });
  }

  if (node.kind === "trigger") {
    const t = {
      id: `n_${focus}`,
      type: "workflow",
      position: { x: 40, y: 160 },
      data: { ...configuration(node), label: node.title },
    };
    return wrapWorkflow({
      name: `Fixture — ${focus}`,
      focusNodeType: focus,
      nodes: [t, endNode()],
      edges: [edge("e1", t.id, "n_end")],
      test: {
        inputContext: {
          ...SAMPLE_CONTEXT,
          triggerPayload: { trigger_type: focus },
        },
        expectedNodeExecution: [`${focus} trigger metadata recorded`, "end"],
        expectedOutput: {
          trigger: { action: "continue", output: { triggered: true, nodeType: focus } },
          end: { action: "end", output: { outcome: "completed" } },
        },
        expectedNextNode: { [t.id]: "n_end" },
        expectedFailureBehavior: "No outgoing edge → WorkflowExecutor throws",
        hospitalLookup:
          focus === "appointmentBooked"
            ? {
                trigger_type: "appointmentBooked",
                status: "published|active",
                hospital_id: "booking.hospital_id (e.g. 12)",
                noGlobalNullFallback: true,
              }
            : undefined,
      },
    });
  }

  if (node.kind === "condition") {
    return wrapWorkflow({
      name: `Fixture — ${focus}`,
      focusNodeType: focus,
      nodes: [
        triggerNode(),
        {
          id: "n_condition",
          type: "workflow",
          position: { x: 280, y: 160 },
          data: {
            nodeType: "condition",
            category: "conditions",
            name: "Confirmed Appointment",
            label: "Confirmed Appointment",
            expression: 'appointment.status == "Confirmed"',
            status: "draft",
          },
        },
        {
          id: "n_end_true",
          type: "workflow",
          position: { x: 560, y: 60 },
          data: { nodeType: "end", category: "flow", label: "End True", outcome: "completed", status: "ready" },
        },
        {
          id: "n_end_false",
          type: "workflow",
          position: { x: 560, y: 260 },
          data: { nodeType: "end", category: "flow", label: "End False", outcome: "completed", status: "ready" },
        },
      ],
      edges: [
        edge("e1", "n_appointmentBooked", "n_condition"),
        edge("e_true", "n_condition", "n_end_true", "true"),
        edge("e_false", "n_condition", "n_end_false", "false"),
      ],
      test: {
        inputContext: SAMPLE_CONTEXT,
        expectedNodeExecution: ["appointmentBooked", "condition → branch true", "end true"],
        expectedOutput: {
          condition: {
            success: true,
            result: true,
            branch: "true",
            currentImplementation: {
              action: "branch",
              branchHandle: "true",
              output: { passed: true, branch: "true", expression: 'appointment.status == "Confirmed"' },
            },
          },
        },
        expectedNextNode: { n_condition: "n_end_true" },
        expectedFailureBehavior: "Empty/invalid JEXL → action=error; execution fails",
      },
    });
  }

  if (node.kind === "wait") {
    return wrapWorkflow({
      name: `Fixture — ${focus}`,
      focusNodeType: focus,
      nodes: [
        triggerNode(),
        {
          id: "n_wait",
          type: "workflow",
          position: { x: 280, y: 160 },
          data: configuration(node),
        },
        {
          id: "n_sendPush",
          type: "workflow",
          position: { x: 480, y: 160 },
          data: {
            nodeType: "sendPush",
            category: "messaging",
            label: "Send Push Notification",
            templateId: "",
            recipient: "patient",
            title: "Follow-up",
            body: "Hi {{patient_name}}",
            priority: "normal",
            status: "draft",
          },
        },
        endNode("n_end", 700, 160),
      ],
      edges: [
        edge("e1", "n_appointmentBooked", "n_wait"),
        edge("e2", "n_wait", "n_sendPush"),
        edge("e3", "n_sendPush", "n_end"),
      ],
      test: {
        inputContext: SAMPLE_CONTEXT,
        expectedNodeExecution: ["appointmentBooked", "wait delay 30m", "resume → sendPush", "end"],
        expectedOutput: {
          wait: { action: "delay", delayMs: 30 * 60 * 1000 },
          sendPush: { success: true, channel: "push" },
        },
        expectedNextNode: { n_wait: "n_sendPush", n_sendPush: "n_end" },
        expectedFailureBehavior: "Channel failure → action=error if send fails without successful fallback",
      },
    });
  }

  if (node.kind === "end") {
    return wrapWorkflow({
      name: `Fixture — ${focus}`,
      focusNodeType: focus,
      nodes: [triggerNode(), endNode()],
      edges: [edge("e1", "n_appointmentBooked", "n_end")],
      test: {
        inputContext: SAMPLE_CONTEXT,
        expectedNodeExecution: ["appointmentBooked", "end"],
        expectedOutput: { end: { action: "end", output: { outcome: "completed" }, executionStatus: "completed" } },
        expectedNextNode: { n_appointmentBooked: "n_end", n_end: null },
        expectedFailureBehavior: "None — end terminates branch",
      },
    });
  }

  // messaging + stubs: appointmentBooked → target → end
  const target = {
    id: `n_${focus}`,
    type: "workflow",
    position: { x: 280, y: 160 },
    data: messagingConfig(node),
  };
  return wrapWorkflow({
    name: `Fixture — ${focus}`,
    focusNodeType: focus,
    nodes: [triggerNode(), target, endNode("n_end", 560, 160)],
    edges: [
      edge("e1", "n_appointmentBooked", target.id),
      edge("e2", target.id, "n_end"),
    ],
    test: {
      inputContext: SAMPLE_CONTEXT,
      expectedNodeExecution: ["appointmentBooked", focus, "end"],
      expectedOutput:
        node.kind === "messaging"
          ? {
              [focus]: {
                success: true,
                channel: node.channel,
                currentImplementation: "ChannelManager.send result (JS adapters stub messageId)",
              },
            }
          : {
              [focus]: { success: true, stub: true },
            },
      expectedNextNode: { [target.id]: "n_end" },
      expectedFailureBehavior:
        node.kind === "messaging"
          ? "dispatch failure → action=error; WorkflowExecutor fails execution"
          : "Stub currently does not fail",
    },
  });
}

// ── emit contracts ──────────────────────────────────────────────
const nodes = CATALOG.map(buildNodeContract);
const summary = {
  totalNodes: nodes.length,
  implemented: nodes.filter((n) => n.status === "implemented").map((n) => n.nodeType),
  partial: nodes.filter((n) => n.status === "partial").map((n) => n.nodeType),
  stub: nodes.filter((n) => n.status === "stub").map((n) => n.nodeType),
};

const contracts = {
  version: "1.0.0",
  generatedAt: new Date().toISOString(),
  sourceOfTruth: {
    frontendCatalog: "src/components/flow/config/nodes/catalog.js",
    triggerSchemas: "src/components/flow/config/triggers/schemas.js",
    messagingSchemas: "src/components/flow/config/messaging/schemas.js",
    conditionSchemas: "src/components/flow/config/conditions/schemas.js",
    waitSchemas: "src/components/flow/config/wait/schemas.js",
    variables: "src/components/flow/config/variables.js",
    jsRuntime: [
      "src/runtime/compiler/WorkflowCompiler.js",
      "src/runtime/executor/WorkflowExecutor.js",
      "src/runtime/executor/NodeExecutorRegistry.js",
      "src/runtime/executor/ConditionExecutor.js",
      "src/runtime/dispatch/ActionDispatcher.js",
      "src/runtime/channels/ChannelManager.js",
      "src/runtime/variables/VariableResolver.js",
      "src/runtime/engines/DelayScheduler.js",
    ],
    laravelNote:
      "Laravel classes (NodeTypeNormalizer, AppointmentBookedTriggerExecutor, AutomationContextBuilder, etc.) are NOT in this repository. appointmentBooked is marked implemented per product reference; other Laravel executors must be verified against the PHP codebase.",
  },
  hospitalIsolation: {
    rule: "Production workflow lookup is hospital-scoped.",
    appointmentBooked: {
      hospital_id_canonical_source: "DoctorBooking.hospital_id",
      selection: {
        trigger_type: "appointmentBooked",
        status: "published|active",
        hospital_id: "booking.hospital_id",
      },
      noGlobalNullFallback: true,
    },
    workflowPayloadField: "hospital_id",
    frontendCreateFlow: "CreateWorkflowModal requires hospital selection before blank/template",
  },
  executionResultContract: {
    documentedIdeal: {
      success: true,
      nodeType: "<nodeType>",
      data: {},
      metadata: {},
    },
    currentImplementation: {
      note: "Do not change runtime to force ideal shape. Document actual NodeExecutionResult.",
      shape: {
        action: "continue | branch | delay | end | error",
        nextNodeId: "string|null (optional)",
        branchHandle: "true|false (optional)",
        delayMs: "number|null (optional)",
        output: "object (optional)",
        error: "string|null (optional)",
      },
      source: "src/runtime/types.js NodeExecutionResult",
    },
  },
  variables: VARIABLES,
  runtimeContextKeysNotInUiPicker: RUNTIME_CONTEXT_KEYS_NOTE,
  variableResolverBehavior: {
    tokenPattern: "{{word}}",
    flattening:
      "For each context section (patient, doctor, appointment, prescription, medicine, hospital, payment, invoice, organization, triggerPayload), exposes bare key, prefix.key, prefix_key, and PascalCase aliases.",
    source: "src/runtime/variables/VariableResolver.js",
  },
  schemaOnlyTypesNotInCatalog: {
    note: "Present in runtime type sets or schemas but NOT in WORKFLOW_NODES catalog — no fixtures generated.",
    types: [
      "sendInApp",
      "switch",
      "delay",
      "waitUntil",
      "cronSchedule",
      "recurring",
      "webhook",
      "fhir",
      "abdm",
      "paymentGateway",
      "thirdPartyApi",
      "aiChat",
      "aiVoice",
      "aiSummarize",
      "aiIntent",
      "aiRag",
      "aiRecommend",
      "aiSentiment",
      "aiClassify",
      "assignPatient",
      "loop",
      "split",
      "parallel",
      "merge",
    ],
  },
  mismatches: [
    {
      id: "MESSAGING_sendInApp",
      detail: "MESSAGING_NODE_TYPES includes sendInApp but catalog messaging entry is commented out / absent.",
    },
    {
      id: "CONDITION_switch",
      detail: "conditions/schemas.js defines switch; catalog only exposes condition.",
    },
    {
      id: "WAIT_extra_types",
      detail: "wait/schemas.js defines delay, waitUntil, cronSchedule, recurring; catalog only exposes wait.",
    },
    {
      id: "RUNTIME_TYPES_vs_CATALOG",
      detail: "INTEGRATION_NODE_TYPES / AI_NODE_TYPES include many types not present in catalog (catalog has httpRequest + ai stubs only).",
    },
    {
      id: "VARIABLE_IDS",
      detail: "hospital_id, patient_id, doctor_id are not in WORKFLOW_VARIABLE_GROUPS; appointment_id and hospital_name are. hospital_id is a workflow record field for isolation.",
    },
    {
      id: "CHANNEL_ADAPTERS_STUB",
      detail: "JS ChannelManager BaseChannelAdapter always returns success with stub:true — not production delivery.",
    },
    {
      id: "LARAVEL_NOT_IN_REPO",
      detail: "Cannot verify AppointmentBookedTriggerExecutor / AutomationContextBuilder / NodeTypeNormalizer field-level payloads from this repo alone.",
    },
  ],
  summary,
  nodes,
};

fs.writeFileSync(path.join(ROOT, "node-contracts.json"), JSON.stringify(contracts, null, 2));

// ── emit fixtures ───────────────────────────────────────────────
const fixtureIndex = [];
for (const node of CATALOG) {
  const fixture = buildFixture(node);
  const file = `${node.nodeType}.workflow.json`;
  fs.writeFileSync(path.join(FIXTURES, file), JSON.stringify(fixture, null, 2));
  fixtureIndex.push(file);
}

fs.writeFileSync(
  path.join(FIXTURES, "README.md"),
  `# Node workflow fixtures

One minimal workflow per catalog nodeType.

Hospital isolation: every fixture sets \`workflow.hospital_id = 12\` and documents that production lookup must use:

- trigger_type
- status = published/active
- hospital_id = booking.hospital_id

**No global/null hospital fallback.**

Generated files (${fixtureIndex.length}):

${fixtureIndex.map((f) => `- ${f}`).join("\n")}
`
);

fs.writeFileSync(
  path.join(ROOT, "README.md"),
  `# Automation Engine Contract Artifacts

- \`node-contracts.json\` — machine-readable backend contract for every catalog node
- \`node-workflows/\` — one minimal executable workflow fixture per node
- \`generate-contracts.mjs\` — regenerator (re-run after catalog/schema changes)

Source of truth: frontend Flow Builder catalog/schemas + JS runtime under \`src/runtime/\`.

Laravel PHP Automation Engine code is not in this repository; \`appointmentBooked\` is marked **implemented** as the product reference implementation.
`
);

console.log(JSON.stringify({ ...summary, fixtures: fixtureIndex.length }, null, 2));
