import { WORKFLOW_VARIABLE_GROUPS } from "../variables";
import {
  NOTIFICATION_CHANNEL_OPTIONS,
  RECIPIENT_OPTIONS,
  RETRY_INTERVAL_OPTIONS,
  PUSH_PRIORITY_OPTIONS,
  createMessagingDefaults,
} from "./shared";

export {
  RETRY_INTERVAL_OPTIONS,
  NOTIFICATION_CHANNEL_OPTIONS,
  TEMPLATE_CHANNEL_BY_NODE,
  getTemplateChannelForNode,
} from "./shared";

const MESSAGING_VARS = WORKFLOW_VARIABLE_GROUPS;

export const MESSAGING_SCHEMAS = {
  sendWhatsApp: {
    description: "Send an approved WhatsApp template to the patient or care team.",
    channel: "whatsapp",
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
        key: "message",
        type: "textarea",
        label: "Message",
        placeholder: "Template message body",
        required: true,
      },
      {
        key: "buttons",
        type: "textarea",
        label: "Buttons",
        placeholder: "Optional WhatsApp quick-reply / CTA buttons",
        hint: "Leave blank if the template has no buttons.",
      },
    ],
    defaults: createMessagingDefaults({
      label: "Send WhatsApp",
      message: "",
      buttons: "",
      fallbackChannel: "sms",
    }),
  },

  sendSms: {
    description: "Send an SMS using an approved template.",
    channel: "sms",
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
        key: "message",
        type: "textarea",
        label: "Message",
        placeholder: "SMS message body",
        required: true,
      },
    ],
    defaults: createMessagingDefaults({ label: "Send SMS", message: "" }),
  },

  sendEmail: {
    description:
      "Send a transactional email. Select a template, or enter subject and body manually.",
    channel: "email",
    variableGroups: MESSAGING_VARS,
    fields: [
      { key: "label", type: "text", label: "Display Name", required: true },
      {
        key: "templateId",
        type: "templateSelect",
        label: "Template",
        required: false,
      },
      { key: "subject", type: "text", label: "Subject", required: false },
      {
        key: "body",
        type: "textarea",
        label: "Body",
        placeholder: "Email body",
        required: false,
      },
    ],
    defaults: createMessagingDefaults({
      label: "Send Email",
      subject: "",
      body: "",
    }),
  },

  sendPush: {
    description:
      "Deliver a push notification. Select a template, or enter title and body manually.",
    channel: "push",
    variableGroups: MESSAGING_VARS,
    fields: [
      { key: "label", type: "text", label: "Display Name", required: true },
      {
        key: "templateId",
        type: "templateSelect",
        label: "Template",
        required: false,
      },
      { key: "title", type: "text", label: "Title", required: false },
      { key: "body", type: "textarea", label: "Body", required: false },
      {
        key: "priority",
        type: "select",
        label: "Priority",
        options: PUSH_PRIORITY_OPTIONS,
      },
    ],
    defaults: createMessagingDefaults({
      label: "Send Push Notification",
      title: "",
      body: "",
      priority: "normal",
    }),
  },

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
      {
        key: "recipient",
        type: "select",
        label: "Recipient",
        options: RECIPIENT_OPTIONS,
        required: true,
      },
    ],
    defaults: createMessagingDefaults({
      label: "Send Template",
      channel: "whatsapp",
    }),
  },

  sendAiChat: {
    description: "Start an AI chat conversation with the patient.",
    channel: "ai",
    variableGroups: MESSAGING_VARS,
    fields: [
      { key: "label", type: "text", label: "Display Name", required: true },
      {
        key: "templateId",
        type: "templateSelect",
        label: "Template",
        required: true,
      },
      { key: "prompt", type: "textarea", label: "Prompt", required: true },
      {
        key: "temperature",
        type: "number",
        label: "Temperature",
        min: 0,
        max: 2,
      },
    ],
    defaults: createMessagingDefaults({
      label: "Send AI Chat",
      prompt: "You are a helpful hospital care assistant.",
      temperature: 0.7,
    }),
  },

  sendAiVoice: {
    description: "Place an AI voice call to the patient.",
    channel: "voice",
    variableGroups: MESSAGING_VARS,
    fields: [
      { key: "label", type: "text", label: "Display Name", required: true },
      {
        key: "templateId",
        type: "templateSelect",
        label: "Template",
        required: true,
      },
      { key: "prompt", type: "textarea", label: "Prompt" },
    ],
    defaults: createMessagingDefaults({ label: "Send AI Voice Call", prompt: "" }),
  },

  sendIvr: {
    description: "Send an IVR call with a voice template.",
    channel: "ivr",
    variableGroups: MESSAGING_VARS,
    fields: [
      { key: "label", type: "text", label: "Display Name", required: true },
      {
        key: "templateId",
        type: "templateSelect",
        label: "Template",
        required: true,
      },
    ],
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
