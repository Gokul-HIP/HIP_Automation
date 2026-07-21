/**
 * Shared options for hospital workflow Trigger nodes.
 * Triggers configure WHEN a workflow starts — never delivery channels.
 */

/** @typedef {{ value: string | number, label: string }} SelectOption */

/** @type {SelectOption[]} */
export const EXECUTION_STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "paused", label: "Paused" },
  { value: "archived", label: "Archived" },
];

/** @type {SelectOption[]} */
export const AI_PROVIDER_OPTIONS = [
  { value: "openai", label: "OpenAI" },
  { value: "azure_openai", label: "Azure OpenAI" },
  { value: "google", label: "Google Gemini" },
  { value: "anthropic", label: "Anthropic" },
  { value: "custom", label: "Custom / Hospital Model" },
];

/**
 * Event-only baseline for trigger nodes.
 * @param {object} overrides
 */
export function createBaseTriggerDefaults(overrides = {}) {
  return {
    label: "Trigger",
    status: "draft",
    ...overrides,
  };
}

/**
 * @param {string} template
 * @param {Record<string, string | number>} [context]
 */
export function renderTemplate(template, context = {}) {
  if (!template) return "";
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = context[key];
    return value == null || value === "" ? match : String(value);
  });
}
