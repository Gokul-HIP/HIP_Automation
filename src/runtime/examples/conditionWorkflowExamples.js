/**
 * Example Condition (JEXL) workflow fragments for HIP automation.
 * These illustrate the JSON contract persisted by the Flow Builder.
 */

export const EXAMPLE_PAYMENT_CONDITION_NODE = {
  id: "cond_payment_ok",
  type: "workflow",
  position: { x: 420, y: 180 },
  data: {
    nodeType: "condition",
    category: "conditions",
    name: "Payment Successful",
    label: "Payment Successful",
    expression: "payment.success && invoice.amount > 1000",
    status: "draft",
  },
};

export const EXAMPLE_AGE_CONDITION_NODE = {
  id: "cond_senior",
  type: "workflow",
  position: { x: 420, y: 180 },
  data: {
    nodeType: "condition",
    category: "conditions",
    name: "Senior Patient",
    label: "Senior Patient",
    expression: "patient.age >= 60",
    status: "draft",
  },
};

export const EXAMPLE_APPOINTMENT_AND_PAYMENT = {
  id: "cond_appt_paid",
  type: "workflow",
  position: { x: 420, y: 180 },
  data: {
    nodeType: "condition",
    category: "conditions",
    name: "Confirmed And Paid",
    label: "Confirmed And Paid",
    expression: 'appointment.status == "Confirmed" && payment.success',
    status: "draft",
  },
};

/** Sample edges from a Condition node to True / False targets. */
export const EXAMPLE_CONDITION_EDGES = [
  {
    id: "e_true",
    source: "cond_payment_ok",
    target: "action_success",
    sourceHandle: "true",
    type: "custom",
  },
  {
    id: "e_false",
    source: "cond_payment_ok",
    target: "action_fallback",
    sourceHandle: "false",
    type: "custom",
  },
];
