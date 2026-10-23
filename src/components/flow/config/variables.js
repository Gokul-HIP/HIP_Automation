/**
 * Workflow variable catalog for template pickers and condition builders.
 * Values resolve from Laravel VariableResolver at runtime.
 *
 * Each entry: { key, label, token, valueType?, description? }
 */

import {
  makeVariableEntry,
  REWARD_TIER_VARIABLE_DEFS,
} from "@/utils/workflowVariableTokens";

/** @param {string} key @param {string} label */
function entry(key, label) {
  return makeVariableEntry(key, label);
}

/**
 * True when the workflow trigger is the rewards-tier upgrade entry event.
 * Accepts the catalog key `rewardsTierUpgraded` and the `rewardTierUpgraded` alias.
 * @param {unknown} triggerKey
 */
export function isRewardTierUpgradedTrigger(triggerKey) {
  const compact = String(triggerKey || "")
    .trim()
    .replace(/[_-]/g, "")
    .toLowerCase();
  return compact === "rewardtierupgraded" || compact === "rewardstierupgraded";
}

function buildRewardTierGroup() {
  /** @type {Map<string, ReturnType<typeof entry>[]>} */
  const byGroup = new Map();
  for (const def of REWARD_TIER_VARIABLE_DEFS) {
    const list = byGroup.get(def.group) || [];
    list.push(entry(def.key, def.label));
    byGroup.set(def.group, list);
  }
  const subgroups = [...byGroup.entries()].map(([label, variables]) => ({
    label,
    variables,
  }));
  return {
    label: "Rewards",
    subgroups,
    variables: subgroups.flatMap((subgroup) => subgroup.variables),
  };
}

/**
 * Sections rendered inside one picker category.
 * Groups with subgroups (Rewards) expose those labels; others stay flat.
 * @param {{ label?: string, variables?: unknown[], subgroups?: { label?: string, variables?: unknown[] }[] }} group
 */
export function variableGroupSections(group) {
  if (Array.isArray(group?.subgroups) && group.subgroups.length > 0) {
    return group.subgroups.map((subgroup) => ({
      label: String(subgroup?.label || ""),
      variables: subgroup?.variables || [],
    }));
  }
  return [{ label: "", variables: group?.variables || [] }];
}

/**
 * Trigger-aware catalog filter. Reward tier placeholders are exposed only for
 * RewardTierUpgraded. Other groups are left unchanged.
 * @param {Array<{ label: string, variables?: unknown[], subgroups?: unknown[] }>} groups
 * @param {unknown} [triggerKey]
 */
export function applyRewardTierVariableGroups(groups = [], triggerKey = null) {
  const rewardKeys = new Set(REWARD_TIER_VARIABLE_DEFS.map((def) => def.key));

  const stripped = groups
    .map((group) => {
      const variables = (group.variables || []).filter(
        (variable) => !rewardKeys.has(variable?.key)
      );
      const subgroups = (group.subgroups || [])
        .map((subgroup) => ({
          ...subgroup,
          variables: (subgroup.variables || []).filter(
            (variable) => !rewardKeys.has(variable?.key)
          ),
        }))
        .filter((subgroup) => subgroup.variables.length > 0);
      return {
        ...group,
        variables,
        ...(group.subgroups ? { subgroups } : {}),
      };
    })
    .filter((group) => {
      if (group.subgroups?.length) return true;
      return group.variables.length > 0;
    });

  if (!isRewardTierUpgradedTrigger(triggerKey)) return stripped;

  const rewards = structuredClone(buildRewardTierGroup());
  const systemIndex = stripped.findIndex((group) => group.label === "System");
  if (systemIndex === -1) return [...stripped, rewards];
  return [
    ...stripped.slice(0, systemIndex),
    rewards,
    ...stripped.slice(systemIndex),
  ];
}

export const WORKFLOW_VARIABLE_GROUPS = [
  {
    label: "Patient",
    variables: [
      entry("patient_name", "Patient"),
      entry("patient_id", "Patient ID"),
      entry("patient_mobile", "Patient Mobile"),
      entry("patient_email", "Patient Email"),
      entry("patient_age", "Patient Age"),
      entry("patient_gender", "Patient Gender"),
      entry("patient_relationship", "Relationship (parent/child)"),
    ],
  },
  {
    label: "Doctor",
    variables: [
      entry("doctor_name", "Doctor"),
      entry("department", "Department"),
    ],
  },
  {
    label: "Appointment",
    variables: [
      entry("appointment_date", "Appointment Date"),
      entry("appointment_time", "Appointment Time"),
      entry("appointment_id", "Appointment ID"),
      entry("appointment_status", "Appointment Status"),
      entry("appointment_appointment_status", "Visit Status / Appointment Status"),
      entry("branch_name", "Branch"),
      entry("booking_link", "Booking Link"),
      entry("followup_date", "Follow-up Date"),
      entry("department", "Department"),
    ],
  },
  {
    label: "Invoice",
    variables: [
      entry("invoice_id", "Invoice ID"),
      entry("invoice_amount", "Invoice Amount"),
      entry("invoice_status", "Invoice Status"),
      entry("payment_status", "Payment Status"),
    ],
  },
  {
    label: "Payment",
    variables: [
      entry("payment_id", "Payment ID"),
      entry("payment_status", "Payment Status"),
      entry("payment_amount", "Payment Amount"),
      entry("payment_method", "Payment Method"),
      entry("payment_is_pay_by_hospital", "Pay by Hospital"),
      entry("transaction_id", "Transaction ID"),
    ],
  },
  {
    label: "Prescription",
    variables: [
      entry("prescription_id", "Prescription ID"),
      entry("pharmacy_link", "Pharmacy Link"),
    ],
  },
  {
    label: "Medicine",
    variables: [
      entry("medicine_name", "Medicine"),
      entry("dosage", "Dosage"),
      entry("frequency", "Frequency"),
      entry("reminder_time", "Reminder Time"),
      entry("time", "Time"),
      entry("date", "Date"),
    ],
  },
  buildRewardTierGroup(),
  {
    label: "Hospital",
    variables: [
      entry("hospital_name", "Hospital"),
      entry("hospital_phone", "Hospital Phone"),
    ],
  },
  {
    label: "System",
    variables: [
      entry("workflow_id", "Workflow ID"),
      entry("triggered_at", "Triggered At"),
    ],
  },
];

