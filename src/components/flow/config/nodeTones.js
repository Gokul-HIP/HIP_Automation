/**
 * Category → visual tone mapping for workflow nodes.
 * Trigger=green, Condition=orange, Messaging=blue, Database=purple,
 * Integration=cyan, AI=pink, Delay=yellow, End=red
 */
export const CATEGORY_TONES = {
  triggers: "success",
  conditions: "warning",
  wait: "warning",
  messaging: "primary",
  database: "purple",
  integrations: "cyan",
  ai: "pink",
  flow: "danger",
};

export function toneForCategory(categoryId) {
  return CATEGORY_TONES[categoryId] ?? "primary";
}
