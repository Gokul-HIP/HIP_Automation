/**
 * Frontend validation + serialization for Medicine Reminder campaign.
 * Aligns with medicineReminderCampaign.workflow.json — not a specialty node.
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
import {
  findExistingCampaignWorkflow,
  MEDICINE_REMINDER_CAMPAIGN_KEY,
  MEDICINE_REMINDER_NAME,
  campaignKeysMatch,
  workflowNamesMatch,
} from "@/utils/workflowCampaignLookup.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturePath = join(
  __dirname,
  "../../../../automation/node-workflows/medicineReminderCampaign.workflow.json"
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

describe("medicineReminder — frontend validation", () => {
  it("identifies campaign by key and display name", () => {
    assert.equal(configuration.campaignKey, MEDICINE_REMINDER_CAMPAIGN_KEY);
    assert.equal(fixture.workflow.name, MEDICINE_REMINDER_NAME);
    assert.equal(fixture.workflow.trigger, "medicineReminder");
  });

  it("has required trigger, messaging, and end nodes in order", () => {
    const nodes = configuration.nodes;
    const byType = (t) => nodes.filter((n) => n.data?.nodeType === t);
    assert.equal(byType("medicineReminder").length, 1);
    assert.equal(byType("sendWhatsApp").length, 1);
    assert.equal(byType("end").length, 1);
    assert.equal(nodes.length, 3);

    const trigger = byType("medicineReminder")[0];
    assert.equal(trigger.data.reminderTiming, "at_due");
    assert.equal(trigger.data.minutesBefore, 30);

    const msg = byType("sendWhatsApp")[0];
    assert.equal(msg.data.recipient, "patient");
    assert.equal(msg.data.campaignStep, "medicine_reminder_1");
    assert.ok(String(msg.data.message || "").includes("{{medicine_name}}"));

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
      name: MEDICINE_REMINDER_NAME,
      nodes,
      edges,
      status: "inactive",
      organizationId: fixture.workflow.organization_id,
      hospitalId: fixture.workflow.hospital_id,
      campaignKey: MEDICINE_REMINDER_CAMPAIGN_KEY,
    });
    assert.equal(payload.configuration.campaignKey, MEDICINE_REMINDER_CAMPAIGN_KEY);
    assert.equal(
      payload.configuration.nodes.filter((n) => n.data?.nodeType === "medicineReminder")
        .length,
      1
    );

    const restored = deserializeWorkflow(payload.configuration);
    const campaign = readCampaignFields(payload.configuration);
    assert.equal(campaign.campaignKey, MEDICINE_REMINDER_CAMPAIGN_KEY);
    assert.equal(restored.campaignKey, MEDICINE_REMINDER_CAMPAIGN_KEY);
    assert.ok(restored.nodes.some((n) => n.data?.nodeType === "sendWhatsApp"));
    assert.ok(restored.edges.length >= 2);

    const state = extractWorkflowState({
      id: 11,
      name: MEDICINE_REMINDER_NAME,
      configuration: payload.configuration,
    });
    assert.equal(state.name, MEDICINE_REMINDER_NAME);
    assert.equal(state.campaignKey, MEDICINE_REMINDER_CAMPAIGN_KEY);
    assert.ok(state.nodes.some((n) => n.data?.nodeType === "medicineReminder"));
  });

  it("buildWorkflowPayload round-trip preserves medicine reminder graph", () => {
    const nodes = toFlowNodes();
    const edges = toFlowEdges();
    const built = buildWorkflowPayload({
      name: MEDICINE_REMINDER_NAME,
      nodes,
      edges,
      status: "inactive",
      organizationId: 2,
      hospitalId: 12,
      campaignKey: MEDICINE_REMINDER_CAMPAIGN_KEY,
    });
    assert.equal(built.configuration.campaignKey, MEDICINE_REMINDER_CAMPAIGN_KEY);
    const again = validateWorkflowGraph(
      toFlowNodes(built.configuration),
      toFlowEdges(built.configuration),
      { campaignKey: built.configuration.campaignKey }
    );
    assert.equal(again.valid, true, JSON.stringify(again.issues, null, 2));
  });

  it("prevents duplicate Medicine Reminder by campaign key and name aliases", () => {
    assert.equal(
      campaignKeysMatch("medicine_reminder", "medicineReminder"),
      true
    );
    assert.equal(
      workflowNamesMatch("Medicine Reminder", "Medicine Remainder"),
      true
    );

    const byKey = findExistingCampaignWorkflow(
      [
        {
          id: 11,
          name: "Medicine Remainder",
          configuration: { campaignKey: "medicine_reminder" },
        },
      ],
      {
        campaignKey: MEDICINE_REMINDER_CAMPAIGN_KEY,
        name: MEDICINE_REMINDER_NAME,
      }
    );
    assert.equal(byKey?.id, 11);

    const byAliasName = findExistingCampaignWorkflow(
      [{ id: 11, name: "Medicine Remainder" }],
      {
        campaignKey: MEDICINE_REMINDER_CAMPAIGN_KEY,
        name: MEDICINE_REMINDER_NAME,
      }
    );
    assert.equal(byAliasName?.id, 11);

    const excluded = findExistingCampaignWorkflow(
      [
        {
          id: 11,
          name: MEDICINE_REMINDER_NAME,
          configuration: { campaignKey: MEDICINE_REMINDER_CAMPAIGN_KEY },
        },
      ],
      {
        campaignKey: MEDICINE_REMINDER_CAMPAIGN_KEY,
        name: MEDICINE_REMINDER_NAME,
        excludeId: 11,
      }
    );
    assert.equal(excluded, null);
  });
});
