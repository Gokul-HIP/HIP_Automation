/**
 * Frontend validation + serialization for firstAppointmentNurturing.
 * Does not import React hooks — uses pure validators / serializers.
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
import { getMessagingFieldErrors } from "../panels/messaging/messagingUx.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturePath = join(
  __dirname,
  "../../../../automation/node-workflows/firstAppointmentNurturing.workflow.json"
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

describe("firstAppointmentNurturing — frontend validation", () => {
  it("fixture graph validates: one trigger, waits, messages, conditions, ends", () => {
    const result = validateWorkflowGraph(toFlowNodes(), toFlowEdges(), {
      campaignKey: configuration.campaignKey,
      suppressOnAppointment: configuration.suppressOnAppointment,
    });
    assert.equal(result.valid, true, JSON.stringify(result.issues, null, 2));
  });

  it("has required node type counts and main path order", () => {
    const nodes = configuration.nodes;
    const byType = (t) => nodes.filter((n) => n.data?.nodeType === t);
    assert.equal(byType("patientRegistered").length, 1);
    assert.equal(byType("wait").length, 4);
    assert.equal(byType("condition").length, 4);
    assert.equal(byType("sendWhatsApp").length, 2);
    assert.equal(byType("sendSms").length, 1);
    assert.equal(byType("sendPush").length, 1);
    assert.ok(byType("end").length >= 1);

    const waits = byType("wait");
    assert.deepEqual(
      waits.map((w) => `${w.data.amount}:${w.data.unit}`),
      ["7:days", "2:days", "24:hours", "2:hours"]
    );

    for (const c of byType("condition")) {
      assert.equal(c.data.expression, "appointment.exists == false");
    }

    const steps = ["n_msg_1", "n_msg_2", "n_msg_3", "n_msg_4"].map((id) =>
      nodes.find((n) => n.id === id)
    );
    assert.deepEqual(
      steps.map((n) => n.data.campaignStep),
      ["nurture_1", "nurture_2", "nurture_3", "nurture_4"]
    );
    assert.deepEqual(
      steps.map((n) => n.data.nodeType),
      ["sendWhatsApp", "sendSms", "sendPush", "sendWhatsApp"]
    );
    assert.ok(steps.every((n) => n.data.recipient === "patient"));
  });

  it("main path edges and every condition false branch to end", () => {
    const edges = configuration.edges;
    const main = [
      ["n_patientRegistered", "n_wait_7d", null],
      ["n_wait_7d", "n_cond_1", null],
      ["n_cond_1", "n_msg_1", "true"],
      ["n_msg_1", "n_wait_2d", null],
      ["n_wait_2d", "n_cond_2", null],
      ["n_cond_2", "n_msg_2", "true"],
      ["n_msg_2", "n_wait_24h", null],
      ["n_wait_24h", "n_cond_3", null],
      ["n_cond_3", "n_msg_3", "true"],
      ["n_msg_3", "n_wait_2h", null],
      ["n_wait_2h", "n_cond_4", null],
      ["n_cond_4", "n_msg_4", "true"],
      ["n_msg_4", "n_end_success", null],
    ];
    for (const [source, target, handle] of main) {
      const hit = edges.find(
        (e) =>
          e.source === source &&
          e.target === target &&
          (handle == null
            ? e.sourceHandle == null || e.sourceHandle === undefined
            : e.sourceHandle === handle)
      );
      assert.ok(hit, `missing edge ${source} → ${target} (${handle})`);
    }

    const falseBranches = edges.filter((e) => e.sourceHandle === "false");
    assert.equal(falseBranches.length, 4);
    const endIds = new Set(
      configuration.nodes
        .filter((n) => n.data?.nodeType === "end")
        .map((n) => n.id)
    );
    assert.ok(falseBranches.every((e) => endIds.has(e.target)));
  });

  it("requires true and false branches on every condition", () => {
    const edges = toFlowEdges().filter(
      (e) => !(e.source === "n_cond_1" && e.sourceHandle === "false")
    );
    const result = validateWorkflowGraph(toFlowNodes(), edges, {
      campaignKey: "first_appointment_nurturing",
      suppressOnAppointment: true,
    });
    assert.equal(result.valid, false);
    assert.ok(
      result.issues.some(
        (i) => i.nodeId === "n_cond_1" && /False branch/i.test(i.message)
      )
    );
  });

  it("requires campaignKey when suppressOnAppointment is true", () => {
    const result = validateWorkflowGraph(toFlowNodes(), toFlowEdges(), {
      campaignKey: "",
      suppressOnAppointment: true,
    });
    assert.equal(result.valid, false);
    assert.ok(result.issues.some((i) => i.field === "campaignKey"));
  });

  it("messaging nodes accept empty templateId with body/title content", () => {
    for (const id of ["n_msg_1", "n_msg_2", "n_msg_3", "n_msg_4"]) {
      const node = configuration.nodes.find((n) => n.id === id);
      const errors = getMessagingFieldErrors(node.data, node.data.nodeType);
      assert.deepEqual(errors, {}, `${id} should have valid content`);
    }
  });
});

describe("firstAppointmentNurturing — frontend serialization", () => {
  it("serializeWorkflow persists nodeType, data, campaignKey, suppressOnAppointment", () => {
    const payload = serializeWorkflow({
      name: fixture.workflow.name,
      nodes: toFlowNodes(),
      edges: toFlowEdges(),
      status: "inactive",
      organizationId: 2,
      hospitalId: 12,
      campaignKey: "first_appointment_nurturing",
      suppressOnAppointment: true,
    });

    assert.equal(payload.configuration.campaignKey, "first_appointment_nurturing");
    assert.equal(payload.configuration.suppressOnAppointment, true);
    assert.ok(payload.configuration.builderVersion);
    assert.ok(payload.configuration.reactFlowVersion);

    const msg1 = payload.configuration.nodes.find((n) => n.id === "n_msg_1");
    assert.equal(msg1.data.nodeType, "sendWhatsApp");
    assert.ok(String(msg1.data.message || "").length > 0);
    assert.equal(msg1.data.templateId, "");

    // No React Flow runtime fields
    assert.equal("selected" in msg1, false);
    assert.equal("dragging" in msg1, false);
  });

  it("buildWorkflowPayload round-trips campaign fields", () => {
    const payload = buildWorkflowPayload({
      name: fixture.workflow.name,
      nodes: toFlowNodes(),
      edges: toFlowEdges(),
      status: "inactive",
      organizationId: 2,
      hospitalId: 12,
      campaignKey: "first_appointment_nurturing",
      suppressOnAppointment: true,
      triggerKey: "patientRegistered",
    });
    assert.equal(payload.configuration.campaignKey, "first_appointment_nurturing");
    assert.equal(payload.configuration.suppressOnAppointment, true);
    assert.equal(payload.trigger, "patientRegistered");
  });

  it("extractWorkflowState restores campaign fields from API-shaped response", () => {
    const state = extractWorkflowState({
      data: {
        id: 99,
        name: fixture.workflow.name,
        status: "inactive",
        organization_id: 2,
        hospital_id: 12,
        configuration,
      },
    });
    assert.equal(state.campaignKey, "first_appointment_nurturing");
    assert.equal(state.suppressOnAppointment, true);
    assert.ok(state.nodes.some((n) => n.data?.nodeType === "patientRegistered"));
  });

  it("deserializeWorkflow keeps condition sourceHandles", () => {
    const { edges, campaignKey, suppressOnAppointment } =
      deserializeWorkflow(configuration);
    assert.equal(campaignKey, "first_appointment_nurturing");
    assert.equal(suppressOnAppointment, true);
    const falseBranches = edges.filter((e) => e.sourceHandle === "false");
    assert.equal(falseBranches.length, 4);
    assert.ok(falseBranches.every((e) => e.target === "n_end_booked"));
  });

  it("readCampaignFields tolerates snake_case aliases", () => {
    const fields = readCampaignFields({
      campaign_key: "first_appointment_nurturing",
      suppress_on_appointment: true,
    });
    assert.equal(fields.campaignKey, "first_appointment_nurturing");
    assert.equal(fields.suppressOnAppointment, true);
  });
});
