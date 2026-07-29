import {
  HiOutlinePlay,
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
  HiOutlineFilter,
  HiOutlineUserAdd,
  HiOutlineXCircle,
  HiOutlineStatusOffline,
  HiOutlineCash,
  HiOutlineLink,
  HiOutlineLightningBolt,
  HiOutlineRefresh,
  HiOutlineCake,
  HiOutlineHeart,
  HiOutlineCreditCard,
  HiOutlineStatusOnline,
  HiOutlineStop,
  HiOutlineDuplicate,
  HiOutlineShare,
  HiOutlineTrendingUp,
  HiOutlineSearchCircle,
  HiOutlineEmojiHappy,
  HiOutlinePhone,
  HiOutlineSpeakerphone,
  HiOutlineCloudUpload,
  HiOutlineShieldCheck,
  HiOutlineCurrencyDollar,
  HiOutlinePuzzle,
} from "react-icons/hi";
import { getTriggerSchema, buildTriggerDefaults } from "../triggers";
import { getMessagingSchema, buildMessagingDefaults } from "../messaging/schemas";
import { getConditionSchema, buildConditionDefaults } from "../conditions/schemas";
import { getWaitSchema, buildWaitDefaults } from "../wait/schemas";
import { toneForCategory } from "../nodeTones";

function triggerNode({ type, title, icon, tone }) {
  const schema = getTriggerSchema(type);
  return {
    type,
    category: "triggers",
    title,
    description: schema?.description || title,
    icon,
    tone: tone || toneForCategory("triggers"),
    isTrigger: true,
    customPanel: "trigger",
    defaultData: buildTriggerDefaults(type) || { label: title, status: "draft" },
    fields: (schema?.fields || [])
      .filter((f) => f.required && f.key)
      .map((f) => ({ key: f.key, label: f.label, type: f.type, required: true })),
  };
}

function messagingNode({ type, title, icon }) {
  const schema = getMessagingSchema(type);
  return {
    type,
    category: "messaging",
    title,
    description: schema?.description || title,
    icon,
    tone: toneForCategory("messaging"),
    customPanel: "messaging",
    defaultData: buildMessagingDefaults(type) || { label: title, status: "draft" },
    fields: (schema?.fields || [])
      .filter((f) => f.required && f.key && !["retry", "variables"].includes(f.type))
      .map((f) => ({ key: f.key, label: f.label, type: f.type, required: true })),
  };
}

function conditionNode({ type, title, icon }) {
  const schema = getConditionSchema(type);
  return {
    type,
    category: "conditions",
    title,
    description: schema?.description || title,
    icon,
    tone: toneForCategory("conditions"),
    customPanel: "condition",
    defaultData: buildConditionDefaults(type) || { label: title, status: "draft" },
    fields: [{ key: "label", label: "Display name", type: "text", required: true }],
  };
}

function waitNode({ type, title, icon }) {
  const schema = getWaitSchema(type);
  return {
    type,
    category: "wait",
    title,
    description: schema?.description || title,
    icon,
    tone: toneForCategory("wait"),
    customPanel: "wait",
    defaultData: buildWaitDefaults(type) || { label: title, status: "draft" },
    fields: (schema?.fields || [])
      .filter((f) => f.required && f.key)
      .map((f) => ({ key: f.key, label: f.label, type: f.type, required: true })),
  };
}

function stubNode({ type, category, title, description, icon, fields, defaultData }) {
  return {
    type,
    category,
    title,
    description,
    icon,
    tone: toneForCategory(category),
    defaultData: { label: title, status: "draft", ...defaultData },
    fields:
      fields || [{ key: "label", label: "Display name", type: "text", required: true }],
  };
}