export const CONDITION_FIELD_GROUPS = [
  {
    label: "Patient",
    options: [
      { value: "age", label: "Age" },
      { value: "gender", label: "Gender" },
      { value: "blood_group", label: "Blood Group" },
      { value: "language", label: "Language" },
      { value: "membership", label: "Membership" },
      { value: "insurance", label: "Insurance" },
      { value: "city", label: "City" },
      { value: "state", label: "State" },
      { value: "disease", label: "Disease" },
      { value: "patient_segment", label: "Patient Segment" },
      { value: "patient.relationship", label: "Relationship (parent/child)" },
      { value: "patient.is_minor", label: "Is Minor" },
      { value: "last_visit", label: "Last Visit (days)" },
    ],
  },
  {
    label: "Appointment",
    options: [
      { value: "appointment.exists", label: "Has Appointment (exists)" },
      { value: "followup.exists", label: "Follow-up set (exists)" },
      { value: "followup.date", label: "Follow-up Date" },
      { value: "appointment.status", label: "Appointment Status" },
      { value: "appointment.appointment_status", label: "Visit Status / Appointment Status" },
      { value: "appointment_date", label: "Date" },
      { value: "appointment_time", label: "Time" },
      { value: "appointment_doctor", label: "Doctor" },
      { value: "appointment_department", label: "Department" },
      { value: "appointment_type", label: "Type" },
    ],
  },
  {
    label: "Invoice",
    options: [
      { value: "invoice.status", label: "Status" },
      { value: "invoice.payment_status", label: "Payment Status" },
      { value: "invoice.id", label: "ID" },
      { value: "invoice.amount", label: "Amount" },
    ],
  },
  {
    label: "Payment",
    options: [
      {
        value: "payment.is_pay_by_hospital",
        label: "Pay by Hospital",
        valueType: "boolean",
      },
      { value: "payment.status", label: "Payment Status" },
      { value: "payment.amount", label: "Payment Amount" },
      { value: "payment.method", label: "Payment Method" },
      { value: "transaction_id", label: "Transaction ID" },
      { value: "payment_status", label: "Status" },
      { value: "payment_method", label: "Method" },
      { value: "payment_amount", label: "Amount" },
      { value: "payment_discount", label: "Discount" },
      { value: "coins_used", label: "Coins Used" },
    ],
  },
  {
    label: "Hospital",
    options: [
      { value: "hospital_branch", label: "Branch" },
      { value: "hospital_department", label: "Department" },
      { value: "hospital_city", label: "City" },
    ],
  },
  {
    label: "Lab",
    options: [
      { value: "lab_status", label: "Status" },
      { value: "lab_test_name", label: "Test Name" },
    ],
  },
  {
    label: "System",
    options: [
      { value: "current_time", label: "Current Time" },
      { value: "current_date", label: "Current Date" },
      { value: "workflow_version", label: "Workflow Version" },
      { value: "execution_count", label: "Execution Count" },
    ],
  },
];

/** Flat list for backward-compatible lookups. */
export const CONDITION_FIELD_OPTIONS = CONDITION_FIELD_GROUPS.flatMap((group) =>
  group.options.map((opt) => ({
    ...opt,
    label: `${group.label}: ${opt.label}`,
  }))
);

export const CONDITION_OPERATOR_OPTIONS = [
  { value: "eq", label: "=" },
  { value: "neq", label: "!=" },
  { value: "gt", label: ">" },
  { value: "gte", label: ">=" },
  { value: "lt", label: "<" },
  { value: "lte", label: "<=" },
  { value: "contains", label: "contains" },
  { value: "starts_with", label: "starts with" },
  { value: "ends_with", label: "ends with" },
  { value: "empty", label: "is empty" },
  { value: "not_empty", label: "is not empty" },
  { value: "in", label: "in" },
  { value: "not_in", label: "not in" },
];

export const LOGIC_OPERATOR_OPTIONS = [
  { value: "and", label: "AND" },
  { value: "or", label: "OR" },
];
