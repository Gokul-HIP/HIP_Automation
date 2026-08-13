export const CONDITION_SCHEMAS = {
  condition: {
    description:
      "Evaluate a JEXL expression against the workflow context and route to True or False.",
    fields: [
      {
        key: "name",
        type: "text",
        label: "Name",
        required: false,
        placeholder: "Payment Successful",
        hint: "Optional display name for this condition.",
      },
      {
        key: "expression",
        type: "jexl",
        label: "Condition",
        required: true,
        placeholder: "customer.age >= 18",
      },
    ],
    defaults: {
      label: "Condition",
      name: "Condition",
      status: "draft",
      expression: "",
      category: "conditions",
    },
  },

  switch: {
    description: "Route to multiple paths by matching a field value.",
    fields: [
      { key: "label", type: "text", label: "Display Name", required: true },
      {
        key: "switchField",
        type: "text",
        label: "Field",
        required: true,
        placeholder: "appointment.status",
      },
      {
        key: "cases",
        type: "textarea",
        label: "Cases (comma separated)",
        required: true,
        placeholder: "Confirmed, Cancelled",
      },
    ],
    defaults: {
      label: "Switch",
      status: "draft",
      switchField: "appointment.status",
      cases: "Confirmed, Cancelled",
    },
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
