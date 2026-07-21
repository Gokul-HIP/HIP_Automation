import { WORKFLOW_VARIABLE_GROUPS } from "../variables";
import {
  NOTIFICATION_CHANNEL_OPTIONS,
  RECIPIENT_OPTIONS,
  RETRY_INTERVAL_OPTIONS,
  PUSH_PRIORITY_OPTIONS,
  createMessagingDefaults,
} from "./shared";

export { RETRY_INTERVAL_OPTIONS, NOTIFICATION_CHANNEL_OPTIONS };

const MESSAGING_VARS = WORKFLOW_VARIABLE_GROUPS;

function messagingFields({ channelLabel, templateLabel, extras = [] }) {
  return [
    { key: "label", type: "text", label: "Display Name", required: true },
    {
      key: "templateId",
      type: "templateSelect",
      label: templateLabel,
      required: true,
      hint: "Select from Template Manager.",
    },
    { key: "variables", type: "variables", label: "Template Variables" },
    ...extras,
    {
      key: "recipient",
      type: "select",
      label: "Recipient",
      options: RECIPIENT_OPTIONS,
      required: true,
    },
    { key: "retry", type: "retry" },
    {
      key: "fallbackChannel",
      type: "select",
      label: "Fallback Channel",
      options: [{ value: "", label: "None" }, ...NOTIFICATION_CHANNEL_OPTIONS],
    },
  ];
}

export const MESSAGING_SCHEMAS = {
  sendWhatsApp: {
    description: "Send an approved WhatsApp template to the patient or care team.",
    channel: "whatsapp",
    variableGroups: MESSAGING_VARS,
    fields: messagingFields({
      templateLabel: "WhatsApp Template",
      extras: [
        { key: "mediaUrl", type: "text", label: "Media URL", placeholder: "https://…" },
      ],
    }),
    defaults: createMessagingDefaults({
      label: "Send WhatsApp",
      fallbackChannel: "sms",
    }),
  },

  sendSms: {
    description: "Send an SMS using an approved template.",
    channel: "sms",
    variableGroups: MESSAGING_VARS,
    fields: messagingFields({ templateLabel: "SMS Template" }),
    defaults: createMessagingDefaults({ label: "Send SMS" }),
  },

  sendEmail: {
    description: "Send a transactional email with template, subject, and attachments.",
    channel: "email",
    variableGroups: MESSAGING_VARS,
    fields: [
      { key: "label", type: "text", label: "Display Name", required: true },
      {
        key: "templateId",
        type: "templateSelect",
        label: "Email Template",
        required: true,
      },
      { key: "subject", type: "text", label: "Subject", required: true },
      { key: "variables", type: "variables", label: "Template Variables" },
      {
        key: "attachments",
        type: "text",
        label: "Attachments",
        placeholder: "Comma-separated file IDs or URLs",
      },
      {
        key: "recipient",
        type: "select",
        label: "Recipient",
        options: RECIPIENT_OPTIONS,
        required: true,
      },
      { key: "retry", type: "retry" },
      {
        key: "fallbackChannel",
        type: "select",
        label: "Fallback Channel",
        options: [{ value: "", label: "None" }, ...NOTIFICATION_CHANNEL_OPTIONS],
      },
    ],
    defaults: createMessagingDefaults({
      label: "Send Email",
      subject: "",
      attachments: "",
    }),
  },

  sendPush: {
    description: "Deliver a push notification with priority, sound, and badge.",
    channel: "push",
    variableGroups: MESSAGING_VARS,
    fields: [
      { key: "label", type: "text", label: "Display Name", required: true },
      {
        key: "templateId",
        type: "templateSelect",
        label: "Push Template",
        required: true,
      },
      { key: "variables", type: "variables", label: "Template Variables" },
      {
        key: "priority",
        type: "select",
        label: "Priority",
        options: PUSH_PRIORITY_OPTIONS,
      },
      { key: "sound", type: "text", label: "Sound", placeholder: "default" },
      { key: "badge", type: "number", label: "Badge Count", min: 0 },
      {
        key: "recipient",
        type: "select",
        label: "Recipient",
        options: RECIPIENT_OPTIONS,
        required: true,
      },
      { key: "retry", type: "retry" },
    ],
    defaults: createMessagingDefaults({
      label: "Send Push Notification",
      priority: "normal",
      sound: "default",
      badge: 1,
    }),
  },

  // sendInApp: {
  //   description: "Show an in-app notification inside the patient portal.",
  //   channel: "in_app",
  //   variableGroups: MESSAGING_VARS,
  //   fields: messagingFields({ templateLabel: "In-App Template" }),
  //   defaults: createMessagingDefaults({ label: "Send In-App Notification" }),
  // },

  sendTemplate: {
    description: "Send a multi-channel approved template.",
    channel: "multi",
    variableGroups: MESSAGING_VARS,
    fields: [
      { key: "label", type: "text", label: "Display Name", required: true },
      {
        key: "templateId",
        type: "templateSelect",
        label: "Template",
        required: true,
      },
      {
        key: "channel",
        type: "select",
        label: "Primary Channel",
        options: NOTIFICATION_CHANNEL_OPTIONS,
        required: true,
      },
      { key: "variables", type: "variables", label: "Template Variables" },
      {
        key: "recipient",
        type: "select",
        label: "Recipient",
        options: RECIPIENT_OPTIONS,
        required: true,
      },
      { key: "retry", type: "retry" },
    ],
    defaults: createMessagingDefaults({
      label: "Send Template",
      channel: "whatsapp",
    }),
  },

  sendAiChat: {
    description: "Start an AI chat conversation with the patient.",
    channel: "ai_chat",
    variableGroups: MESSAGING_VARS,
    fields: [
      { key: "label", type: "text", label: "Display Name", required: true },
      { key: "prompt", type: "textarea", label: "System Prompt", required: true },
      { key: "variables", type: "variables", label: "Context Variables" },
      {
        key: "recipient",
        type: "select",
        label: "Recipient",
        options: RECIPIENT_OPTIONS,
        required: true,
      },
    ],
    defaults: createMessagingDefaults({
      label: "Send AI Chat",
      prompt: "You are a helpful hospital care assistant.",
    }),
  },

  sendAiVoice: {
    description: "Place an AI voice call to the patient.",
    channel: "ai_voice",
    variableGroups: MESSAGING_VARS,
    fields: messagingFields({
      templateLabel: "Voice Script Template",
      extras: [{ key: "voiceId", type: "text", label: "Voice ID" }],
    }),
    defaults: createMessagingDefaults({ label: "Send AI Voice Call" }),
  },

  sendIvr: {
    description: "Send an IVR call with a voice template.",
    channel: "ivr",
    variableGroups: MESSAGING_VARS,
    fields: messagingFields({ templateLabel: "IVR Template" }),
    defaults: createMessagingDefaults({ label: "Send IVR" }),
  },
};

export function getMessagingSchema(type) {
  return MESSAGING_SCHEMAS[type] ?? null;
}

export function buildMessagingDefaults(type) {
  const schema = getMessagingSchema(type);
  if (!schema) return null;
  return structuredClone(schema.defaults);
}
