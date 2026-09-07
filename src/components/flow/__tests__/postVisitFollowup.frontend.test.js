/**
 * Frontend validation + serialization for Post-Visit Follow-up campaign.
 * Aligns with postVisitFollowup.workflow.json — not a specialty node.
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
import { getTriggerSchema } from "../config/triggers/index.js";
import {
  findExistingCampaignWorkflow,
  POST_VISIT_FOLLOWUP_CAMPAIGN_KEY,
  POST_VISIT_FOLLOWUP_NAME,
  campaignKeysMatch,
  workflowNamesMatch,
} from "@/utils/workflowCampaignLookup.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturePath = join(
  __dirname,
  "../../../../automation/node-workflows/postVisitFollowup.workflow.json"
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

describe("postVisitFollowup — frontend validation", () => {
  it("identifies campaign by key and display-name aliases", () => {
    assert.equal(configuration.campaignKey, POST_VISIT_FOLLOWUP_CAMPAIGN_KEY);
    assert.equal(fixture.workflow.name, POST_VISIT_FOLLOWUP_NAME);
    assert.equal(fixture.workflow.trigger, "appointmentCompleted");
    assert.equal(
      workflowNamesMatch("Post Visit Follow-up", POST_VISIT_FOLLOWUP_NAME),
      true
    );
  });

  it("appointmentCompleted trigger is registered with requireFollowUp", () => {
    const schema = getTriggerSchema("appointmentCompleted");
    assert.ok(schema);
    const field = (schema.fields || []).find((f) => f.key === "requireFollowUp");
    assert.ok(field);
    assert.equal(
      configuration.nodes.find((n) => n.data?.nodeType === "appointmentCompleted")
        ?.data?.requireFollowUp,
      "yes"
    );
  });

  it("has required graph structure from fixture", () => {
    const nodes = configuration.nodes;
    const byType = (t) => nodes.filter((n) => n.data?.nodeType === t);
    assert.equal(byType("appointmentCompleted").length, 1);
    assert.equal(byType("condition").length, 1);
    assert.equal(byType("wait").length, 2);
    assert.equal(byType("sendWhatsApp").length, 2);
    assert.equal(byType("sendSms").length, 1);
    assert.equal(byType("end").length, 2);
    assert.equal(nodes.length, 9);

    const cond = byType("condition")[0];
    assert.equal(cond.data.expression, "followup.exists == true");

    const waits = byType("wait");
    assert.ok(waits.every((w) => w.data.waitType === "relative_date"));
    assert.ok(
      waits.some(
        (w) =>
          w.data.relativeOffsetDirection === "before" &&
          w.data.relativeOffsetAmount === 4
      )
    );
    assert.ok(
      waits.some((w) => w.data.relativeOffsetDirection === "on")
    );

    const edgePairs = configuration.edges.map(
      (e) =>
        `${e.source}->${e.target}${e.sourceHandle ? `:${e.sourceHandle}` : ""}`
    );
    assert.ok(edgePairs.includes("n_trigger->n_cond_fu"));
    assert.ok(edgePairs.includes("n_cond_fu->n_msg_doctor:true"));
    assert.ok(edgePairs.includes("n_cond_fu->n_end_nofu:false"));
    assert.ok(edgePairs.includes("n_msg_lastday->n_end_ok"));
  });

  it("fixture graph validates with both condition branches", () => {
    const result = validateWorkflowGraph(toFlowNodes(), toFlowEdges(), {
      campaignKey: configuration.campaignKey,
      suppressOnAppointment: configuration.suppressOnAppointment,
    });
    assert.equal(result.valid, true, JSON.stringify(result.issues, null, 2));
  });

  it("serializes and deserializes campaignKey + graph", () => {
    const nodes = toFlowNodes();
    const edges = toFlowEdges();
    const payload = serializeWorkflow({
      name: POST_VISIT_FOLLOWUP_NAME,
      nodes,
      edges,
      status: "inactive",
      organizationId: fixture.workflow.organization_id,
      hospitalId: fixture.workflow.hospital_id,
      campaignKey: POST_VISIT_FOLLOWUP_CAMPAIGN_KEY,
      suppressOnAppointment: false,
    });
    assert.equal(
      payload.configuration.campaignKey,
      POST_VISIT_FOLLOWUP_CAMPAIGN_KEY
    );
    assert.equal(
      payload.configuration.nodes.filter(
        (n) => n.data?.nodeType === "appointmentCompleted"
      ).length,
      1
    );

    const restored = deserializeWorkflow(payload.configuration);
    const campaign = readCampaignFields(payload.configuration);
    assert.equal(campaign.campaignKey, POST_VISIT_FOLLOWUP_CAMPAIGN_KEY);
    assert.equal(restored.campaignKey, POST_VISIT_FOLLOWUP_CAMPAIGN_KEY);
    assert.ok(restored.nodes.some((n) => n.data?.nodeType === "condition"));
    assert.ok(
      restored.edges.some(
        (e) => e.sourceHandle === "true" || e.sourceHandle === "false"
      )
    );

    const state = extractWorkflowState({
      id: 40,
      name: POST_VISIT_FOLLOWUP_NAME,
      configuration: payload.configuration,
    });
    assert.equal(state.name, POST_VISIT_FOLLOWUP_NAME);
    assert.equal(state.campaignKey, POST_VISIT_FOLLOWUP_CAMPAIGN_KEY);
  });

  it("buildWorkflowPayload round-trip preserves post-visit graph", () => {
    const built = buildWorkflowPayload({
      name: POST_VISIT_FOLLOWUP_NAME,
      nodes: toFlowNodes(),
      edges: toFlowEdges(),
      status: "inactive",
      organizationId: 2,
      hospitalId: 12,
      campaignKey: POST_VISIT_FOLLOWUP_CAMPAIGN_KEY,
      suppressOnAppointment: false,
    });
    assert.equal(
      built.configuration.campaignKey,
      POST_VISIT_FOLLOWUP_CAMPAIGN_KEY
    );
    const again = validateWorkflowGraph(
      toFlowNodes(built.configuration),
      toFlowEdges(built.configuration),
      {
        campaignKey: built.configuration.campaignKey,
        suppressOnAppointment: built.configuration.suppressOnAppointment,
      }
    );
    assert.equal(again.valid, true, JSON.stringify(again.issues, null, 2));
  });

  it("prevents duplicate Post-Visit Follow-up by campaign key and name aliases", () => {
    assert.equal(
      campaignKeysMatch("post_visit_followup", "postVisitFollowup"),
      true
    );
    assert.equal(
      workflowNamesMatch("Post-Visit Follow-up", "Post Visit Follow-up"),
      true
    );

    const byKey = findExistingCampaignWorkflow(
      [
        {
          id: 40,
          name: "Post Visit Follow-up",
          configuration: { campaignKey: "post_visit_followup" },
        },
      ],
      {
        campaignKey: POST_VISIT_FOLLOWUP_CAMPAIGN_KEY,
        name: POST_VISIT_FOLLOWUP_NAME,
      }
    );
    assert.equal(byKey?.id, 40);

    const byAliasName = findExistingCampaignWorkflow(
      [{ id: 40, name: "Post Visit Followup" }],
      {
        campaignKey: POST_VISIT_FOLLOWUP_CAMPAIGN_KEY,
        name: POST_VISIT_FOLLOWUP_NAME,
      }
    );
    assert.equal(byAliasName?.id, 40);

    const excluded = findExistingCampaignWorkflow(
      [
        {
          id: 40,
          name: POST_VISIT_FOLLOWUP_NAME,
          configuration: { campaignKey: POST_VISIT_FOLLOWUP_CAMPAIGN_KEY },
        },
      ],
      {
        campaignKey: POST_VISIT_FOLLOWUP_CAMPAIGN_KEY,
        name: POST_VISIT_FOLLOWUP_NAME,
        excludeId: 40,
      }
    );
    assert.equal(excluded, null);
  });
});
