/**
 * Attach Prescription PDF — Send Email / Send WhatsApp.
 * Independent of attachInvoicePdf. Not a {{prescription_pdf}} body variable.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import {
  createNodeDefaults,
  getWorkflowNode,
} from "../config/workflowNodes.js";
import {
  getMessagingSchema,
  ATTACH_INVOICE_PDF_KEY,
  ATTACH_PRESCRIPTION_PDF_KEY,
  getAttachPrescriptionPdfField,
} from "../config/messaging/schemas.js";
import { WORKFLOW_VARIABLE_GROUPS } from "../config/variables.js";
import { CORE_VARIABLE_GROUPS } from "@/utils/workflowVariableTokens.js";
import { getMessagingFieldErrors } from "../panels/messaging/messagingUx.js";
import { serializeNode } from "@/utils/flowSerializer.js";
import { deserializeNode } from "@/utils/flowDeserializer.js";
import { validateWorkflowGraph } from "../validation/workflowGraphValidation.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const prescriptionFixture = JSON.parse(
  readFileSync(
    join(
      __dirname,
      "../../../../automation/node-workflows/digitalPrescriptionCampaign.workflow.json"
    ),
    "utf8"
  )
);

function emailNode(overrides = {}) {
  return {
    id: "n_email",
    type: "workflow",
    position: { x: 0, y: 0 },
    data: {
      ...createNodeDefaults("sendEmail"),
      subject: "Your prescription",
      body: "Hello {{patient_name}} from {{hospital_name}}",
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
      message: "Hello {{patient_name}} — Dr {{doctor_name}}",
      ...overrides,
    },
  };
}

function prescriptionGraph(extraNodes, extraEdges) {
  const trig = {
    id: "n_trig",
    type: "workflow",
    position: { x: 0, y: 0 },
    data: createNodeDefaults("prescriptionAdded"),
  };
  const end = {
    id: "n_end",
    type: "workflow",
    position: { x: 400, y: 0 },
    data: createNodeDefaults("end"),
  };
  return {
    nodes: [trig, ...extraNodes, end],
    edges: extraEdges,
    trig,
    end,
  };
}

describe("Attach Prescription PDF — Send Email", () => {
  it("shows Attach Prescription PDF in the email schema", () => {
    const schema = getMessagingSchema("sendEmail");
    const field = schema.fields.find((f) => f.key === ATTACH_PRESCRIPTION_PDF_KEY);
    assert.ok(field);
    assert.equal(field.label, "Attach Prescription PDF");
    assert.equal(field.type, "boolean");
    assert.equal(field.disabled, false);
    assert.equal(
      String(field.description || "").includes("unsupported"),
      false
    );
    const invoice = schema.fields.find((f) => f.key === ATTACH_INVOICE_PDF_KEY);
    assert.equal(invoice.section, "Attachments");
  });

  it("defaults attachPrescriptionPdf to false", () => {
    assert.equal(createNodeDefaults("sendEmail").attachPrescriptionPdf, false);
  });

  it("ON serializes true; deserialize restores true", () => {
    const node = emailNode({
      attachPrescriptionPdf: true,
      recipient: "patient",
      campaignStep: "rx_email_1",
      subject: "Rx for {{patient_name}}",
    });
    const serialized = serializeNode(node);
    assert.equal(serialized.data.attachPrescriptionPdf, true);
    assert.equal("attach_prescription_pdf" in serialized.data, false);
    assert.equal(serialized.data.recipient, "patient");
    assert.equal(serialized.data.campaignStep, "rx_email_1");
    assert.equal(serialized.data.subject, "Rx for {{patient_name}}");

    const restored = deserializeNode(serialized);
    assert.equal(restored.data.attachPrescriptionPdf, true);
    assert.equal(restored.data.recipient, "patient");
    assert.equal(restored.data.body.includes("{{patient_name}}"), true);
  });

  it("OFF serializes false", () => {
    const serialized = serializeNode(emailNode({ attachPrescriptionPdf: false }));
    assert.equal(serialized.data.attachPrescriptionPdf, false);
    assert.equal(deserializeNode(serialized).data.attachPrescriptionPdf, false);
  });

  it("maps snake_case attach_prescription_pdf onto attachPrescriptionPdf", () => {
    const serialized = serializeNode(
      emailNode({
        attachPrescriptionPdf: undefined,
        attach_prescription_pdf: true,
      })
    );
    assert.equal(serialized.data.attachPrescriptionPdf, true);
    assert.equal("attach_prescription_pdf" in serialized.data, false);
  });

  it("keeps attachPrescriptionPdf when other messaging fields change", () => {
    const serialized = serializeNode(
      emailNode({
        attachPrescriptionPdf: true,
        attachInvoicePdf: false,
        recipient: "custom",
        customRecipient: "{{patient_email}}",
        body: "Updated body {{doctor_name}}",
        templateId: "email_rx_v1",
      })
    );
    assert.equal(serialized.data.attachPrescriptionPdf, true);
    assert.equal(serialized.data.attachInvoicePdf, false);
    assert.equal(serialized.data.templateId, "email_rx_v1");
    assert.equal(serialized.data.recipient, "custom");
  });

  it("publish validation allows attachPrescriptionPdf=true", () => {
    const errors = getMessagingFieldErrors(
      emailNode({ attachPrescriptionPdf: true }).data,
      "sendEmail"
    );
    assert.equal(errors.attachPrescriptionPdf, undefined);

    const { nodes, edges } = prescriptionGraph(
      [emailNode({ attachPrescriptionPdf: true })],
      [
        { id: "e1", source: "n_trig", target: "n_email" },
        { id: "e2", source: "n_email", target: "n_end" },
      ]
    );
    const result = validateWorkflowGraph(nodes, edges);
    assert.equal(result.valid, true, JSON.stringify(result.issues, null, 2));
  });
});

describe("Attach Prescription PDF — Send WhatsApp", () => {
  it("shows an enabled Attach Prescription PDF toggle", () => {
    const schema = getMessagingSchema("sendWhatsApp");
    const field = schema.fields.find((f) => f.key === ATTACH_PRESCRIPTION_PDF_KEY);
    assert.ok(field);
    assert.equal(field.label, "Attach Prescription PDF");
    assert.equal(field.disabled, false);
    assert.equal(field.description, undefined);
    assert.equal(
      String(field.description || "").includes("not currently supported"),
      false
    );
    assert.equal(getAttachPrescriptionPdfField("sendWhatsApp").disabled, false);
  });

  it("defaults attachPrescriptionPdf to false", () => {
    assert.equal(createNodeDefaults("sendWhatsApp").attachPrescriptionPdf, false);
  });

  it("ON serializes true through serialize/deserialize", () => {
    const node = whatsappNode({
      attachPrescriptionPdf: true,
      recipient: "patient",
      templateId: "wa_rx_v1",
      campaignStep: "digital_rx_1",
    });
    const serialized = serializeNode(node);
    assert.equal(serialized.data.attachPrescriptionPdf, true);
    assert.equal(serialized.data.message.includes("{{prescription_pdf}}"), false);

    const restored = deserializeNode(serialized);
    assert.equal(restored.data.attachPrescriptionPdf, true);
    assert.equal(restored.data.templateId, "wa_rx_v1");
    assert.equal(restored.data.campaignStep, "digital_rx_1");
  });

  it("OFF serializes false", () => {
    const serialized = serializeNode(
      whatsappNode({ attachPrescriptionPdf: false })
    );
    assert.equal(serialized.data.attachPrescriptionPdf, false);
    assert.equal(deserializeNode(serialized).data.attachPrescriptionPdf, false);
  });

  it("publish validation allows attachPrescriptionPdf=true", () => {
    const errors = getMessagingFieldErrors(
      whatsappNode({ attachPrescriptionPdf: true }).data,
      "sendWhatsApp"
    );
    assert.equal(errors.attachPrescriptionPdf, undefined);

    const { nodes, edges } = prescriptionGraph(
      [whatsappNode({ attachPrescriptionPdf: true })],
      [
        { id: "e1", source: "n_trig", target: "n_wa" },
        { id: "e2", source: "n_wa", target: "n_end" },
      ]
    );
    const result = validateWorkflowGraph(nodes, edges);
    assert.equal(result.valid, true, JSON.stringify(result.issues, null, 2));
  });
});

describe("Invoice + Prescription PDF toggles coexist", () => {
  it("invoice toggle still serializes independently on email", () => {
    const serialized = serializeNode(
      emailNode({ attachInvoicePdf: true, attachPrescriptionPdf: false })
    );
    assert.equal(serialized.data.attachInvoicePdf, true);
    assert.equal(serialized.data.attachPrescriptionPdf, false);
  });

  it("both can be true on the same WhatsApp node", () => {
    const serialized = serializeNode(
      whatsappNode({ attachInvoicePdf: true, attachPrescriptionPdf: true })
    );
    assert.equal(serialized.data.attachInvoicePdf, true);
    assert.equal(serialized.data.attachPrescriptionPdf, true);
    const restored = deserializeNode(serialized);
    assert.equal(restored.data.attachInvoicePdf, true);
    assert.equal(restored.data.attachPrescriptionPdf, true);
  });
});

describe("Prescription PDF — catalog isolation", () => {
  it("does not introduce {{prescription_pdf}} as a body variable", () => {
    const allKeys = WORKFLOW_VARIABLE_GROUPS.flatMap((g) =>
      g.variables.map((v) => v.key)
    );
    assert.equal(allKeys.includes("prescription_pdf"), false);
    const coreKeys = CORE_VARIABLE_GROUPS.flatMap((g) => g.keys);
    assert.equal(coreKeys.includes("prescription_pdf"), false);
  });

  it("keeps existing prescription/medicine tokens and Email/WhatsApp nodes", () => {
    const rx = WORKFLOW_VARIABLE_GROUPS.find((g) => g.label === "Prescription");
    assert.ok(rx.variables.some((v) => v.key === "prescription_id"));
    assert.ok(rx.variables.some((v) => v.key === "pharmacy_link"));
    assert.equal(getWorkflowNode("sendEmail")?.customPanel, "messaging");
    assert.equal(getWorkflowNode("sendWhatsApp")?.customPanel, "messaging");
    const emailKeys = getMessagingSchema("sendEmail").fields.map((f) => f.key);
    const waKeys = getMessagingSchema("sendWhatsApp").fields.map((f) => f.key);
    assert.ok(emailKeys.includes(ATTACH_INVOICE_PDF_KEY));
    assert.ok(emailKeys.includes(ATTACH_PRESCRIPTION_PDF_KEY));
    assert.ok(waKeys.includes(ATTACH_INVOICE_PDF_KEY));
    assert.ok(waKeys.includes(ATTACH_PRESCRIPTION_PDF_KEY));
  });
});

describe("Existing PrescriptionAdded / WhatsApp graphs remain valid", () => {
  it("digitalPrescription campaign fixture still validates", () => {
    const config = prescriptionFixture.workflow.configuration;
    const nodes = (config.nodes || []).map((n) => ({
      id: n.id,
      type: n.type || "workflow",
      position: n.position || { x: 0, y: 0 },
      data: { ...n.data },
    }));
    const edges = (config.edges || []).map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle ?? null,
      targetHandle: e.targetHandle ?? null,
    }));
    const result = validateWorkflowGraph(nodes, edges, {
      campaignKey: config.campaignKey,
    });
    assert.equal(result.valid, true, JSON.stringify(result.issues, null, 2));

    const wa = nodes.find((n) => n.data?.nodeType === "sendWhatsApp");
    assert.ok(wa);
    const roundTrip = serializeNode(wa);
    assert.equal(roundTrip.data.recipient, "patient");
    assert.ok(String(roundTrip.data.message || "").includes("{{pharmacy_link}}"));
    assert.equal(roundTrip.data.attachPrescriptionPdf, false);
    assert.equal(roundTrip.data.attachInvoicePdf, false);
  });
});
