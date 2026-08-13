/** Builder Connect API types (Laravel). */

export type ApiFieldOption = {
  value: string | number;
  label: string;
};

export type ApiSchemaField = {
  key: string;
  type: string;
  label: string;
  required?: boolean;
  hint?: string | null;
  placeholder?: string | null;
  options?: ApiFieldOption[];
  min?: number | null;
  max?: number | null;
  showWhen?: Record<string, unknown> | null;
};

export type ApiTriggerSchema = {
  description?: string;
  fields: ApiSchemaField[];
};

export type ApiTrigger = {
  key: string;
  name: string;
  description: string;
  group: string;
  module?: string | null;
  icon?: string | null;
  schema: ApiTriggerSchema;
  defaults?: Record<string, unknown>;
};

export type ApiTriggerGroup = {
  group: string;
  triggers: ApiTrigger[];
};

export type ApiTriggerCatalog = {
  triggers: ApiTrigger[];
  groups: ApiTriggerGroup[];
  raw?: unknown;
};

export type ApiVariableEntry = {
  key: string;
  label: string;
  /** Inserted placeholder, e.g. "{{patient_name}}" */
  token: string;
};

export type ApiVariableGroup = {
  label: string;
  variables: ApiVariableEntry[];
};

export type ApiTemplate = {
  id: string;
  name: string;
  channel: string;
  description: string;
  subject?: string | null;
  body?: string | null;
  status?: string;
};

export type ApiWorkflowListItem = {
  id: string | number;
  name: string;
  module?: string | null;
  trigger?: string | null;
  status: string;
  updatedAt?: string | null;
  createdAt?: string | null;
};

export type ApiExecutionRow = {
  id: string | number;
  workflowId: string | number | null;
  workflowName: string;
  trigger: string;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  durationMs: number | null;
};

export type PublishResult = {
  message?: string;
  version?: string | number | null;
  warnings?: string[];
  errors?: string[];
  data?: Record<string, unknown>;
};
