/**
 * Frontend validation + serialization for Digital Prescription Delivery.
 * Aligns with digitalPrescriptionCampaign.workflow.json — not a specialty node.
 * Display name: Digital Prescription Delivery; fixture name: Digital Prescription Share.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { validateWorkflowGraph } from "../validation/workflowGraphValidation.js";
import { serializeWorkflow } from "@/utils/flowSerializer.js";
import {
  deserializeWorkflow,
  extractWorkflowState,
  readCampaignFields,
} from "@/utils/flowDeserializer.js";
import { buildWorkflowPayload } from "@/services/api/workflows.js";
import { getTriggerSchema, TRIGGER_TYPE_ALIASES } from "../config/triggers/index.js";
import {
  findExistingCampaignWorkflow,
  DIGITAL_PRESCRIPTION_CAMPAIGN_KEY,
  DIGITAL_PRESCRIPTION_DELIVERY_NAME,
  campaignKeysMatch,
  workflowNamesMatch,
} from "@/utils/workflowCampaignLookup.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturePath = join(
  __dirname,
  "../../../../automation/node-workflows/digitalPrescriptionCampaign.workflow.json"
);
const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));
const configuration = fixture.workflow.configuration;

function toFlowNodes(config = configuration) {
  return (config.nodes || []).map((n) => ({
    id: n.id,
    type: n.type || "workflow",
    position: n.position || { x: 0, y: 0 },
    data: { ...n.data },
  }));
}

function toFlowEdges(config = configuration) {
  return (config.edges || []).map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    sourceHandle: e.sourceHandle ?? null,
    targetHandle: e.targetHandle ?? null,
  }));
}

describe("digitalPrescriptionDelivery — frontend validation", () => {
  it("identifies campaign by key and display-name aliases", () => {
    assert.equal(configuration.campaignKey, DIGITAL_PRESCRIPTION_CAMPAIGN_KEY);
    assert.equal(fixture.workflow.trigger, "prescriptionAdded");
    assert.equal(
      workflowNamesMatch(fixture.workflow.name, DIGITAL_PRESCRIPTION_DELIVERY_NAME),
      true
    );
  });

  it("digitalPrescription aliases resolve to prescriptionAdded", () => {
    assert.equal(
      TRIGGER_TYPE_ALIASES.digitalPrescription,
      "prescriptionAdded"
    );
    assert.equal(
      TRIGGER_TYPE_ALIASES.digital_prescription,
      "prescriptionAdded"
    );
    assert.equal(
      getTriggerSchema("digitalPrescription"),
      getTriggerSchema("prescriptionAdded")
    );
    assert.ok(getTriggerSchema("prescriptionAdded"));
  });

  it("has required trigger, messaging, and end nodes in order", () => {
    const nodes = configuration.nodes;
    const byType = (t) => nodes.filter((n) => n.data?.nodeType === t);
    assert.equal(byType("prescriptionAdded").length, 1);
    assert.equal(byType("sendWhatsApp").length, 1);
    assert.equal(byType("end").length, 1);
    assert.equal(nodes.length, 3);

    const msg = byType("sendWhatsApp")[0];
    assert.equal(msg.data.recipient, "patient");
    assert.equal(msg.data.campaignStep, "digital_rx_1");
    assert.ok(String(msg.data.message || "").includes("{{pharmacy_link}}"));

    assert.deepEqual(
      configuration.edges.map((e) => `${e.source}->${e.target}`),
      ["n_trigger->n_msg", "n_msg->n_end"]
    );
  });

  it("fixture graph validates", () => {
    const result = validateWorkflowGraph(toFlowNodes(), toFlowEdges(), {
      campaignKey: configuration.campaignKey,
    });
    assert.equal(result.valid, true, JSON.stringify(result.issues, null, 2));
  });

  it("serializes and deserializes campaignKey + graph", () => {
    const nodes = toFlowNodes();
    const edges = toFlowEdges();
    const payload = serializeWorkflow({
      name: DIGITAL_PRESCRIPTION_DELIVERY_NAME,
      nodes,
      edges,
      status: "inactive",
      organizationId: fixture.workflow.organization_id,
      hospitalId: fixture.workflow.hospital_id,
      campaignKey: DIGITAL_PRESCRIPTION_CAMPAIGN_KEY,
    });
    assert.equal(
      payload.configuration.campaignKey,
      DIGITAL_PRESCRIPTION_CAMPAIGN_KEY
    );
    assert.equal(
      payload.configuration.nodes.filter(
        (n) => n.data?.nodeType === "prescriptionAdded"
      ).length,
      1
    );

    const restored = deserializeWorkflow(payload.configuration);
    const campaign = readCampaignFields(payload.configuration);
    assert.equal(campaign.campaignKey, DIGITAL_PRESCRIPTION_CAMPAIGN_KEY);
    assert.equal(restored.campaignKey, DIGITAL_PRESCRIPTION_CAMPAIGN_KEY);
    assert.ok(restored.nodes.some((n) => n.data?.nodeType === "sendWhatsApp"));
    assert.ok(restored.edges.length >= 2);

    const state = extractWorkflowState({
      id: 38,
      name: DIGITAL_PRESCRIPTION_DELIVERY_NAME,
      configuration: payload.configuration,
    });
    assert.equal(state.name, DIGITAL_PRESCRIPTION_DELIVERY_NAME);
    assert.equal(state.campaignKey, DIGITAL_PRESCRIPTION_CAMPAIGN_KEY);
    assert.ok(state.nodes.some((n) => n.data?.nodeType === "prescriptionAdded"));
  });

  it("buildWorkflowPayload round-trip preserves digital prescription graph", () => {
    const nodes = toFlowNodes();
    const edges = toFlowEdges();
    const built = buildWorkflowPayload({
      name: DIGITAL_PRESCRIPTION_DELIVERY_NAME,
      nodes,
      edges,
      status: "inactive",
      organizationId: 2,
      hospitalId: 12,
      campaignKey: DIGITAL_PRESCRIPTION_CAMPAIGN_KEY,
    });
    assert.equal(
      built.configuration.campaignKey,
      DIGITAL_PRESCRIPTION_CAMPAIGN_KEY
    );
    const again = validateWorkflowGraph(
      toFlowNodes(built.configuration),
      toFlowEdges(built.configuration),
      { campaignKey: built.configuration.campaignKey }
    );
    assert.equal(again.valid, true, JSON.stringify(again.issues, null, 2));
  });

  it("prevents duplicate Digital Prescription by campaign key and name aliases", () => {
    assert.equal(
      campaignKeysMatch("digital_prescription", "digitalPrescription"),
      true
    );
    assert.equal(
      campaignKeysMatch(
        "digital_prescription",
        "digital_prescription_delivery"
      ),
      true
    );
    assert.equal(
      workflowNamesMatch(
        "Digital Prescription Delivery",
        "Digital Prescription Share"
      ),
      true
    );

    const byKey = findExistingCampaignWorkflow(
      [
        {
          id: 38,
          name: "Digital Prescription Share",
          configuration: { campaignKey: "digital_prescription" },
        },
      ],
      {
        campaignKey: DIGITAL_PRESCRIPTION_CAMPAIGN_KEY,
        name: DIGITAL_PRESCRIPTION_DELIVERY_NAME,
      }
    );
    assert.equal(byKey?.id, 38);

    const byAliasName = findExistingCampaignWorkflow(
      [{ id: 38, name: "Digital Prescription Share" }],
      {
        campaignKey: DIGITAL_PRESCRIPTION_CAMPAIGN_KEY,
        name: DIGITAL_PRESCRIPTION_DELIVERY_NAME,
      }
    );
    assert.equal(byAliasName?.id, 38);

    const excluded = findExistingCampaignWorkflow(
      [
        {
          id: 38,
          name: DIGITAL_PRESCRIPTION_DELIVERY_NAME,
          configuration: { campaignKey: DIGITAL_PRESCRIPTION_CAMPAIGN_KEY },
        },
      ],
      {
        campaignKey: DIGITAL_PRESCRIPTION_CAMPAIGN_KEY,
        name: DIGITAL_PRESCRIPTION_DELIVERY_NAME,
        excludeId: 38,
      }
    );
    assert.equal(excluded, null);
  });
});
