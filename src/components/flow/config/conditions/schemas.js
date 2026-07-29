import {
  CONDITION_FIELD_OPTIONS,
  CONDITION_OPERATOR_OPTIONS,
} from "../variables";

export const CONDITION_SCHEMAS = {
  condition: {
    description: "Branch the workflow when rules match (IF / ELSE). Use Match to require all rules (AND) or any rule (OR).",
    fields: [{ key: "conditionBuilder", type: "conditionBuilder", label: "Rules" }],
    defaults: {
      label: "IF / ELSE",
      status: "draft",
      logic: "and",
      rules: [{ field: "age", operator: "gt", value: "60" }],
    },
  },

  switch: {
    description: "Route to multiple paths by matching a field value.",
    fields: [
      { key: "label", type: "text", label: "Display Name", required: true },
      { key: "switchField", type: "select", label: "Field", options: CONDITION_FIELD_OPTIONS, required: true },
      { key: "cases", type: "textarea", label: "Cases (comma separated)", required: true, placeholder: "urgent, routine, follow_up" },
    ],
    defaults: { label: "Switch", status: "draft", switchField: "patient_segment", cases: "urgent, routine" },
  },

  logicNot: {
    description: "Invert the result of a nested condition.",
    fields: [{ key: "conditionBuilder", type: "conditionBuilder", label: "NOT Rule" }],
    defaults: { label: "NOT", status: "draft", logic: "and", rules: [{ field: "payment_status", operator: "eq", value: "pending" }] },
  },

  compare: {
    description: "Compare two values or expressions.",
    fields: [
      { key: "label", type: "text", label: "Display Name", required: true },
      { key: "leftOperand", type: "text", label: "Left Operand", required: true },
      { key: "operator", type: "select", label: "Operator", options: CONDITION_OPERATOR_OPTIONS, required: true },
      { key: "rightOperand", type: "text", label: "Right Operand", required: true },
    ],
    defaults: { label: "Compare", status: "draft", leftOperand: "{{patient_age}}", operator: "gt", rightOperand: "18" },
  },

  patientSegment: {
    description: "Filter by patient segment (VIP, chronic care, etc.).",
    fields: [
      { key: "label", type: "text", label: "Display Name", required: true },
      { key: "segment", type: "select", label: "Segment", options: [
        { value: "vip", label: "VIP" },
        { value: "chronic", label: "Chronic Care" },
        { value: "new", label: "New Patient" },
        { value: "returning", label: "Returning" },
      ], required: true },
    ],
    defaults: { label: "Patient Segment", status: "draft", segment: "returning" },
  },

  disease: {
    description: "Match patients by disease or diagnosis.",
    fields: [
      { key: "label", type: "text", label: "Display Name", required: true },
      { key: "disease", type: "text", label: "Disease / ICD Code", required: true, placeholder: "Diabetes" },
    ],
    defaults: { label: "Disease", status: "draft", disease: "Diabetes" },
  },

  age: {
    description: "Filter by patient age.",
    fields: [
      { key: "label", type: "text", label: "Display Name", required: true },
      { key: "operator", type: "select", label: "Operator", options: CONDITION_OPERATOR_OPTIONS, required: true },
      { key: "value", type: "number", label: "Age", required: true, min: 0 },
    ],
    defaults: { label: "Age", status: "draft", operator: "gt", value: 60 },
  },

  gender: {
    description: "Filter by patient gender.",
    fields: [
      { key: "label", type: "text", label: "Display Name", required: true },
      { key: "gender", type: "select", label: "Gender", options: [
        { value: "male", label: "Male" },
        { value: "female", label: "Female" },
        { value: "other", label: "Other" },
      ], required: true },
    ],
    defaults: { label: "Gender", status: "draft", gender: "female" },
  },

  language: {
    description: "Filter by preferred patient language.",
    fields: [
      { key: "label", type: "text", label: "Display Name", required: true },
      { key: "language", type: "select", label: "Language", options: [
        { value: "en", label: "English" },
        { value: "hi", label: "Hindi" },
        { value: "ta", label: "Tamil" },
        { value: "ar", label: "Arabic" },
      ], required: true },
    ],
    defaults: { label: "Language", status: "draft", language: "en" },
  },

  membership: {
    description: "Filter by membership plan status.",
    fields: [
      { key: "label", type: "text", label: "Display Name", required: true },
      { key: "membershipStatus", type: "select", label: "Membership", options: [
        { value: "active", label: "Active" },
        { value: "expired", label: "Expired" },
        { value: "none", label: "No Membership" },
      ], required: true },
    ],
    defaults: { label: "Membership", status: "draft", membershipStatus: "active" },
  },

  paymentStatus: {
    description: "Filter by payment status.",
    fields: [
      { key: "label", type: "text", label: "Display Name", required: true },
      { key: "paymentStatus", type: "select", label: "Payment Status", options: [
        { value: "paid", label: "Paid" },
        { value: "pending", label: "Pending" },
        { value: "failed", label: "Failed" },
      ], required: true },
    ],
    defaults: { label: "Payment Status", status: "draft", paymentStatus: "pending" },
  },

  lastVisit: {
    description: "Filter by days since last visit.",
    fields: [
      { key: "label", type: "text", label: "Display Name", required: true },
      { key: "daysSince", type: "number", label: "Days Since Last Visit", required: true, min: 0 },
    ],
    defaults: { label: "Last Visit", status: "draft", daysSince: 30 },
  },
};

export function getConditionSchema(type) {
  return CONDITION_SCHEMAS[type] ?? null;
}

export function buildConditionDefaults(type) {
  const schema = getConditionSchema(type);
  if (!schema) return null;
  return structuredClone(schema.defaults);
}

export {
  CONDITION_FIELD_OPTIONS,
  CONDITION_FIELD_GROUPS,
  CONDITION_OPERATOR_OPTIONS,
  LOGIC_OPERATOR_OPTIONS,
} from "../variables";
