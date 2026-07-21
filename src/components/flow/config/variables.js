/**
 * Workflow variable catalog for template pickers and condition builders.
 * Values resolve from Laravel context at runtime.
 */

export const WORKFLOW_VARIABLE_GROUPS = [
  {
    label: "Patient",
    variables: [
      "{{PatientName}}",
      "{{patient_name}}",
      "{{patient_mobile}}",
      "{{patient_email}}",
      "{{patient_age}}",
      "{{patient_gender}}",
    ],
  },
  {
    label: "Doctor",
    variables: ["{{DoctorName}}", "{{doctor_name}}", "{{department}}"],
  },
  {
    label: "Appointment",
    variables: [
      "{{AppointmentDate}}",
      "{{appointment_date}}",
      "{{appointment_time}}",
      "{{branch_name}}",
    ],
  },
  {
    label: "Prescription",
    variables: ["{{prescription_id}}", "{{pharmacy_link}}"],
  },
  {
    label: "Medicine",
    variables: [
      "{{MedicineName}}",
      "{{medicine_name}}",
      "{{dosage}}",
      "{{frequency}}",
      "{{time}}",
      "{{date}}",
    ],
  },
  {
    label: "Hospital",
    variables: ["{{hospital_name}}", "{{hospital_phone}}"],
  },
  {
    label: "System",
    variables: ["{{workflow_id}}", "{{triggered_at}}"],
  },
  {
    label: "Flow Variables",
    variables: ["{{flow.variable}}"],
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
