/**
 * Canonical workflow variable tokens for Laravel VariableResolver.
 *
 * Display labels stay user-friendly; only the inserted placeholder changes.
 * Existing saved workflows are never rewritten — this affects new insertions only.
 */

/** @type {Record<string, string>} */
export const VARIABLE_DISPLAY_LABELS = {
  patient_name: "Patient",
  doctor_name: "Doctor",
  hospital_name: "Hospital",
  appointment_date: "Appointment Date",
  appointment_time: "Appointment Time",
  appointment_id: "Appointment ID",
  reminder_time: "Reminder Time",
  old_date: "Old Date",
  new_date: "New Date",
  old_time: "Old Time",
  new_time: "New Time",
  patient_mobile: "Patient Mobile",
  invoice_amount: "Invoice Amount",
  payment_status: "Payment Status",
  patient_email: "Patient Email",
  patient_age: "Patient Age",
  patient_gender: "Patient Gender",
  department: "Department",
  branch_name: "Branch",
  prescription_id: "Prescription ID",
  pharmacy_link: "Pharmacy Link",
  medicine_name: "Medicine",
  dosage: "Dosage",
  frequency: "Frequency",
  time: "Time",
  date: "Date",
  hospital_phone: "Hospital Phone",
  workflow_id: "Workflow ID",
  triggered_at: "Triggered At",
};

/**
 * Alias / legacy keys → backend VariableResolver key.
 * Bare object names (patient, doctor, hospital) map to *_name fields.
 * @type {Record<string, string | null>}
 */
export const VARIABLE_INSERT_ALIASES = {
  // Required mappings
  patient: "patient_name",
  Patient: "patient_name",
  PatientName: "patient_name",
  patient_name: "patient_name",

  doctor: "doctor_name",
  Doctor: "doctor_name",
  DoctorName: "doctor_name",
  doctor_name: "doctor_name",

  hospital: "hospital_name",
  Hospital: "hospital_name",
  HospitalName: "hospital_name",
  hospital_name: "hospital_name",

  "appointment date": "appointment_date",
  AppointmentDate: "appointment_date",
  appointment_date: "appointment_date",

  "appointment time": "appointment_time",
  AppointmentTime: "appointment_time",
  appointment_time: "appointment_time",

  "appointment id": "appointment_id",
  AppointmentId: "appointment_id",
  AppointmentID: "appointment_id",
  appointment_id: "appointment_id",

  // Bare {{appointment}} expands to date/time/id in normalizeVariableEntries.
  appointment: null,
  Appointment: null,

  reminder_time: "reminder_time",
  ReminderTime: "reminder_time",
  old_date: "old_date",
  new_date: "new_date",
  old_time: "old_time",
  new_time: "new_time",
  OldDate: "old_date",
  NewDate: "new_date",
  OldTime: "old_time",
  NewTime: "new_time",

  "patient mobile": "patient_mobile",
  PatientMobile: "patient_mobile",
  patient_mobile: "patient_mobile",

  "invoice amount": "invoice_amount",
  InvoiceAmount: "invoice_amount",
  invoice_amount: "invoice_amount",

  "payment status": "payment_status",
  PaymentStatus: "payment_status",
  payment_status: "payment_status",

  // Additional known backend-compatible keys
  patient_email: "patient_email",
  PatientEmail: "patient_email",
  patient_age: "patient_age",
  PatientAge: "patient_age",
  patient_gender: "patient_gender",
  PatientGender: "patient_gender",
  department: "department",
  Department: "department",
  branch_name: "branch_name",
  BranchName: "branch_name",
  prescription_id: "prescription_id",
  PrescriptionId: "prescription_id",
  pharmacy_link: "pharmacy_link",
  PharmacyLink: "pharmacy_link",
  medicine_name: "medicine_name",
  MedicineName: "medicine_name",
  Medicine: "medicine_name",
  medicine: "medicine_name",
  dosage: "dosage",
  Dosage: "dosage",
  frequency: "frequency",
  Frequency: "frequency",
  time: "time",
  Time: "time",
  date: "date",
  Date: "date",
  hospital_phone: "hospital_phone",
  HospitalPhone: "hospital_phone",
  workflow_id: "workflow_id",
  WorkflowId: "workflow_id",
  triggered_at: "triggered_at",
  TriggeredAt: "triggered_at",

  // Unsupported in Laravel VariableResolver — remove from picker
  "flow.variable": null,
  flow: null,
};