export const WORKFLOW_NODES = [
  /* ── Triggers ── */
  {
    type: "start",
    category: "triggers",
    title: "Workflow Start",
    description: "Entry point for every hospital automation workflow.",
    icon: HiOutlinePlay,
    tone: toneForCategory("triggers"),
    isStart: true,
    defaultData: { label: "Workflow Start", status: "ready", triggerSource: "manual" },
    fields: [{ key: "label", label: "Display name", type: "text", required: true }],
  },
  triggerNode({ type: "onChatMessage", title: "On Chat Message", icon: HiOutlineChatAlt2 }),
  triggerNode({ type: "patientRegistered", title: "Patient Registered", icon: HiOutlineUserAdd }),
  triggerNode({ type: "appointmentBooked", title: "Appointment Booked", icon: HiOutlineCalendar }),
  triggerNode({ type: "appointmentCancelled", title: "Appointment Cancelled", icon: HiOutlineXCircle }),
  triggerNode({ type: "appointmentMissed", title: "Appointment Missed", icon: HiOutlineStatusOffline }),
  triggerNode({ type: "appointmentRescheduled", title: "Appointment Rescheduled", icon: HiOutlineRefresh }),
  triggerNode({ type: "prescriptionAdded", title: "Prescription Added", icon: HiOutlineClipboardList }),
  triggerNode({ type: "medicineReminder", title: "Medicine Reminder", icon: HiOutlineBell }),
  triggerNode({ type: "labTestOrdered", title: "Lab Test Ordered", icon: HiOutlineDocumentReport }),
  triggerNode({ type: "labReportNotification", title: "Lab Report Ready", icon: HiOutlineDocumentReport }),
  triggerNode({ type: "scanReportNotification", title: "Scan Report Ready", icon: HiOutlinePhotograph }),
  triggerNode({ type: "pharmacyRefillDue", title: "Pharmacy Refill Due", icon: HiOutlineRefresh }),
  triggerNode({ type: "birthday", title: "Birthday", icon: HiOutlineCake }),
  triggerNode({ type: "anniversary", title: "Anniversary", icon: HiOutlineHeart }),
  triggerNode({ type: "membershipExpiry", title: "Membership Expiry", icon: HiOutlineGift }),
  triggerNode({ type: "rewardUpdated", title: "Reward Updated", icon: HiOutlineTrendingUp }),
  triggerNode({ type: "paymentReceived", title: "Payment Received", icon: HiOutlineCash }),
  triggerNode({ type: "webhookEvent", title: "Webhook Event", icon: HiOutlineLink }),
  triggerNode({ type: "apiEvent", title: "API Event", icon: HiOutlineLightningBolt }),
  triggerNode({ type: "scheduledEvent", title: "Scheduled Event", icon: HiOutlineClock }),
  triggerNode({ type: "appointmentReminder", title: "Appointment Reminder", icon: HiOutlineCalendar }),
  triggerNode({ type: "doctorFollowUp", title: "Doctor Follow-up", icon: HiOutlineUserGroup }),
  triggerNode({ type: "prescriptionNotification", title: "Prescription Notification", icon: HiOutlineClipboardList }),
  triggerNode({ type: "chatbotTrigger", title: "Chatbot", icon: HiOutlineChatAlt2 }),
  triggerNode({ type: "aiSymptomsChecker", title: "AI Symptoms Checker", icon: HiOutlineSparkles }),
  triggerNode({ type: "reviewReminder", title: "Review Reminder", icon: HiOutlineStar }),
  triggerNode({ type: "patientFeedback", title: "Patient Feedback", icon: HiOutlineAnnotation }),

  /* ── Conditions ── */
  conditionNode({ type: "condition", title: "IF / ELSE", icon: HiOutlineSwitchHorizontal }),
  conditionNode({ type: "switch", title: "Switch", icon: HiOutlineCollection }),
  conditionNode({ type: "logicNot", title: "NOT", icon: HiOutlineFilter }),
  conditionNode({ type: "compare", title: "Compare", icon: HiOutlineCode }),
  conditionNode({ type: "patientSegment", title: "Patient Segment", icon: HiOutlineUserGroup }),
  conditionNode({ type: "disease", title: "Disease", icon: HiOutlineShieldCheck }),
  conditionNode({ type: "age", title: "Age", icon: HiOutlineUserAdd }),
  conditionNode({ type: "gender", title: "Gender", icon: HiOutlineUserAdd }),
  conditionNode({ type: "language", title: "Language", icon: HiOutlineGlobeAlt }),
  conditionNode({ type: "membership", title: "Membership", icon: HiOutlineGift }),
  conditionNode({ type: "paymentStatus", title: "Payment Status", icon: HiOutlineCreditCard }),
  conditionNode({ type: "lastVisit", title: "Last Visit", icon: HiOutlineCalendar }),

  /* ── Wait / Delay ── */
  waitNode({ type: "wait", title: "Wait", icon: HiOutlineClock }),
  waitNode({ type: "delay", title: "Delay", icon: HiOutlineClock }),
  waitNode({ type: "waitUntil", title: "Wait Until", icon: HiOutlineCalendar }),
  waitNode({ type: "cronSchedule", title: "Cron Schedule", icon: HiOutlineRefresh }),
  waitNode({ type: "recurring", title: "Recurring", icon: HiOutlineRefresh }),

  /* ── Messaging ── */
  messagingNode({ type: "sendWhatsApp", title: "Send WhatsApp", icon: HiOutlineDeviceMobile }),
  messagingNode({ type: "sendSms", title: "Send SMS", icon: HiOutlineDeviceMobile }),
  messagingNode({ type: "sendEmail", title: "Send Email", icon: HiOutlineMail }),
  messagingNode({ type: "sendPush", title: "Send Push Notification", icon: HiOutlineBell }),
  // messagingNode({ type: "sendInApp", title: "Send In-App Notification", icon: HiOutlineStatusOnline }),
  messagingNode({ type: "sendAiChat", title: "Send AI Chat", icon: HiOutlineChatAlt2 }),
  messagingNode({ type: "sendAiVoice", title: "Send AI Voice Call", icon: HiOutlinePhone }),
  messagingNode({ type: "sendIvr", title: "Send IVR", icon: HiOutlineSpeakerphone }),
  messagingNode({ type: "sendTemplate", title: "Send Template", icon: HiOutlineTemplate }),

  /* ── Database (stubs) ── */
  stubNode({ type: "dbCreate", category: "database", title: "Create Record", icon: HiOutlineDatabase, description: "Create a hospital record." }),
  stubNode({ type: "dbUpdate", category: "database", title: "Update Record", icon: HiOutlineDatabase, description: "Update a hospital record.", fields: [{ key: "label", label: "Display name", type: "text", required: true }, { key: "entity", label: "Entity", type: "select", options: [{ value: "patient", label: "Patient" }, { value: "appointment", label: "Appointment" }], required: true }] }),
  stubNode({ type: "dbDelete", category: "database", title: "Delete Record", icon: HiOutlineDatabase, description: "Delete a hospital record." }),
  stubNode({ type: "assignPatient", category: "database", title: "Assign Patient", icon: HiOutlineUserAdd, description: "Assign a patient to a care team." }),
  stubNode({ type: "updateAppointment", category: "database", title: "Update Appointment", icon: HiOutlineCalendar, description: "Update appointment details." }),
  stubNode({ type: "updatePrescription", category: "database", title: "Update Prescription", icon: HiOutlineClipboardList, description: "Update prescription data." }),
  stubNode({ type: "updateMembership", category: "database", title: "Update Membership", icon: HiOutlineGift, description: "Update membership status." }),
  stubNode({ type: "dbQuery", category: "database", title: "Database Query", icon: HiOutlineDatabase, description: "Read patient or encounter records.", fields: [{ key: "label", label: "Display name", type: "text", required: true }, { key: "query", label: "Query / filter", type: "textarea", required: true }] }),

  /* ── Integrations (stubs) ── */
  stubNode({ type: "webhook", category: "integrations", title: "Webhook", icon: HiOutlineGlobeAlt, description: "Emit or receive a webhook.", fields: [{ key: "label", label: "Display name", type: "text", required: true }, { key: "endpoint", label: "Endpoint", type: "text", required: true }] }),
  stubNode({ type: "httpRequest", category: "integrations", title: "REST API", icon: HiOutlineCode, description: "Call an external REST API.", fields: [{ key: "label", label: "Display name", type: "text", required: true }, { key: "url", label: "URL", type: "text", required: true }] }),
  stubNode({ type: "fhir", category: "integrations", title: "FHIR", icon: HiOutlineShieldCheck, description: "Exchange FHIR resources." }),
  stubNode({ type: "abdm", category: "integrations", title: "ABDM", icon: HiOutlineLink, description: "Integrate with ABDM health stack." }),
  stubNode({ type: "paymentGateway", category: "integrations", title: "Payment Gateway", icon: HiOutlineCurrencyDollar, description: "Process payments via gateway." }),
  stubNode({ type: "thirdPartyApi", category: "integrations", title: "Third Party API", icon: HiOutlinePuzzle, description: "Connect a third-party service." }),

  /* ── AI (stubs) ── */
  stubNode({ type: "aiChat", category: "ai", title: "AI Chat", icon: HiOutlineChatAlt2, description: "Run an AI chat step." }),
  stubNode({ type: "aiVoice", category: "ai", title: "AI Voice", icon: HiOutlinePhone, description: "Run an AI voice step." }),
  stubNode({ type: "aiSummarize", category: "ai", title: "Summarize Patient", icon: HiOutlineSparkles, description: "Summarize patient context." }),
  stubNode({ type: "aiIntent", category: "ai", title: "Intent Detection", icon: HiOutlineSearchCircle, description: "Detect patient intent." }),
  stubNode({ type: "aiRag", category: "ai", title: "RAG Search", icon: HiOutlineSearchCircle, description: "Search knowledge base with RAG." }),
  stubNode({ type: "aiRecommend", category: "ai", title: "Recommendations", icon: HiOutlineTrendingUp, description: "Generate care recommendations." }),
  stubNode({ type: "aiSentiment", category: "ai", title: "Sentiment Analysis", icon: HiOutlineEmojiHappy, description: "Analyze message sentiment." }),
  stubNode({ type: "aiClassify", category: "ai", title: "AI Classification", icon: HiOutlineChip, description: "Classify intent or urgency." }),

  /* ── Flow ── */
  stubNode({ type: "loop", category: "flow", title: "Loop", icon: HiOutlineRefresh, description: "Repeat a branch until a condition is met." }),
  stubNode({ type: "merge", category: "flow", title: "Merge", icon: HiOutlineShare, description: "Merge parallel branches." }),
  stubNode({ type: "split", category: "flow", title: "Split", icon: HiOutlineDuplicate, description: "Split into parallel paths." }),
  stubNode({ type: "parallel", category: "flow", title: "Parallel", icon: HiOutlineLightningBolt, description: "Run steps in parallel." }),
  {
    type: "end",
    category: "flow",
    title: "End",
    description: "Marks the end of a workflow branch.",
    icon: HiOutlineStop,
    tone: toneForCategory("flow"),
    customPanel: "end",
    defaultData: { label: "End", status: "ready", outcome: "completed" },
    fields: [{ key: "label", label: "Display name", type: "text", required: true }],
  },
  stubNode({ type: "note", category: "flow", title: "Note", icon: HiOutlineCog, description: "Document intent for collaborators.", defaultData: { status: "ready" } }),
  stubNode({ type: "setVariable", category: "flow", title: "Set Variable", icon: HiOutlineVariable, description: "Write a workflow variable.", fields: [{ key: "label", label: "Display name", type: "text", required: true }, { key: "variableName", label: "Variable name", type: "text", required: true }] }),
  stubNode({ type: "getVariable", category: "flow", title: "Get Variable", icon: HiOutlineVariable, description: "Read a workflow variable.", fields: [{ key: "label", label: "Display name", type: "text", required: true }, { key: "variableName", label: "Variable name", type: "text", required: true }] }),
];
