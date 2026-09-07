/**
 * Campaign fixture alignment — validate all meeting-campaign graphs
 * against the frontend validator + serialization contract.
 * Does not modify firstAppointmentNurturing (covered elsewhere).
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { validateWorkflowGraph } from "../validation/workflowGraphValidation.js";
import { serializeWorkflow } from "@/utils/flowSerializer.js";
import { getMessagingSchema } from "../config/messaging/schemas.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE_DIR = join(__dirname, "../../../../automation/node-workflows");

const CAMPAIGN_FIXTURES = [
  "medicineReminderCampaign.workflow.json",
  "digitalPrescriptionCampaign.workflow.json",
  "postVisitFollowup.workflow.json",
  "missedAppointmentRestart.workflow.json",
  "birthdayWish.workflow.json",
  "womensDayWish.workflow.json",
  "inactivePatient30.workflow.json",
  "inactivePatient90.workflow.json",
  "dentistSegment.workflow.json",
  "seniorPatientSegment.workflow.json",
  "parentChildSegment.workflow.json",
  "firstAppointmentNurturing.workflow.json",
];

function loadFixture(name) {
  return JSON.parse(readFileSync(join(FIXTURE_DIR, name), "utf8"));
}

function toFlowNodes(configuration) {
  return (configuration.nodes || []).map((n) => ({
    id: n.id,
    type: n.type || "workflow",
    position: n.position || { x: 0, y: 0 },
    data: { ...n.data },
  }));
}

function toFlowEdges(configuration) {
  return (configuration.edges || []).map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    sourceHandle: e.sourceHandle ?? null,
    targetHandle: e.targetHandle ?? null,
  }));
}

describe("Campaign fixtures — frontend alignment", () => {
  it("lists expected campaign fixture files on disk", () => {
    const files = new Set(readdirSync(FIXTURE_DIR));
    for (const name of CAMPAIGN_FIXTURES) {
      assert.ok(files.has(name), `missing fixture ${name}`);
    }
  });

  for (const name of CAMPAIGN_FIXTURES) {
    it(`${name} validates and serializes`, () => {
      const fixture = loadFixture(name);
      const configuration = fixture.workflow.configuration;
      assert.ok(configuration.campaignKey, `${name} needs campaignKey`);
      assert.equal(fixture.workflow.status, "inactive");

      const nodes = toFlowNodes(configuration);
      const edges = toFlowEdges(configuration);
      const result = validateWorkflowGraph(nodes, edges, {
        campaignKey: configuration.campaignKey,
        suppressOnAppointment: configuration.suppressOnAppointment ?? false,
      });
      assert.equal(
        result.valid,
        true,
        `${name}: ${JSON.stringify(result.issues, null, 2)}`
      );

      const conditions = nodes.filter((n) => n.data?.nodeType === "condition");
      for (const cond of conditions) {
        const out = edges.filter((e) => e.source === cond.id);
        assert.ok(
          out.some((e) => e.sourceHandle === "true"),
          `${name} ${cond.id} missing true branch`
        );
        assert.ok(
          out.some((e) => e.sourceHandle === "false"),
          `${name} ${cond.id} missing false branch`
        );
      }

      const messaging = nodes.filter((n) =>
        String(n.data?.nodeType || "").startsWith("send")
      );
      for (const msg of messaging) {
        assert.ok(
          msg.data.campaignStep,
          `${name} ${msg.id} needs unique campaignStep`
        );
        assert.ok(msg.data.recipient, `${name} ${msg.id} needs recipient`);
      }

      const payload = serializeWorkflow({
        name: fixture.workflow.name,
        nodes,
        edges,
        status: "inactive",
        organizationId: fixture.workflow.organization_id,
        hospitalId: fixture.workflow.hospital_id,
        campaignKey: configuration.campaignKey,
        suppressOnAppointment: configuration.suppressOnAppointment ?? null,
      });
      assert.equal(payload.configuration.campaignKey, configuration.campaignKey);
      assert.ok(
        payload.configuration.nodes.every((n) => n.data?.nodeType),
        `${name} serialization lost nodeType`
      );
    });
  }

  it("messaging schemas expose recipient and campaignStep for WA/SMS/Push", () => {
    for (const type of ["sendWhatsApp", "sendSms", "sendPush"]) {
      const schema = getMessagingSchema(type);
      const keys = (schema.fields || []).map((f) => f.key);
      assert.ok(keys.includes("recipient"), `${type} missing recipient`);
      assert.ok(keys.includes("campaignStep"), `${type} missing campaignStep`);
    }
  });

  it("missedAppointmentRestart meta campaignKey matches configuration", () => {
    const fixture = loadFixture("missedAppointmentRestart.workflow.json");
    assert.equal(fixture.meta.campaignKey, "missed_appointment_restart");
    assert.equal(
      fixture.workflow.configuration.campaignKey,
      "missed_appointment_restart"
    );
  });

  it("segment campaigns are separate workflows with unique keys", () => {
    const dentist = loadFixture("dentistSegment.workflow.json");
    const senior = loadFixture("seniorPatientSegment.workflow.json");
    const parent = loadFixture("parentChildSegment.workflow.json");
    const keys = new Set([
      dentist.workflow.configuration.campaignKey,
      senior.workflow.configuration.campaignKey,
      parent.workflow.configuration.campaignKey,
    ]);
    assert.equal(keys.size, 3);
  });
});
