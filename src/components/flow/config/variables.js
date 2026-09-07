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
      entry("branch_name", "Branch"),
      entry("booking_link", "Booking Link"),
      entry("followup_date", "Follow-up Date"),
      entry("department", "Department"),
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
      entry("reminder_time", "Reminder Time"),
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
      { value: "appointment_status", label: "Status" },
      { value: "appointment_date", label: "Date" },
      { value: "appointment_time", label: "Time" },
      { value: "appointment_doctor", label: "Doctor" },
      { value: "appointment_department", label: "Department" },
      { value: "appointment_type", label: "Type" },
    ],
  },
  {
    label: "Payment",
    options: [
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
