/**
 * Frontend validation + serialization for Missed Appointment Restart.
 * Condition must be appointment.status == "confirmed" (lowercase).
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
} from "@/utils/flowDeserializer.js";
import { buildWorkflowPayload } from "@/services/api/workflows.js";
import { validateConditionNodeFields } from "../panels/conditions/conditionValidation.js";
import { CONDITION_FIELD_GROUPS } from "../config/variables.js";
import { CORE_VARIABLE_GROUPS } from "@/utils/workflowVariableTokens.js";
import {
  JEXL_CONDITION_EXAMPLES,
  tokenToJexlPath,
  validateJexlSyntax,
  evaluateJexlCondition,
} from "@/runtime/engines/jexlCondition.js";

const CONFIRMED_EXPRESSION = 'appointment.status == "confirmed"';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturePath = join(
  __dirname,
  "../../../../automation/node-workflows/missedAppointmentRestart.workflow.json"
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

function conditionNode(config = configuration) {
  return (config.nodes || []).find((n) => n.id === "n_cond");
}

describe("missedAppointmentRestart — condition expression", () => {
  it("stores appointment.status == \"confirmed\" (lowercase)", () => {
    const cond = conditionNode();
    assert.ok(cond);
    assert.equal(cond.data.nodeType, "condition");
    assert.equal(cond.data.expression, CONFIRMED_EXPRESSION);
    assert.equal(cond.data.expression.includes("Confirmed"), false);
    assert.equal(cond.data.expression.includes("appointment.exists"), false);
  });

  it("TRUE connects to Send SMS and FALSE connects to End", () => {
    const trueEdge = configuration.edges.find(
      (e) => e.source === "n_cond" && e.sourceHandle === "true"
    );
    const falseEdge = configuration.edges.find(
      (e) => e.source === "n_cond" && e.sourceHandle === "false"
    );
    assert.ok(trueEdge);
    assert.ok(falseEdge);

    const sms = configuration.nodes.find((n) => n.id === trueEdge.target);
    const endNode = configuration.nodes.find((n) => n.id === falseEdge.target);
    assert.equal(sms?.data?.nodeType, "sendSms");
    assert.equal(endNode?.data?.nodeType, "end");
    assert.equal(trueEdge.target, "n_msg_2");
    assert.equal(falseEdge.target, "n_end_booked");
  });

  it("preserves node ids: trigger → WhatsApp → wait → condition → SMS / End", () => {
    const ids = configuration.nodes.map((n) => n.id);
    assert.deepEqual(
      [
        "n_trigger",
        "n_msg_1",
        "n_wait",
        "n_cond",
        "n_msg_2",
        "n_end_ok",
        "n_end_booked",
      ].every((id) => ids.includes(id)),
      true
    );
    const edges = configuration.edges.map(
      (e) => `${e.source}->${e.target}${e.sourceHandle ? `:${e.sourceHandle}` : ""}`
    );
    assert.ok(edges.includes("n_trigger->n_msg_1"));
    assert.ok(edges.includes("n_msg_1->n_wait"));
    assert.ok(edges.includes("n_wait->n_cond"));
    assert.ok(edges.includes("n_cond->n_msg_2:true"));
    assert.ok(edges.includes("n_cond->n_end_booked:false"));
    assert.ok(edges.includes("n_msg_2->n_end_ok"));
  });

  it("fixture graph validates", () => {
    const result = validateWorkflowGraph(toFlowNodes(), toFlowEdges(), {
      campaignKey: configuration.campaignKey,
    });
    assert.equal(result.valid, true, JSON.stringify(result.issues, null, 2));
  });
});

describe("missedAppointmentRestart — condition panel catalog", () => {
  it("variable catalog includes appointment.status", () => {
    const appointment = CONDITION_FIELD_GROUPS.find(
      (g) => g.label === "Appointment"
    );
    assert.ok(appointment);
    const values = appointment.options.map((o) => o.value);
    assert.ok(values.includes("appointment.status"));
    assert.equal(values.filter((v) => v === "appointment.status").length, 1);
    assert.equal(values.includes("appointment_status"), false);
  });

  it("core appointment variables include status (maps to JEXL appointment.status)", () => {
    const appointment = CORE_VARIABLE_GROUPS.find(
      (g) => g.label === "Appointment"
    );
    assert.ok(appointment.keys.includes("appointment_status"));
    assert.equal(tokenToJexlPath("{{appointment_status}}"), "appointment.status");
    assert.equal(tokenToJexlPath("appointment.status"), "appointment.status");
  });

  it("examples include confirmed lowercase and keep generic appointment.exists", () => {
    assert.ok(JEXL_CONDITION_EXAMPLES.includes(CONFIRMED_EXPRESSION));
    assert.ok(JEXL_CONDITION_EXAMPLES.includes("appointment.exists == false"));
    assert.equal(
      JEXL_CONDITION_EXAMPLES.some((ex) => ex.includes('"Confirmed"')),
      false
    );
  });

  it("generic validator accepts confirmed expression and other JEXL", () => {
    assert.equal(validateJexlSyntax(CONFIRMED_EXPRESSION).ok, true);
    assert.equal(validateJexlSyntax("appointment.exists == false").ok, true);
    assert.equal(validateJexlSyntax("patient.age >= 60").ok, true);
    assert.equal(validateJexlSyntax("followup.exists == true").ok, true);
    assert.equal(validateConditionNodeFields({ expression: CONFIRMED_EXPRESSION }).length, 0);
    assert.equal(
      validateConditionNodeFields({ expression: "patient.age >= 18" }).length,
      0
    );
  });

  it("node card / panel summary is the same stored expression", () => {
    const expr = String(conditionNode().data.expression || "").trim();
    assert.equal(expr, CONFIRMED_EXPRESSION);
  });
});

describe("missedAppointmentRestart — save / reload", () => {
  it("serialize then deserialize keeps expression and branch edges", () => {
    const payload = serializeWorkflow({
      name: fixture.workflow.name,
      nodes: toFlowNodes(),
      edges: toFlowEdges(),
      status: "inactive",
      organizationId: fixture.workflow.organization_id,
      hospitalId: fixture.workflow.hospital_id,
      campaignKey: configuration.campaignKey,
    });

    const savedCond = payload.configuration.nodes.find((n) => n.id === "n_cond");
    assert.equal(savedCond.data.expression, CONFIRMED_EXPRESSION);

    const restored = deserializeWorkflow(payload.configuration);
    const cond = restored.nodes.find((n) => n.id === "n_cond");
    assert.equal(cond.data.expression, CONFIRMED_EXPRESSION);

    const trueEdge = restored.edges.find(
      (e) => e.source === "n_cond" && e.sourceHandle === "true"
    );
    const falseEdge = restored.edges.find(
      (e) => e.source === "n_cond" && e.sourceHandle === "false"
    );
    assert.equal(trueEdge.target, "n_msg_2");
    assert.equal(falseEdge.target, "n_end_booked");
  });

  it("buildWorkflowPayload round-trips the confirmed expression", () => {
    const payload = buildWorkflowPayload({
      name: fixture.workflow.name,
      nodes: toFlowNodes(),
      edges: toFlowEdges(),
      status: "inactive",
      organizationId: fixture.workflow.organization_id,
      hospitalId: fixture.workflow.hospital_id,
      campaignKey: configuration.campaignKey,
    });
    const cond = payload.configuration.nodes.find((n) => n.id === "n_cond");
    assert.equal(cond.data.expression, CONFIRMED_EXPRESSION);

    const extracted = extractWorkflowState({
      data: {
        name: fixture.workflow.name,
        status: "inactive",
        configuration: payload.configuration,
      },
    });
    const extractedCond = extracted.nodes.find((n) => n.id === "n_cond");
    assert.equal(extractedCond.data.expression, CONFIRMED_EXPRESSION);
  });
});

describe("missedAppointmentRestart — generic JEXL still evaluates", () => {
  it("confirmed status is true only for lowercase confirmed", async () => {
    assert.equal(
      await evaluateJexlCondition(CONFIRMED_EXPRESSION, {
        appointment: { status: "confirmed" },
      }),
      true
    );
    assert.equal(
      await evaluateJexlCondition(CONFIRMED_EXPRESSION, {
        appointment: { status: "Confirmed" },
      }),
      false
    );
    assert.equal(
      await evaluateJexlCondition("appointment.exists == false", {
        appointment: { exists: false },
      }),
      true
    );
  });
});
