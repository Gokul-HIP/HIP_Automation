/**
 * Workflow node category registry.
 * Add / reorder categories here — do not hardcode in UI components.
 */
export const WORKFLOW_CATEGORIES = [
  {
    id: "triggers",
    label: "Triggers",
    description: "Start a hospital workflow from a clinical or ops event.",
  },
  {
    id: "logic",
    label: "Logic",
    description: "Branch, wait, and control flow.",
  },
  {
    id: "messaging",
    label: "Messaging",
    description: "Notify patients and care teams.",
  },
  {
    id: "ai",
    label: "AI",
    description: "Assist with classification and triage.",
  },
  {
    id: "variables",
    label: "Variables",
    description: "Read and write workflow data.",
  },
  {
    id: "database",
    label: "Database",
    description: "Query and update hospital records.",
  },
  {
    id: "http",
    label: "HTTP",
    description: "Call external APIs and webhooks.",
  },
  {
    id: "utilities",
    label: "Utilities",
    description: "Helpers for scheduling and transforms.",
  },
];

export function getCategoryById(id) {
  return WORKFLOW_CATEGORIES.find((c) => c.id === id) ?? null;
}
