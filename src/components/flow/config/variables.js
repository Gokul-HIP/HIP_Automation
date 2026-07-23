/**
 * Workflow variable catalog for template pickers and condition builders.
 * Values resolve from Laravel VariableResolver at runtime.
 *
 * Each entry: { label: display text, token: inserted {{placeholder}} }
 */

import { toInsertToken } from "@/utils/workflowVariableTokens";

/** @param {string} key @param {string} label */
function entry(key, label) {
  return { key, label, token: toInsertToken(key) };
}

export const WORKFLOW_VARIABLE_GROUPS = [
  {
    label: "Patient",
    variables: [
      entry("patient_name", "Patient"),
      entry("patient_mobile", "Patient Mobile"),
      entry("patient_email", "Patient Email"),
      entry("patient_age", "Patient Age"),
      entry("patient_gender", "Patient Gender"),
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
      entry("branch_name", "Branch"),
    ],
  },
  {
    label: "Invoice",
    variables: [
      entry("invoice_amount", "Invoice Amount"),
      entry("payment_status", "Payment Status"),
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
      entry("time", "Time"),
      entry("date", "Date"),
    ],
  },
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

export const CONDITION_FIELD_OPTIONS = [
  { value: "age", label: "Age" },
  { value: "gender", label: "Gender" },
  { value: "disease", label: "Disease" },
  { value: "language", label: "Language" },
  { value: "membership", label: "Membership" },
  { value: "payment_status", label: "Payment Status" },
  { value: "last_visit", label: "Last Visit" },
  { value: "patient_segment", label: "Patient Segment" },
];

export const CONDITION_OPERATOR_OPTIONS = [
  { value: "eq", label: "=" },
  { value: "neq", label: "≠" },
  { value: "gt", label: ">" },
  { value: "gte", label: "≥" },
  { value: "lt", label: "<" },
  { value: "lte", label: "≤" },
  { value: "contains", label: "contains" },
  { value: "empty", label: "is empty" },
];

export const LOGIC_OPERATOR_OPTIONS = [
  { value: "and", label: "AND" },
  { value: "or", label: "OR" },
];
