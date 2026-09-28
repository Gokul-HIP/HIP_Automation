/**
 * Invoice facts + Payment Pending JEXL evaluation.
 * Uses the in-repo JS runtime (Laravel PHP is not in this repository).
 * Does not hardcode a hospital workflow ID.
 */

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";

import {
  evaluateJexlCondition,
  buildJexlContext,
  variableResolver,
  executeWorkflow,
  workflowExecutionStore,
  communicationLogStore,
  normalizeInvoiceFacts,
  resolveInvoiceAmount,
} from "../index.js";

const PENDING_EXPRESSION = 'invoice.status == "pending"';

function pendingInvoice() {
  return {
    id: 9001,
    status: "pending",
    total_amount: 1500,
    payment_status: "unpaid",
  };
}

describe("Invoice amount resolution", () => {
  it("prefers total_amount then amount", () => {
    assert.equal(resolveInvoiceAmount({ total_amount: 1500, amount: 99 }), 1500);
    assert.equal(resolveInvoiceAmount({ amount: 99 }), 99);
    assert.equal(resolveInvoiceAmount({}), null);
  });
});

describe("PaymentPending runtime facts", () => {
  it("context contains invoice id, amount, and lowercase status", () => {
    const facts = normalizeInvoiceFacts(pendingInvoice());
    assert.equal(facts.id, 9001);
    assert.equal(facts.status, "pending");
    assert.equal(facts.amount, 1500);
    assert.equal(facts.total_amount, 1500);
    assert.equal(facts.payment_status, "unpaid");

    const jexl = buildJexlContext({ invoice: pendingInvoice() });
    assert.equal(jexl.invoice.id, 9001);
    assert.equal(jexl.invoice.status, "pending");
    assert.equal(jexl.invoice.amount, 1500);
  });

  it("does not title-case stored status", () => {
    const facts = normalizeInvoiceFacts({ status: "pending" });
    assert.equal(facts.status, "pending");
    assert.notEqual(facts.status, "Pending");
    assert.notEqual(facts.status, "Paid");
  });
});

describe("PaymentPending JEXL evaluation", () => {
  it("invoice.status == pending is true for a pending invoice", async () => {
    assert.equal(
      await evaluateJexlCondition(PENDING_EXPRESSION, {
        invoice: pendingInvoice(),
      }),
      true
    );
  });

  it("invoice.status == paid is false for a pending invoice", async () => {
    assert.equal(
      await evaluateJexlCondition('invoice.status == "paid"', {
        invoice: pendingInvoice(),
      }),
      false
    );
    assert.equal(
      await evaluateJexlCondition('invoice.status == "Paid"', {
        invoice: pendingInvoice(),
      }),
      false
    );
  });
});

describe("Invoice template variables", () => {
  it("resolves {{invoice_id}} and {{invoice_amount}}", () => {
    const context = {
      invoice: pendingInvoice(),
      patient: { name: "Riya" },
      hospital: { hospital_name: "Sunrise" },
    };
    assert.equal(
      variableResolver.resolve("Invoice {{invoice_id}}", context),
      "Invoice 9001"
    );
    assert.equal(
      variableResolver.resolve(
        "Your payment of {{invoice_amount}} is still pending.",
        context
      ),
      "Your payment of 1500 is still pending."
    );
  });

  it("uses amount when total_amount is absent", () => {
    const body = variableResolver.resolve("{{invoice_amount}}", {
      invoice: { id: 2, status: "pending", amount: 250 },
    });
    assert.equal(body, "250");
  });
});

describe("Payment Pending workflow graph", () => {
  beforeEach(() => {
    workflowExecutionStore.clear();
    communicationLogStore.clear();
  });

  it("runs pending condition true → send push with invoice_amount", async () => {
    const configuration = {
      campaignKey: "payment_pending",
      nodes: [
        {
          id: "n_trigger",
          type: "workflow",
          position: { x: 0, y: 0 },
          data: { nodeType: "invoiceGenerated", category: "triggers" },
        },
        {
          id: "n_cond",
          type: "workflow",
          position: { x: 0, y: 0 },
          data: {
            nodeType: "condition",
            category: "conditions",
            expression: PENDING_EXPRESSION,
          },
        },
        {
          id: "n_push",
          type: "workflow",
          position: { x: 0, y: 0 },
          data: {
            nodeType: "sendPush",
            category: "messaging",
            title: "Pending Payment",
            body: "Your payment of {{invoice_amount}} is still pending.",
            recipient: "patient",
            campaignStep: "payment_pending_1",
          },
        },
        {
          id: "n_end",
          type: "workflow",
          position: { x: 0, y: 0 },
          data: { nodeType: "end", category: "flow" },
        },
        {
          id: "n_end_false",
          type: "workflow",
          position: { x: 0, y: 0 },
          data: { nodeType: "end", category: "flow" },
        },
      ],
      edges: [
        { id: "e1", source: "n_trigger", target: "n_cond" },
        {
          id: "e2",
          source: "n_cond",
          target: "n_push",
          sourceHandle: "true",
        },
        {
          id: "e3",
          source: "n_cond",
          target: "n_end_false",
          sourceHandle: "false",
        },
        { id: "e4", source: "n_push", target: "n_end" },
      ],
    };

    const result = await executeWorkflow({
      configuration,
      workflowName: "Payment Pending",
      triggerPayload: { trigger_type: "invoiceGenerated" },
      patient: { id: 501, name: "Riya Sharma" },
      hospital: { id: 12, hospital_name: "Sunrise Hospital" },
      invoice: pendingInvoice(),
    });

    assert.ok(result);
    assert.equal(result.status, "completed");
    const cond = (result.trace || []).find((e) => e.nodeId === "n_cond");
    assert.ok(cond);
    const passed = cond.detail?.output?.passed ?? cond.detail?.passed;
    assert.equal(passed, true);
    const push = (result.trace || []).find((e) => e.nodeId === "n_push");
    assert.ok(push);
    const detailText = JSON.stringify(push.detail || {});
    assert.ok(
      detailText.includes("1500") ||
        communicationLogStore.list({ executionId: result.id }).length >= 1,
      `expected push dispatch, got ${detailText}`
    );
  });
});
