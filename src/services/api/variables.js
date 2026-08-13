import { apiClient, unwrapData } from "./client";
import {
  ensureCoreVariableGroups,
  normalizeVariableEntries,
  toInsertToken,
} from "@/utils/workflowVariableTokens";

/**
 * @param {unknown} value
 * @deprecated Prefer normalizeVariableEntries — kept for simple token wrapping.
 */
export function normalizeToken(value) {
  if (value == null) return "";
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return "";
    return toInsertToken(trimmed.replace(/^\{+|\}+$/g, ""));
  }
  if (typeof value === "object") {
    return normalizeToken(
      value.token ?? value.key ?? value.name ?? value.variable ?? value.value
    );
  }
  return normalizeToken(String(value));
}

/**
 * @param {unknown} group
 */
function normalizeGroup(group) {
  if (!group || typeof group !== "object") {
    return { label: "Variables", variables: [] };
  }

  const label = String(
    group.label ?? group.name ?? group.category ?? group.group ?? "Variables"
  );

  const rawVars =
    group.variables ??
    group.items ??
    group.tokens ??
    group.fields ??
    group.keys ??
    [];

  const list = Array.isArray(rawVars)
    ? rawVars
    : typeof rawVars === "object"
      ? Object.entries(rawVars).map(([key, value]) =>
          typeof value === "object" && value
            ? { key, ...value }
            : { key, label: key, token: value }
        )
      : [];

  const { entries, dropped } = normalizeVariableEntries(list);

  if (dropped.length && typeof console !== "undefined") {
    console.warn(
      `[workflow variables] Dropped unsupported tokens in group "${label}":`,
      dropped
    );
  }

  return {
    label,
    variables: entries,
  };
}

/**
 * Normalize variable catalog from Laravel Builder Connect API.
 * Each variable is `{ label, token, key }` — UI shows label, insert uses token.
 * Always restores core groups (including Appointment) on the frontend.
 * @param {unknown} response
 * @returns {import('@/types/builder-api').ApiVariableGroup[]}
 */
export function normalizeVariableGroups(response) {
  const raw = unwrapData(response);
  let groups = [];

  if (Array.isArray(raw)) {
    if (
      raw.length &&
      (typeof raw[0] === "string" ||
        raw[0]?.token ||
        raw[0]?.key ||
        raw[0]?.name)
    ) {
      const { entries, dropped } = normalizeVariableEntries(raw);
      if (dropped.length && typeof console !== "undefined") {
        console.warn(
          "[workflow variables] Dropped unsupported tokens:",
          dropped
        );
      }
      groups = entries.length
        ? [{ label: "Variables", variables: entries }]
        : [];
    } else {
      groups = raw.map(normalizeGroup).filter((g) => g.variables.length > 0);
    }
  } else if (raw && typeof raw === "object") {
    if (Array.isArray(raw.groups)) {
      groups = raw.groups
        .map(normalizeGroup)
        .filter((g) => g.variables.length > 0);
    } else if (Array.isArray(raw.variables)) {
      const first = raw.variables[0];
      if (
        first &&
        typeof first === "object" &&
        (first.variables || first.items)
      ) {
        groups = raw.variables
          .map(normalizeGroup)
          .filter((g) => g.variables.length > 0);
      } else {
        const { entries, dropped } = normalizeVariableEntries(raw.variables);
        if (dropped.length && typeof console !== "undefined") {
          console.warn(
            "[workflow variables] Dropped unsupported tokens:",
            dropped
          );
        }
        groups = entries.length
          ? [
              {
                label: String(raw.label ?? "Variables"),
                variables: entries,
              },
            ]
          : [];
      }
    } else {
      // Object map: { Patient: ["patient", ...], Doctor: [...] }
      groups = Object.entries(raw)
        .map(([label, variables]) => normalizeGroup({ label, variables }))
        .filter((g) => g.variables.length > 0);
    }
  }

  return ensureCoreVariableGroups(groups);
}

/**
 * @param {string | null | undefined} triggerKey
 */
export async function fetchVariables(triggerKey = null) {
  const params = {};
  if (triggerKey) params.trigger = triggerKey;
  const response = await apiClient.get("/workflow/variables", { params });
  return normalizeVariableGroups(response.data);
}