/**
 * Bare object aliases that expand into multiple backend keys.
 * @type {Record<string, string[]>}
 */
export const VARIABLE_EXPAND_ALIASES = {
  appointment: ["appointment_date", "appointment_time", "appointment_id"],
  Appointment: ["appointment_date", "appointment_time", "appointment_id"],
};

/**
 * Core picker groups that must remain available in the UI.
 * Labels stay user-friendly; tokens match Laravel VariableResolver.
 */
export const CORE_VARIABLE_GROUPS = [
  {
    label: "Patient",
    keys: ["patient_name", "patient_mobile"],
  },
  {
    label: "Doctor",
    keys: ["doctor_name"],
  },
  {
    label: "Hospital",
    keys: ["hospital_name"],
  },
  {
    label: "Appointment",
    keys: ["appointment_date", "appointment_time", "appointment_id"],
  },
  {
    label: "System",
    keys: ["workflow_id", "triggered_at"],
  },
];

/** Allowlist of keys the Laravel VariableResolver is expected to resolve. */
export const BACKEND_VARIABLE_KEYS = new Set(
  Object.values(VARIABLE_INSERT_ALIASES).filter(Boolean)
);

/**
 * @param {unknown} value
 * @returns {string}
 */
export function extractVariableKey(value) {
  if (value == null) return "";
  let raw = "";
  if (typeof value === "string") {
    raw = value.trim();
  } else if (typeof value === "object") {
    raw = String(
      value.token ??
        value.key ??
        value.name ??
        value.variable ??
        value.value ??
        value.label ??
        ""
    ).trim();
  } else {
    raw = String(value).trim();
  }

  if (!raw) return "";
  // Strip any leading/trailing brace noise, including malformed {{key}
  return raw.replace(/^\{+\s*|\s*\}+$/g, "").trim();
}

/**
 * Build a Laravel-safe placeholder: {{variable_name}}
 * Uses concatenation — template literals like `{{${key}}}` emit only one `}`.
 * @param {string} key
 * @returns {string}
 */
export function toInsertToken(key) {
  const clean = extractVariableKey(key);
  if (!clean) return "";
  return "{{" + clean + "}}";
}

/**
 * Guarantee a token is exactly {{snake_case_key}} with both closing braces.
 * Maps aliases (doctor → doctor_name). Returns "" for unsupported keys.
 * @param {unknown} token
 * @returns {string}
 */
export function ensureValidPlaceholder(token) {
  const extracted = extractVariableKey(token);
  if (!extracted) return "";

  const aliasHit =
    VARIABLE_INSERT_ALIASES[extracted] !== undefined
      ? VARIABLE_INSERT_ALIASES[extracted]
      : VARIABLE_INSERT_ALIASES[extracted.toLowerCase()];

  if (aliasHit === null) {
    return "";
  }

  const resolved = resolveVariableForInsert(token);
  if (resolved?.token) return resolved.token;

  // Fallback: already snake_case backend-style key
  if (/^[a-z][a-z0-9_]*$/.test(extracted) && extracted.includes("_")) {
    return "{{" + extracted + "}}";
  }

  return "";
}

/**
 * Resolve a UI / API variable into a backend-safe insert token + display label.
 * Returns null when the variable has no Laravel VariableResolver equivalent.
 *
 * @param {unknown} raw
 * @param {{ label?: string } | null} [hint]
 * @returns {{ label: string, token: string, key: string } | null}
 */
