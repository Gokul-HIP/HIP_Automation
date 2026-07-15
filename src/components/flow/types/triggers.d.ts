/**
 * Shared trigger configuration types.
 * Option lists on schemas may later be replaced by Laravel API payloads.
 */

export type NotificationChannel =
  | "push"
  | "whatsapp"
  | "sms"
  | "email"
  | "in_app";

export type ExecutionStatus =
  | "draft"
  | "published"
  | "paused"
  | "archived";

export type SelectOption<T extends string | number = string> = {
  value: T;
  label: string;
};

export type TriggerFieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "boolean"
  | "channels"
  | "template"
  | "retry";

export type TriggerFieldSchema = {
  key?: string;
  type: TriggerFieldType;
  label?: string;
  required?: boolean;
  options?: SelectOption[];
  hint?: string;
  description?: string;
  placeholder?: string;
  dynamic?: boolean;
  min?: number;
  max?: number;
};

export type TriggerSchema = {
  description: string;
  laravelContext?: string[];
  contextCard?: {
    title: string;
    note: string;
    rows: Array<{ label: string; key: string }>;
  };
  sampleContext?: Record<string, string>;
  variableGroups?: Array<{ label: string; variables: string[] }>;
  fields: TriggerFieldSchema[];
  defaults: Record<string, unknown>;
};
