/**
 * Attach Invoice PDF — Send Email (enabled) and Send WhatsApp (disabled stub).
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  createNodeDefaults,
  getWorkflowNode,
} from "../config/workflowNodes.js";
import {
  getMessagingSchema,
  ATTACH_INVOICE_PDF_KEY,
  WHATSAPP_DOCUMENT_ATTACHMENTS_SUPPORTED,
  getAttachInvoicePdfField,
} from "../config/messaging/schemas.js";
import { WORKFLOW_VARIABLE_GROUPS } from "../config/variables.js";
import { CORE_VARIABLE_GROUPS } from "@/utils/workflowVariableTokens.js";
import { getMessagingFieldErrors } from "../panels/messaging/messagingUx.js";
import { serializeNode, serializeWorkflow } from "@/utils/flowSerializer.js";
import { deserializeNode } from "@/utils/flowDeserializer.js";
import { validateWorkflowGraph } from "../validation/workflowGraphValidation.js";

function emailNode(overrides = {}) {
  return {
    id: "n_email",
    type: "workflow",
    position: { x: 0, y: 0 },
    data: {
      ...createNodeDefaults("sendEmail"),
      subject: "Invoice",
      body: "Your invoice {{invoice_id}} amount {{invoice_amount}}",
      ...overrides,
    },
  };
}

function whatsappNode(overrides = {}) {
  return {
    id: "n_wa",
    type: "workflow",
    position: { x: 0, y: 0 },
    data: {
      ...createNodeDefaults("sendWhatsApp"),
      message: "Hello {{patient_name}}",
      ...overrides,
    },
  };
}

function triggerAndEnd() {
  return [
    {
      id: "n_trig",
      type: "workflow",
      position: { x: 0, y: 0 },
      data: createNodeDefaults("invoiceGenerated"),
    },
    {
      id: "n_end",
      type: "workflow",
      position: { x: 200, y: 0 },
      data: createNodeDefaults("end"),
    },
  ];
}

describe("Attach Invoice PDF — Send Email", () => {
  it("shows Attach Invoice PDF in the email schema", () => {
    const schema = getMessagingSchema("sendEmail");
    const field = schema.fields.find((f) => f.key === ATTACH_INVOICE_PDF_KEY);
    assert.ok(field);
    assert.equal(field.label, "Attach Invoice PDF");
    assert.equal(field.section, "Attachments");
    assert.equal(field.type, "boolean");
    assert.equal(field.disabled, false);
  });

  it("defaults attachInvoicePdf to false", () => {
    const defaults = createNodeDefaults("sendEmail");
    assert.equal(defaults.attachInvoicePdf, false);
    assert.equal(defaults.nodeType, "sendEmail");
  });

  it("persists attachInvoicePdf=true on serialize/deserialize", () => {
    const node = emailNode({ attachInvoicePdf: true });
    const serialized = serializeNode(node);
    assert.equal(serialized.data.attachInvoicePdf, true);
    assert.equal("attach_invoice_pdf" in serialized.data, false);

    const restored = deserializeNode(serialized);
    assert.equal(restored.data.attachInvoicePdf, true);

    const payload = serializeWorkflow({
      name: "Email invoice attach",
      nodes: [...triggerAndEnd(), node],
      edges: [
        { id: "e1", source: "n_trig", target: "n_email" },
        { id: "e2", source: "n_email", target: "n_end" },
      ],
      status: "inactive",
    });
    const saved = payload.configuration.nodes.find((n) => n.id === "n_email");
    assert.equal(saved.data.attachInvoicePdf, true);
    assert.equal(saved.data.subject, "Invoice");
    assert.ok(saved.data.body.includes("{{invoice_id}}"));
    assert.ok(saved.data.body.includes("{{invoice_amount}}"));
  });
});

describe("Attach Invoice PDF — Send WhatsApp", () => {
  it("shows the Attachments section with a disabled control", () => {
    const schema = getMessagingSchema("sendWhatsApp");
    const field = schema.fields.find((f) => f.key === ATTACH_INVOICE_PDF_KEY);
    assert.ok(field);
    assert.equal(field.section, "Attachments");
    assert.equal(field.label, "Attach Invoice PDF");
    assert.equal(WHATSAPP_DOCUMENT_ATTACHMENTS_SUPPORTED, false);
    assert.equal(field.disabled, true);
    assert.match(
      String(field.description || ""),
      /not currently supported by the WhatsApp provider/i
    );
    assert.equal(getAttachInvoicePdfField("sendWhatsApp").disabled, true);
  });

  it("defaults attachInvoicePdf to false", () => {
    assert.equal(createNodeDefaults("sendWhatsApp").attachInvoicePdf, false);
  });

  it("cannot publish with attachInvoicePdf=true while unsupported", () => {
    const errors = getMessagingFieldErrors(
      whatsappNode({ attachInvoicePdf: true }).data,
      "sendWhatsApp"
    );
    assert.ok(errors.attachInvoicePdf);

    const [trig, end] = triggerAndEnd();
    const result = validateWorkflowGraph(
      [trig, whatsappNode({ attachInvoicePdf: true }), end],
      [
        { id: "e1", source: "n_trig", target: "n_wa" },
        { id: "e2", source: "n_wa", target: "n_end" },
      ]
    );
    assert.equal(result.valid, false);
    assert.ok(
      result.issues.some((i) => i.field === ATTACH_INVOICE_PDF_KEY)
    );
  });

  it("serializes WhatsApp with attachInvoicePdf forced off while unsupported", () => {
    const serialized = serializeNode(
      whatsappNode({ attachInvoicePdf: true, attach_invoice_pdf: true })
    );
    assert.equal(serialized.data.attachInvoicePdf, false);
    assert.equal(serialized.data.message, "Hello {{patient_name}}");
    assert.equal(serialized.data.recipient, "patient");
  });
});

describe("Attach Invoice PDF — catalog isolation", () => {
  it("does not introduce {{invoice_pdf}} as a body variable", () => {
    const allKeys = WORKFLOW_VARIABLE_GROUPS.flatMap((g) =>
      g.variables.map((v) => v.key)
    );
    assert.equal(allKeys.includes("invoice_pdf"), false);
    const coreKeys = CORE_VARIABLE_GROUPS.flatMap((g) => g.keys);
    assert.equal(coreKeys.includes("invoice_pdf"), false);
  });

  it("keeps existing Patient/Invoice tokens and Email/WhatsApp catalog types", () => {
    const invoice = WORKFLOW_VARIABLE_GROUPS.find((g) => g.label === "Invoice");
    assert.ok(invoice.variables.some((v) => v.key === "invoice_id"));
    assert.ok(invoice.variables.some((v) => v.key === "invoice_amount"));
    assert.equal(getWorkflowNode("sendEmail")?.customPanel, "messaging");
    assert.equal(getWorkflowNode("sendWhatsApp")?.customPanel, "messaging");
    const emailKeys = getMessagingSchema("sendEmail").fields.map((f) => f.key);
    const waKeys = getMessagingSchema("sendWhatsApp").fields.map((f) => f.key);
    assert.ok(emailKeys.includes("subject"));
    assert.ok(emailKeys.includes("body"));
    assert.ok(waKeys.includes("message"));
    assert.ok(emailKeys.includes("recipient"));
    assert.ok(waKeys.includes("recipient"));
  });
});