export function resolveVariableForInsert(raw, hint = null) {
  const extracted = extractVariableKey(raw);
  if (!extracted) return null;

  const aliasKey =
    VARIABLE_INSERT_ALIASES[extracted] !== undefined
      ? extracted
      : VARIABLE_INSERT_ALIASES[extracted.toLowerCase()] !== undefined
        ? extracted.toLowerCase()
        : extracted;

  let backendKey;
  if (Object.prototype.hasOwnProperty.call(VARIABLE_INSERT_ALIASES, aliasKey)) {
    backendKey = VARIABLE_INSERT_ALIASES[aliasKey];
  } else if (
    Object.prototype.hasOwnProperty.call(
      VARIABLE_INSERT_ALIASES,
      extracted.toLowerCase()
    )
  ) {
    backendKey = VARIABLE_INSERT_ALIASES[extracted.toLowerCase()];
  } else if (/^[a-z][a-z0-9_]*$/.test(extracted) && extracted.includes("_")) {
    // Already snake_case — keep if it looks like a resolver key.
    backendKey = extracted;
  } else {
    backendKey = null;
  }

  if (!backendKey) {
    return null;
  }

  const hintLabel =
    typeof raw === "object" && raw
      ? String(raw.label ?? raw.title ?? raw.displayName ?? "").trim()
      : "";
  const label =
    hintLabel ||
    hint?.label ||
    VARIABLE_DISPLAY_LABELS[backendKey] ||
    humanizeVariableKey(backendKey);

  return {
    key: backendKey,
    label,
    token: toInsertToken(backendKey),
  };
}

/**
 * @param {string} key
 */
export function humanizeVariableKey(key) {
  return String(key)
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/**
 * @param {string} key
 * @param {string} [label]
 * @returns {{ label: string, token: string, key: string }}
 */
export function makeVariableEntry(key, label) {
  return {
    key,
    label: label || VARIABLE_DISPLAY_LABELS[key] || humanizeVariableKey(key),
    token: toInsertToken(key),
  };
}

/**
 * Normalize a list of raw variables into picker entries (label + insert token).
 * Expands bare aliases like appointment → date/time/id.
 * Drops unsupported tokens; dedupes by insert key.
 *
 * @param {unknown[]} list
 * @returns {{ entries: { label: string, token: string, key: string }[], dropped: string[] }}
 */
export function normalizeVariableEntries(list = []) {
  const entries = [];
  const dropped = [];
  const seen = new Set();

  const pushKey = (backendKey) => {
    if (!backendKey || seen.has(backendKey)) return;
    seen.add(backendKey);
    entries.push(makeVariableEntry(backendKey));
  };

  for (const item of list) {
    const extracted = extractVariableKey(item);
    if (!extracted) continue;

    const expandKeys =
      VARIABLE_EXPAND_ALIASES[extracted] ||
      VARIABLE_EXPAND_ALIASES[extracted.toLowerCase()];

    if (expandKeys) {
      expandKeys.forEach(pushKey);
      continue;
    }

    const resolved = resolveVariableForInsert(item);
    if (!resolved) {
      dropped.push(extracted);
      continue;
    }
    pushKey(resolved.key);
  }

  return { entries, dropped };
}

/**
 * Ensure core groups (Patient, Doctor, Hospital, Appointment, System) exist.
 * Merges API groups with canonical keys without changing backend responses.
 *
 * @param {Array<{ label: string, variables: Array<{ key?: string, label?: string, token?: string }> }>} groups
 */
export function ensureCoreVariableGroups(groups = []) {
  const byLabel = new Map();

  for (const group of groups) {
    if (!group?.label) continue;
    const existing = byLabel.get(group.label) || {
      label: group.label,
      variables: [],
    };
    const seen = new Set(
      existing.variables.map((v) => v.key || extractVariableKey(v.token || v))
    );

    for (const variable of group.variables || []) {
      const key =
        variable.key ||
        extractVariableKey(variable.token || variable) ||
        "";
      if (!key || seen.has(key)) continue;
      const resolved = resolveVariableForInsert(variable) || makeVariableEntry(key);
      if (!resolved?.key || seen.has(resolved.key)) continue;
      seen.add(resolved.key);
      existing.variables.push(resolved);
    }

    byLabel.set(group.label, existing);
  }

  for (const core of CORE_VARIABLE_GROUPS) {
    const existing = byLabel.get(core.label) || {
      label: core.label,
      variables: [],
    };
    const seen = new Set(existing.variables.map((v) => v.key));
    for (const key of core.keys) {
      if (seen.has(key)) continue;
      seen.add(key);
      existing.variables.push(makeVariableEntry(key));
    }
    byLabel.set(core.label, existing);
  }

  const preferred = CORE_VARIABLE_GROUPS.map((g) => g.label);
  const merged = [...byLabel.values()].filter((g) => g.variables.length > 0);

  merged.sort((a, b) => {
    const ai = preferred.indexOf(a.label);
    const bi = preferred.indexOf(b.label);
    if (ai === -1 && bi === -1) return a.label.localeCompare(b.label);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  return merged;
}
