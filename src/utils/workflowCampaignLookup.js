/**
 * Helpers to find existing workflows by campaign key / stable name
 * before creating a duplicate campaign record.
 */

export const FIRST_APPOINTMENT_NURTURING_NAME = "First Appointment Nurturing";
export const FIRST_APPOINTMENT_NURTURING_CAMPAIGN_KEY =
  "first_appointment_nurturing";

export const MEDICINE_REMINDER_NAME = "Medicine Reminder";
export const MEDICINE_REMINDER_CAMPAIGN_KEY = "medicine_reminder";

/** Legacy display name typo still present on some hospital records. */
export const MEDICINE_REMINDER_NAME_ALIASES = [
  MEDICINE_REMINDER_NAME,
  "Medicine Remainder",
];

export const DIGITAL_PRESCRIPTION_DELIVERY_NAME = "Digital Prescription Delivery";
export const DIGITAL_PRESCRIPTION_CAMPAIGN_KEY = "digital_prescription";

/** Fixture / alternate display names for the same campaign. */
export const DIGITAL_PRESCRIPTION_NAME_ALIASES = [
  DIGITAL_PRESCRIPTION_DELIVERY_NAME,
  "Digital Prescription Share",
  "Digital Prescription",
];

export const POST_VISIT_FOLLOWUP_NAME = "Post-Visit Follow-up";
export const POST_VISIT_FOLLOWUP_CAMPAIGN_KEY = "post_visit_followup";

/** Fixture / alternate display names for the same campaign. */
export const POST_VISIT_FOLLOWUP_NAME_ALIASES = [
  POST_VISIT_FOLLOWUP_NAME,
  "Post Visit Follow-up",
  "Post-Visit Followup",
  "Post Visit Followup",
];

/**
 * Campaign key alias groups (snake_case / camelCase / collapsed forms).
 * @type {string[][]}
 */
const CAMPAIGN_KEY_ALIAS_GROUPS = [
  ["first_appointment_nurturing", "firstappointmentnurturing"],
  ["medicine_reminder", "medicinereminder"],
  [
    "digital_prescription",
    "digitalprescription",
    "digital_prescription_delivery",
    "digitalprescriptiondelivery",
  ],
  [
    "post_visit_followup",
    "postvisitfollowup",
    "post_visit_follow_up",
    "postvisitfollow_up",
  ],
];

/**
 * @param {unknown} value
 * @returns {string}
 */
function normalizeKey(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

/**
 * Read campaignKey from a list row or full workflow payload.
 * @param {Record<string, unknown> | null | undefined} workflow
 * @returns {string}
 */
export function readWorkflowCampaignKey(workflow) {
  if (!workflow || typeof workflow !== "object") return "";
  const config =
    workflow.configuration ??
    workflow.config ??
    workflow.data?.configuration ??
    {};
  const raw =
    config.campaignKey ??
    config.campaign_key ??
    workflow.campaignKey ??
    workflow.campaign_key ??
    "";
  return String(raw).trim();
}

/**
 * Whether two campaign key strings refer to the same campaign.
 * Accepts camelCase or snake_case variants for known campaigns.
 * @param {string} a
 * @param {string} b
 */
export function campaignKeysMatch(a, b) {
  const na = normalizeKey(a);
  const nb = normalizeKey(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  for (const group of CAMPAIGN_KEY_ALIAS_GROUPS) {
    const set = new Set(group);
    if (set.has(na) && set.has(nb)) return true;
  }
  return false;
}

/**
 * Normalize a workflow display name for duplicate matching.
 * @param {unknown} value
 */
function normalizeWorkflowName(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/**
 * Whether two display names refer to the same campaign workflow.
 * Treats "Medicine Remainder" as an alias of "Medicine Reminder".
 * @param {string} a
 * @param {string} b
 */
export function workflowNamesMatch(a, b) {
  const na = normalizeWorkflowName(a);
  const nb = normalizeWorkflowName(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  const medicineNames = new Set(
    MEDICINE_REMINDER_NAME_ALIASES.map((n) => normalizeWorkflowName(n))
  );
  if (medicineNames.has(na) && medicineNames.has(nb)) return true;
  const digitalNames = new Set(
    DIGITAL_PRESCRIPTION_NAME_ALIASES.map((n) => normalizeWorkflowName(n))
  );
  if (digitalNames.has(na) && digitalNames.has(nb)) return true;
  const postVisitNames = new Set(
    POST_VISIT_FOLLOWUP_NAME_ALIASES.map((n) => normalizeWorkflowName(n))
  );
  return postVisitNames.has(na) && postVisitNames.has(nb);
}

/**
 * Find an existing workflow that should be updated instead of duplicated.
 * Prefers campaignKey match; falls back to exact display name.
 *
 * @param {Array<Record<string, unknown>>} items — list rows and/or detail payloads
 * @param {object} [opts]
 * @param {string} [opts.campaignKey]
 * @param {string} [opts.name]
 * @param {string|number|null} [opts.excludeId] — current workflow id when updating
 * @returns {Record<string, unknown> | null}
 */
export function findExistingCampaignWorkflow(
  items = [],
  {
    campaignKey = FIRST_APPOINTMENT_NURTURING_CAMPAIGN_KEY,
    name = FIRST_APPOINTMENT_NURTURING_NAME,
    excludeId = null,
  } = {}
) {
  const exclude = excludeId != null ? String(excludeId) : null;
  const list = Array.isArray(items) ? items : [];

  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    if (exclude != null && String(item.id) === exclude) continue;

    const key = readWorkflowCampaignKey(item);
    if (key && campaignKeysMatch(key, campaignKey)) {
      return item;
    }
  }

  const targetName = String(name || "").trim();
  if (!targetName) return null;

  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    if (exclude != null && String(item.id) === exclude) continue;
    if (workflowNamesMatch(item.name, targetName)) {
      return item;
    }
  }

  return null;
}
