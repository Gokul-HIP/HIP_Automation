import { apiClient, unwrapData } from "./client";

/**
 * Normalize trigger catalog from API into grouped structure.
 * @param {unknown} response
 */
export function normalizeTriggerCatalog(response) {
  const raw = unwrapData(response);
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.triggers)
      ? raw.triggers
      : Array.isArray(raw?.data)
        ? raw.data
        : [];

  /** @type {Map<string, import('@/types/builder-api').ApiTrigger[]>} */
  const groups = new Map();

  for (const item of list) {
    const trigger = normalizeTrigger(item);
    const group = trigger.group || "General";
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(trigger);
  }

  return {
    triggers: list.map(normalizeTrigger),
    groups: [...groups.entries()].map(([group, triggers]) => ({
      group,
      triggers,
    })),
    raw: response,
  };
}

/**
 * @param {Record<string, unknown>} item
 */
export function normalizeTrigger(item) {
  const key = String(item.key ?? item.type ?? item.id ?? item.slug ?? "");
  return {
    key,
    name: String(item.name ?? item.title ?? item.label ?? key),
    description: String(item.description ?? ""),
    group: String(item.group ?? item.category ?? item.module ?? "General"),
    module: item.module ?? null,
    icon: item.icon ?? null,
    schema: normalizeTriggerSchema(item.schema ?? item.fields ?? item),
    defaults: item.defaults ?? item.default_values ?? {},
  };
}

function normalizeTriggerSchema(schema) {
  if (Array.isArray(schema)) {
    return { fields: schema.map(normalizeField) };
  }
  if (schema?.fields && Array.isArray(schema.fields)) {
    return {
      description: schema.description ?? "",
      fields: schema.fields.map(normalizeField),
    };
  }
  if (schema?.properties && typeof schema.properties === "object") {
    return {
      description: schema.description ?? "",
      fields: Object.entries(schema.properties).map(([key, def]) =>
        normalizeField({ key, ...(typeof def === "object" ? def : { type: "text" }) })
      ),
    };
  }
  return { fields: [] };
}

function normalizeField(field) {
  return {
    key: String(field.key ?? field.name ?? ""),
    type: String(field.type ?? "text"),
    label: String(field.label ?? field.title ?? field.key ?? ""),
    required: Boolean(field.required),
    hint: field.hint ?? field.description ?? null,
    placeholder: field.placeholder ?? null,
    options: Array.isArray(field.options) ? field.options : [],
    min: field.min ?? null,
    max: field.max ?? null,
    showWhen: field.show_when ?? field.showWhen ?? null,
  };
}

export async function fetchTriggers() {
  const response = await apiClient.get("/workflow/triggers");
  return normalizeTriggerCatalog(response.data);
}

export function findTriggerSchema(triggers, key) {
  return triggers.find((t) => t.key === key) ?? null;
}
