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

/** Shared fields for campaign-aware messaging nodes. */
const RECIPIENT_FIELD = {
  key: "recipient",
  type: "select",
  label: "Recipient",
  options: RECIPIENT_OPTIONS,
  required: true,
};

const CAMPAIGN_STEP_FIELD = {
  key: "campaignStep",
  type: "text",
  label: "Campaign Step",
  placeholder: "e.g. nurture_1",
  required: false,
  hint: "Stable step id for idempotency (not the message body).",
};

const CUSTOM_RECIPIENT_FIELD = {
  key: "customRecipient",
  type: "text",
  label: "Custom Recipient",
  placeholder: "Phone, email, or expression",
  required: false,
  showWhen: { recipient: "custom" },
};

export const MESSAGING_SCHEMAS = {
  sendWhatsApp: {
    description:
      "Send a WhatsApp message. Select an approved template, or enter the message manually.",
    channel: "whatsapp",
    variableGroups: MESSAGING_VARS,
    fields: [
      { key: "label", type: "text", label: "Display Name", required: true },
      {
        key: "templateId",
        type: "templateSelect",
        label: "Template",
        required: false,
      },
      RECIPIENT_FIELD,
      CUSTOM_RECIPIENT_FIELD,
      {
        key: "message",
        type: "textarea",
        label: "Message",
        placeholder: "Template message body",
        required: false,
      },
      {
        key: "buttons",
        type: "textarea",
        label: "Buttons",
        placeholder: "Optional WhatsApp quick-reply / CTA buttons",
        hint: "Leave blank if the template has no buttons.",
      },
      CAMPAIGN_STEP_FIELD,
    ],
    defaults: createMessagingDefaults({
      label: "Send WhatsApp",
      message: "",
      buttons: "",
      fallbackChannel: "sms",
      campaignStep: "",
    }),
  },

  sendSms: {
    description:
      "Send an SMS. Select an approved template, or enter the message manually.",
    channel: "sms",
    variableGroups: MESSAGING_VARS,
    fields: [
      { key: "label", type: "text", label: "Display Name", required: true },
      {
        key: "templateId",
        type: "templateSelect",
        label: "Template",
        required: false,
      },
      RECIPIENT_FIELD,
      CUSTOM_RECIPIENT_FIELD,
      {
        key: "message",
        type: "textarea",
        label: "Message",
        placeholder: "SMS message body",
        required: false,
      },
      CAMPAIGN_STEP_FIELD,
    ],
    defaults: createMessagingDefaults({
      label: "Send SMS",
      message: "",
      campaignStep: "",
    }),
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
      RECIPIENT_FIELD,
      CUSTOM_RECIPIENT_FIELD,
      { key: "subject", type: "text", label: "Subject", required: false },
      {
        key: "body",
        type: "textarea",
        label: "Body",
        placeholder: "Email body",
        required: false,
      },
      CAMPAIGN_STEP_FIELD,
    ],
    defaults: createMessagingDefaults({
      label: "Send Email",
      subject: "",
      body: "",
      campaignStep: "",
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
      RECIPIENT_FIELD,
      CUSTOM_RECIPIENT_FIELD,
      { key: "title", type: "text", label: "Title", required: false },
      { key: "body", type: "textarea", label: "Body", required: false },
      {
        key: "priority",
        type: "select",
        label: "Priority",
        options: PUSH_PRIORITY_OPTIONS,
      },
      CAMPAIGN_STEP_FIELD,
    ],
    defaults: createMessagingDefaults({
      label: "Send Push Notification",
      title: "",
      body: "",
      priority: "normal",
      campaignStep: "",
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
    description:
      "Start an AI chat conversation. Select a template, or enter a prompt manually.",
    channel: "ai",
    variableGroups: MESSAGING_VARS,
    fields: [
      { key: "label", type: "text", label: "Display Name", required: true },
      {
        key: "templateId",
        type: "templateSelect",
        label: "Template",
        required: false,
      },
      { key: "prompt", type: "textarea", label: "Prompt", required: false },
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
        key: "voiceProvider",
        type: "select",
        label: "Voice Provider",
        options: [
          { value: "default", label: "Default Hospital Voice" },
          { value: "openai", label: "OpenAI" },
          { value: "azure", label: "Azure" },
          { value: "custom", label: "Custom" },
        ],
        required: true,
      },
      {
        key: "templateId",
        type: "templateSelect",
        label: "Template",
        required: false,
      },
      {
        key: "prompt",
        type: "textarea",
        label: "Prompt",
        placeholder: "Spoken script or AI prompt…",
        required: false,
      },
      {
        key: "language",
        type: "select",
        label: "Language",
        options: [
          { value: "en", label: "English" },
          { value: "hi", label: "Hindi" },
          { value: "ta", label: "Tamil" },
          { value: "te", label: "Telugu" },
          { value: "ar", label: "Arabic" },
        ],
      },
      {
        key: "voice",
        type: "text",
        label: "Voice",
        placeholder: "e.g. alloy, nova",
      },
      {
        key: "gender",
        type: "select",
        label: "Gender",
        options: [
          { value: "neutral", label: "Neutral" },
          { value: "female", label: "Female" },
          { value: "male", label: "Male" },
        ],
      },
      {
        key: "retryCount",
        type: "number",
        label: "Retry Count",
        min: 0,
        max: 5,
      },
    ],
    defaults: createMessagingDefaults({
      label: "Send AI Voice Call",
      voiceProvider: "default",
      prompt: "",
      language: "en",
      voice: "",
      gender: "neutral",
      retryCount: 1,
    }),
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
