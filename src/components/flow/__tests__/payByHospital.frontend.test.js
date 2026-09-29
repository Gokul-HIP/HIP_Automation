/**
 * Pay by Hospital / AppointmentBooked / LabTestOrdered catalog support.
 * Configurable conditions only — no hardcoded workflow IDs, hospitals, or messages.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  WORKFLOW_VARIABLE_GROUPS,
  CONDITION_FIELD_GROUPS,
} from "../config/variables.js";
import {
  CORE_VARIABLE_GROUPS,
  ensureCoreVariableGroups,
  toInsertToken,
} from "@/utils/workflowVariableTokens.js";
import {
  JEXL_CONDITION_EXAMPLES,
  tokenToJexlPath,
  validateJexlSyntax,
} from "@/runtime/engines/jexlCondition.js";
import { validateConditionNodeFields } from "../panels/conditions/conditionValidation.js";
import {
  createNodeDefaults,
  getWorkflowNode,
  getSidebarCatalogGroups,
} from "../config/workflowNodes.js";
import {
  getTriggerSchema,
  TRIGGER_TYPE_ALIASES,
} from "../config/triggers/index.js";
import { getMessagingSchema } from "../config/messaging/schemas.js";
import { serializeNode, serializeWorkflow } from "@/utils/flowSerializer.js";
import { deserializeNode, deserializeWorkflow } from "@/utils/flowDeserializer.js";

const PAY_BY_HOSPITAL = "payment.is_pay_by_hospital == true";
const PAYMENT_COMPLETED = 'payment.status == "completed"';
const PAYMENT_AMOUNT = "payment.amount > 500";
const APPT_PENDING = 'appointment.status == "pending"';
const APPT_CONFIRMED = 'appointment.status == "confirmed"';
const BOOKED_PENDING =
  'payment.is_pay_by_hospital == true && appointment.status == "pending"';
const BOOKED_CONFIRMED =
  'payment.is_pay_by_hospital == true && appointment.status == "confirmed"';
const CONFIRMED_NOT_HOSPITAL =
  'appointment.status == "confirmed" && payment.is_pay_by_hospital == false';

function paymentGroup() {
  return WORKFLOW_VARIABLE_GROUPS.find((g) => g.label === "Payment");
}

function paymentConditionValues() {
  return (
    CONDITION_FIELD_GROUPS.find((g) => g.label === "Payment")?.options.map(
      (o) => o.value
    ) || []
  );
}

function appointmentConditionValues() {
  return (
    CONDITION_FIELD_GROUPS.find((g) => g.label === "Appointment")?.options.map(
      (o) => o.value
    ) || []
  );
}

describe("Payment variable group — Pay by Hospital", () => {
  it("contains Pay by Hospital and existing payment fields", () => {
    const group = paymentGroup();
    assert.ok(group);
    const byKey = Object.fromEntries(
      group.variables.map((v) => [v.key, v.label])
    );
    assert.equal(byKey.payment_is_pay_by_hospital, "Pay by Hospital");
    assert.equal(byKey.payment_id, "Payment ID");
    assert.equal(byKey.payment_status, "Payment Status");
    assert.equal(byKey.payment_amount, "Payment Amount");
    assert.equal(byKey.payment_method, "Payment Method");
    assert.equal(byKey.transaction_id, "Transaction ID");
    assert.equal(toInsertToken("payment_is_pay_by_hospital"), "{{payment_is_pay_by_hospital}}");
  });

  it("core picker restores a single Payment group", () => {
    const merged = ensureCoreVariableGroups([]);
    const payments = merged.filter((g) => g.label === "Payment");
    assert.equal(payments.length, 1);
    const keys = payments[0].variables.map((v) => v.key);
    assert.ok(keys.includes("payment_is_pay_by_hospital"));
    assert.ok(keys.includes("payment_status"));
    assert.ok(keys.includes("transaction_id"));
    assert.equal(
      CORE_VARIABLE_GROUPS.filter((g) => g.label === "Payment").length,
      1
    );
  });

  it("payment.is_pay_by_hospital can be inserted into a Condition", () => {
    const payByHospital = CONDITION_FIELD_GROUPS.find(
      (g) => g.label === "Payment"
    )?.options.find((o) => o.value === "payment.is_pay_by_hospital");
    assert.ok(payByHospital);
    assert.equal(payByHospital.valueType, "boolean");
    assert.ok(paymentConditionValues().includes("payment.is_pay_by_hospital"));
    assert.equal(
      tokenToJexlPath("{{payment_is_pay_by_hospital}}"),
      "payment.is_pay_by_hospital"
    );
    assert.equal(
      tokenToJexlPath("payment.is_pay_by_hospital"),
      "payment.is_pay_by_hospital"
    );
  });
});

describe("Payment / Appointment condition catalog", () => {
  it("supports Pay by Hospital boolean and existing payment expressions", () => {
    for (const expr of [
      PAY_BY_HOSPITAL,
      "payment.is_pay_by_hospital == false",
      PAYMENT_COMPLETED,
      PAYMENT_AMOUNT,
    ]) {
      assert.ok(JEXL_CONDITION_EXAMPLES.includes(expr), expr);
      assert.equal(validateJexlSyntax(expr).ok, true, expr);
      assert.equal(
        validateConditionNodeFields({ expression: expr }).length,
        0,
        expr
      );
    }
    assert.ok(paymentConditionValues().includes("payment.status"));
    assert.ok(paymentConditionValues().includes("payment.amount"));
    assert.ok(paymentConditionValues().includes("payment.method"));
    assert.ok(paymentConditionValues().includes("transaction_id"));
    assert.ok(paymentConditionValues().includes("payment_status"));
  });

  it("keeps appointment.status and appointment.appointment_status unmerged", () => {
    const values = appointmentConditionValues();
    assert.ok(values.includes("appointment.status"));
    assert.ok(values.includes("appointment.appointment_status"));
    assert.notEqual("appointment.status", "appointment.appointment_status");
    assert.ok(JEXL_CONDITION_EXAMPLES.includes(APPT_PENDING));
    assert.ok(JEXL_CONDITION_EXAMPLES.includes(APPT_CONFIRMED));
  });

  it("serializes boolean Pay by Hospital conditions without rewriting them", () => {
    for (const expression of [
      PAY_BY_HOSPITAL,
      BOOKED_PENDING,
      BOOKED_CONFIRMED,
      CONFIRMED_NOT_HOSPITAL,
      PAYMENT_COMPLETED,
    ]) {
      const node = {
        id: "n_cond",
        type: "workflow",
        position: { x: 0, y: 0 },
        data: {
          ...createNodeDefaults("condition"),
          expression,
        },
      };
      const serialized = serializeNode(node);
      assert.equal(serialized.data.expression, expression);
      const restored = deserializeNode(serialized);
      assert.equal(restored.data.expression, expression);
    }
  });
});

describe("LabTestOrdered trigger", () => {
  it("appears in the trigger catalog and aliases resolve", () => {
    const node = getWorkflowNode("labTestOrdered");
    assert.ok(node);
    assert.equal(node.title, "Lab Test Ordered");
    assert.equal(node.category, "triggers");
    assert.ok(getTriggerSchema("labTestOrdered"));
    assert.equal(TRIGGER_TYPE_ALIASES.LabTestOrdered, "labTestOrdered");
    assert.ok(getTriggerSchema("LabTestOrdered"));
    assert.ok(getTriggerSchema("lab_test_ordered"));

    const groups = getSidebarCatalogGroups();
    const triggers = groups.find((g) => g.category.id === "triggers");
    assert.ok(
      triggers.nodes.some((n) => n.type === "labTestOrdered"),
      "Lab Test Ordered missing from Triggers group"
    );
  });

  it("reuses Payment variables when LabTestOrdered is the trigger", () => {
    const schema = getTriggerSchema("labTestOrdered");
    assert.ok(schema.laravelContext.includes("context.payment"));
    const payment = paymentGroup();
    assert.ok(payment.variables.some((v) => v.key === "payment_status"));
    assert.ok(
      payment.variables.some((v) => v.key === "payment_is_pay_by_hospital")
    );
    const push = getMessagingSchema("sendPush");
    assert.ok(push.variableGroups.some((g) => g.label === "Payment"));
  });
});

describe("Existing PaymentReceived / Invoice / PaymentPending UI", () => {
  it("keeps PaymentReceived, InvoiceGenerated, and Invoice variables", () => {
    assert.ok(getWorkflowNode("paymentReceived"));
    assert.equal(getWorkflowNode("paymentReceived").title, "Payment Received");
    assert.ok(getTriggerSchema("paymentReceived"));
    assert.ok(getWorkflowNode("invoiceGenerated"));
    const invoice = WORKFLOW_VARIABLE_GROUPS.find((g) => g.label === "Invoice");
    assert.ok(invoice.variables.some((v) => v.key === "invoice_id"));
    assert.ok(invoice.variables.some((v) => v.key === "invoice_amount"));
    assert.ok(JEXL_CONDITION_EXAMPLES.includes('invoice.status == "pending"'));
    assert.ok(JEXL_CONDITION_EXAMPLES.includes(PAYMENT_COMPLETED));
  });
});

describe("Serialize / no hardcoded workflow config", () => {
  it("round-trips an Appointment Booked Pay by Hospital condition graph", () => {
    const nodes = [
      {
        id: "n_trigger",
        type: "workflow",
        position: { x: 0, y: 0 },
        data: createNodeDefaults("appointmentBooked"),
      },
      {
        id: "n_cond",
        type: "workflow",
        position: { x: 80, y: 0 },
        data: {
          ...createNodeDefaults("condition"),
          expression: BOOKED_PENDING,
        },
      },
      {
        id: "n_push",
        type: "workflow",
        position: { x: 160, y: 0 },
        data: {
          ...createNodeDefaults("sendPush"),
          title: "",
          body: "",
        },
      },
      {
        id: "n_end",
        type: "workflow",
        position: { x: 240, y: 0 },
        data: createNodeDefaults("end"),
      },
    ];
    const edges = [
      { id: "e1", source: "n_trigger", target: "n_cond" },
      { id: "e2", source: "n_cond", target: "n_push", sourceHandle: "true" },
      { id: "e3", source: "n_cond", target: "n_end", sourceHandle: "false" },
      { id: "e4", source: "n_push", target: "n_end" },
    ];
    const payload = serializeWorkflow({
      name: "Appointment Booked",
      nodes,
      edges,
      status: "inactive",
    });
    assert.equal(
      payload.configuration.nodes.find((n) => n.id === "n_cond").data
        .expression,
      BOOKED_PENDING
    );
    const restored = deserializeWorkflow(payload.configuration);
    assert.equal(
      restored.nodes.find((n) => n.id === "n_cond").data.expression,
      BOOKED_PENDING
    );
  });

  it("does not hardcode workflow IDs, hospital IDs, or notification copy in node defaults", () => {
    const types = [
      "appointmentBooked",
      "labTestOrdered",
      "paymentReceived",
      "invoiceGenerated",
      "sendPush",
      "sendWhatsApp",
      "sendEmail",
      "condition",
    ];
    for (const type of types) {
      const data = createNodeDefaults(type);
      const raw = JSON.stringify(data);
      assert.equal(
        Object.prototype.hasOwnProperty.call(data, "hospital_id"),
        false,
        type
      );
      assert.equal(
        Object.prototype.hasOwnProperty.call(data, "workflow_id") &&
          typeof data.workflow_id === "number",
        false,
        type
      );
      assert.equal(/"workflowId"\s*:\s*\d+/.test(raw), false, type);
      assert.equal(/"hospital_id"\s*:\s*\d+/.test(raw), false, type);
    }

    const push = createNodeDefaults("sendPush");
    assert.equal(push.title, "");
    assert.equal(push.body, "");
    const wa = createNodeDefaults("sendWhatsApp");
    assert.equal(wa.message, "");
    const email = createNodeDefaults("sendEmail");
    assert.equal(email.subject, "");
    assert.equal(email.body, "");
  });
});
