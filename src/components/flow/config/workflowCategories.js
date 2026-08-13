/**
 * Workflow node category registry.
 * Add / reorder categories here — do not hardcode in UI components.
 */
export const WORKFLOW_CATEGORIES = [
  {
    id: "triggers",
    label: "Triggers",
    description: "Start a workflow when a hospital event occurs.",
  },
  {
    id: "conditions",
    label: "Conditions",
    description: "Branch the workflow using patient and clinical rules.",
  },
  {
    id: "wait",
    label: "Wait / Delay",
    description: "Pause the workflow for a duration or schedule.",
  },
  {
    id: "messaging",
    label: "Messaging",
    description: "Send WhatsApp, SMS, email, push, and in-app messages.",
  },
  {
    id: "database",
    label: "Database",
    description: "Create, update, and assign hospital records.",
  },
  {
    id: "integrations",
    label: "Integrations",
    description: "Connect webhooks, APIs, FHIR, ABDM, and payments.",
  },
  {
    id: "ai",
    label: "AI",
    description: "AI chat, voice, intent, RAG, and sentiment.",
  },
  {
    id: "flow",
    label: "Flow",
    description: "Loop, merge, split, parallel paths, and end.",
  },
];

export function getCategoryById(id) {
  return WORKFLOW_CATEGORIES.find((c) => c.id === id) ?? null;
}
