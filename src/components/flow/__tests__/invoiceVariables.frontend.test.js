/**
 * Invoice variable catalog + Payment Pending JEXL presets.
 * Frontend-only: picker groups, tokens, condition examples.
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
  tokenToJexlPath as jexlPath,
  validateJexlSyntax,
} from "@/runtime/engines/jexlCondition.js";
import { validateConditionNodeFields } from "../panels/conditions/conditionValidation.js";

const PENDING_EXPRESSION = 'invoice.status == "pending"';

function groupKeys(groups, label) {
  const group = groups.find((g) => g.label === label);
  assert.ok(group, `missing group ${label}`);
  return (group.variables || group.keys || []).map((v) =>
    typeof v === "string" ? v : v.key
  );
}

describe("Invoice variable catalog", () => {
  it("exposes a first-class Invoice group with required tokens", () => {
    const keys = groupKeys(WORKFLOW_VARIABLE_GROUPS, "Invoice");
    assert.ok(keys.includes("invoice_id"));
    assert.ok(keys.includes("invoice_amount"));
    assert.ok(keys.includes("invoice_status"));
    assert.ok(keys.includes("payment_status"));
    assert.equal(toInsertToken("invoice_id"), "{{invoice_id}}");
    assert.equal(toInsertToken("invoice_amount"), "{{invoice_amount}}");
  });

  it("core picker always restores Invoice even when API omits it", () => {
    const core = CORE_VARIABLE_GROUPS.find((g) => g.label === "Invoice");
    assert.ok(core);
    assert.ok(core.keys.includes("invoice_id"));
    assert.ok(core.keys.includes("invoice_amount"));
    assert.ok(core.keys.includes("invoice_status"));

    const merged = ensureCoreVariableGroups([]);
    const labels = merged.map((g) => g.label);
    for (const required of [
      "Patient",
      "Doctor",
      "Hospital",
      "Appointment",
      "Invoice",
      "System",
    ]) {
      assert.ok(labels.includes(required), `missing core group ${required}`);
    }
    const invoice = merged.find((g) => g.label === "Invoice");
    const invoiceKeys = invoice.variables.map((v) => v.key);
    assert.ok(invoiceKeys.includes("invoice_id"));
    assert.ok(invoiceKeys.includes("invoice_amount"));
  });

  it("condition catalog exposes invoice.status separately from invoice.payment_status", () => {
    const invoice = CONDITION_FIELD_GROUPS.find((g) => g.label === "Invoice");
    assert.ok(invoice);
    const values = invoice.options.map((o) => o.value);
    assert.ok(values.includes("invoice.status"));
    assert.ok(values.includes("invoice.payment_status"));
    assert.ok(values.includes("invoice.id"));
    assert.ok(values.includes("invoice.amount"));
    assert.equal(values.includes("invoice.status"), true);
  });

  it("maps template tokens to JEXL invoice paths", () => {
    assert.equal(jexlPath("{{invoice_id}}"), "invoice.id");
    assert.equal(jexlPath("{{invoice_amount}}"), "invoice.amount");
    assert.equal(jexlPath("{{invoice_status}}"), "invoice.status");
    assert.equal(jexlPath("invoice.status"), "invoice.status");
  });
});

describe("Payment Pending condition preset", () => {
  it("uses lowercase pending, not Paid", () => {
    assert.ok(JEXL_CONDITION_EXAMPLES.includes(PENDING_EXPRESSION));
    assert.equal(
      JEXL_CONDITION_EXAMPLES.includes('invoice.status == "Paid"'),
      false
    );
    assert.equal(
      JEXL_CONDITION_EXAMPLES.some((ex) => /invoice\.status == "Paid"/.test(ex)),
      false
    );
  });

  it("generic validator accepts pending and paid expressions", () => {
    assert.equal(validateJexlSyntax(PENDING_EXPRESSION).ok, true);
    assert.equal(validateJexlSyntax('invoice.status == "paid"').ok, true);
    assert.equal(
      validateConditionNodeFields({ expression: PENDING_EXPRESSION }).length,
      0
    );
  });
});
