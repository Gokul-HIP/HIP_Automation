/**
 * First Appointment Nurturing — fixture verification + scenario tests.
 * Fixture: automation/node-workflows/firstAppointmentNurturing.workflow.json
 * Uses waitOverrideMs=0 so waits resume immediately in-process.
 */

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import {
  executeWorkflow,
  workflowExecutionStore,
  communicationLogStore,
  onAppointmentBooked,
  setAppointmentLookup,
  clearAppointmentLookup,
  clearMessageIdempotency,
  evaluateJexlCondition,
  enrichAppointmentExists,
  FIRST_APPOINTMENT_NURTURING_CAMPAIGN,
  channelManager,
  buildMessageIdempotencyKey,
  hasSentMessage,
  markMessageSent,
} from "../index.js";
import { ActionDispatcher } from "../dispatch/ActionDispatcher.js";
import { templateManager } from "../templates/TemplateManager.js";
import { variableResolver } from "../variables/VariableResolver.js";
import { delayScheduler } from "../engines/DelayScheduler.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturePath = join(
  __dirname,
  "../../../automation/node-workflows/firstAppointmentNurturing.workflow.json"
);
const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));
const configuration = fixture.workflow.configuration;

function basePatient(overrides = {}) {
  return {
    id: "p_1001",
    name: "Asha Verma",
    mobile: "+919876543210",
    email: "asha@example.com",
    ...overrides,
  };
}

function baseHospital(overrides = {}) {
  return {
    id: 12,
    name: "Sunrise Hospital",
    phone: "+911123456789",
    booking_link: "https://book.sunrise.example/first",
    ...overrides,
  };
}

function futureAppointment(overrides = {}) {
  const d = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  return {
    id: "a_1",
    status: "confirmed",
    appointment_date: d,
    patient_id: "p_1001",
    ...overrides,
  };
}

/**
 * Mutable lookup that becomes true after `flipAfter` enrichAppointmentExists calls.
 * With waitOverrideMs=0 there is no resume enrich; sequence is:
 * 1 start,
 * 2 cond_1, 3 msg_1 traverse, 4 msg_1 dispatch,
 * 5 cond_2, 6 msg_2 traverse, 7 msg_2 dispatch,
 * 8 cond_3, 9 msg_3 traverse, 10 msg_3 dispatch,
 * 11 cond_4, 12 msg_4 traverse, 13 msg_4 dispatch
 */
function flipLookupAfter(flipAfter) {
  let calls = 0;
  setAppointmentLookup(async ({ patientId }) => {
    // Always patient-scoped: never true for other patients.
    if (patientId && patientId !== "p_1001") return false;
    calls += 1;
    return calls >= flipAfter;
  });
  return () => calls;
}

/**
 * Flip appointment.exists once at least `n` messages have been sent for this run.
 * Models "patient books after reminder N" without depending on enrich call counts.
 */
function flipLookupAfterSent(n) {
  setAppointmentLookup(async ({ patientId }) => {
    if (patientId && patientId !== "p_1001") return false;
    const sent = communicationLogStore
      .list()
      .filter((l) => l.status === "sent");
    return sent.length >= n;
  });
}

async function runNurturing(overrides = {}) {
  return executeWorkflow({
    configuration: structuredClone(configuration),
    workflowId: overrides.workflowId ?? "wf_nurture_1",
    workflowName: fixture.workflow.name,
    triggerPayload: {
      trigger_type: "patientRegistered",
      ...(overrides.triggerPayload || {}),
    },
    patient: overrides.patient === null ? {} : basePatient(overrides.patient),
    hospital: baseHospital(overrides.hospital),
    appointment: overrides.appointment ?? {},
    appointments: overrides.appointments,
    waitOverrideMs: 0,
  });
}

function sentLogs(workflowId = "wf_nurture_1") {
  return communicationLogStore
    .list({ workflowId })
    .filter((l) => l.status === "sent");
}

function nodeById(id) {
  return configuration.nodes.find((n) => n.id === id);
}

function edgesFrom(id) {
  return configuration.edges.filter((e) => e.source === id);
}

beforeEach(() => {
  workflowExecutionStore.clear();
  clearMessageIdempotency();
  clearAppointmentLookup();
  communicationLogStore.clear();
});

describe("Fixture structure — firstAppointmentNurturing", () => {
  it("locates fixture with patientRegistered campaignKey", () => {
    assert.equal(fixture.meta.focusNodeType, "patientRegistered");
    assert.equal(configuration.campaignKey, "first_appointment_nurturing");
    assert.equal(configuration.suppressOnAppointment, true);
    assert.equal(nodeById("n_patientRegistered").data.nodeType, "patientRegistered");
  });

  it("delays are exactly 7 days, 2 days, 24 hours, 2 hours", () => {
    const waits = [
      ["n_wait_7d", 7, "days"],
      ["n_wait_2d", 2, "days"],
      ["n_wait_24h", 24, "hours"],
      ["n_wait_2h", 2, "hours"],
    ];
    for (const [id, amount, unit] of waits) {
      const data = nodeById(id).data;
      assert.equal(data.waitType, "duration");
      assert.equal(data.amount, amount);
      assert.equal(data.unit, unit);
      const ms = delayScheduler.calculateDelayMs(data);
      const expected =
        amount *
        (unit === "days" ? 86400000 : unit === "hours" ? 3600000 : 60000);
      assert.equal(ms, expected);
    }
  });

  it("every condition checks appointment.exists == false (current patient context)", () => {
    for (const id of ["n_cond_1", "n_cond_2", "n_cond_3", "n_cond_4"]) {
      assert.equal(
        nodeById(id).data.expression.trim(),
        "appointment.exists == false"
      );
    }
  });

  it("each condition is evaluated after its corresponding wait", () => {
    const pairs = [
      ["n_wait_7d", "n_cond_1"],
      ["n_wait_2d", "n_cond_2"],
      ["n_wait_24h", "n_cond_3"],
      ["n_wait_2h", "n_cond_4"],
    ];
    for (const [waitId, condId] of pairs) {
      const edge = configuration.edges.find(
        (e) => e.source === waitId && e.target === condId
      );
      assert.ok(edge, `${waitId} must connect to ${condId}`);
    }
  });

  it("false branch of every condition ends the workflow", () => {
    for (const id of ["n_cond_1", "n_cond_2", "n_cond_3", "n_cond_4"]) {
      const falseEdge = edgesFrom(id).find((e) => e.sourceHandle === "false");
      assert.ok(falseEdge, `${id} needs false branch`);
      assert.equal(falseEdge.target, "n_end_booked");
      assert.equal(nodeById("n_end_booked").data.nodeType, "end");
    }
  });

  it("happy path order: trigger → waits → conditions → messages → end", () => {
    const path = [
      ["n_patientRegistered", "n_wait_7d"],
      ["n_wait_7d", "n_cond_1"],
      ["n_cond_1", "n_msg_1", "true"],
      ["n_msg_1", "n_wait_2d"],
      ["n_wait_2d", "n_cond_2"],
      ["n_cond_2", "n_msg_2", "true"],
      ["n_msg_2", "n_wait_24h"],
      ["n_wait_24h", "n_cond_3"],
      ["n_cond_3", "n_msg_3", "true"],
      ["n_msg_3", "n_wait_2h"],
      ["n_wait_2h", "n_cond_4"],
      ["n_cond_4", "n_msg_4", "true"],
      ["n_msg_4", "n_end_success"],
    ];
    for (const [source, target, handle] of path) {
      const edge = configuration.edges.find(
        (e) =>
          e.source === source &&
          e.target === target &&
          (handle ? e.sourceHandle === handle : true)
      );
      assert.ok(edge, `${source} → ${target}${handle ? ` (${handle})` : ""}`);
    }
  });
});

describe("First Appointment Nurturing — execution scenarios", () => {
  it("patient never books → all four reminders send in order then end", async () => {
    const result = await runNurturing({ appointment: {} });
    assert.equal(result.status, "completed");
    assert.equal(result.currentNodeId, null);
    const msgs = sentLogs();
    assert.deepEqual(
      msgs.map((m) => m.nodeId),
      ["n_msg_1", "n_msg_2", "n_msg_3", "n_msg_4"]
    );
  });

  it("existing appointment before workflow → no reminders", async () => {
    const result = await runNurturing({
      workflowId: "wf_prebooked",
      appointment: futureAppointment(),
    });
    assert.equal(result.status, "completed");
    assert.equal(sentLogs("wf_prebooked").length, 0);
  });

  it("patient books after the first wait → no reminders", async () => {
    // Flip before cond_1 (2nd enrich call)
    flipLookupAfter(2);
    const result = await runNurturing({
      workflowId: "wf_after_wait1",
      appointment: {},
    });
    assert.equal(result.status, "completed");
    assert.equal(sentLogs("wf_after_wait1").length, 0);
  });

  it("patient books after the second reminder → only two messages", async () => {
    flipLookupAfterSent(2);
    const result = await runNurturing({
      workflowId: "wf_after_msg2",
      appointment: {},
    });
    assert.equal(result.status, "completed");
    assert.deepEqual(
      sentLogs("wf_after_msg2").map((m) => m.nodeId),
      ["n_msg_1", "n_msg_2"]
    );
  });

  it("patient books after the third reminder → only three messages", async () => {
    flipLookupAfterSent(3);
    const result = await runNurturing({
      workflowId: "wf_after_msg3",
      appointment: {},
    });
    assert.equal(result.status, "completed");
    assert.deepEqual(
      sentLogs("wf_after_msg3").map((m) => m.nodeId),
      ["n_msg_1", "n_msg_2", "n_msg_3"]
    );
  });

  it("appointment booking cancels remaining scheduled nurturing executions", async () => {
    const exec = workflowExecutionStore.create({
      workflowId: "wf_nurture_1",
      workflowName: fixture.workflow.name,
      patientId: "p_1001",
      hospitalId: "12",
      campaignKey: FIRST_APPOINTMENT_NURTURING_CAMPAIGN,
    });
    workflowExecutionStore.update(exec.id, {
      status: "scheduled",
      delayJobId: "delay_pending_1",
    });
    delayScheduler.schedule({
      jobId: "delay_pending_1",
      nodeId: "n_wait_2d",
      executionId: exec.id,
      delayMs: 60_000,
      onResume: async () => {
        throw new Error("should not resume after cancel");
      },
    });

    const { cancelled } = onAppointmentBooked({
      patientId: "p_1001",
      hospitalId: 12,
      campaignKey: FIRST_APPOINTMENT_NURTURING_CAMPAIGN,
    });
    assert.deepEqual(cancelled, [exec.id]);
    assert.equal(workflowExecutionStore.get(exec.id).status, "cancelled");
    assert.equal(
      delayScheduler.listPending().some((j) => j.jobId === "delay_pending_1"),
      false
    );
  });

  it("duplicate scheduler / queue retry does not resend the same campaign step", async () => {
    const dispatcher = new ActionDispatcher({
      channelManager,
      templateManager,
      variableResolver,
    });
    const context = {
      executionId: "exec_dup",
      workflowId: "wf_dup",
      patient: basePatient(),
      hospital: baseHospital(),
      appointment: { exists: false },
      campaign: {
        key: FIRST_APPOINTMENT_NURTURING_CAMPAIGN,
        suppressOnAppointment: true,
      },
      system: { triggered_at: "2026-01-01T00:00:00Z" },
      variables: {},
    };
    const step = {
      id: "n_msg_1",
      nodeType: "sendWhatsApp",
      data: {
        message: "Hello",
        recipient: "patient",
        campaignStep: "nurture_1",
      },
    };

    const first = await dispatcher.dispatch(step, context);
    const retry = await dispatcher.dispatch(step, context);
    const workerRestart = await dispatcher.dispatch(step, context);

    assert.equal(first.success, true);
    assert.notEqual(first.output?.skipReason, "idempotent_duplicate");
    assert.equal(retry.output?.skipReason, "idempotent_duplicate");
    assert.equal(workerRestart.output?.skipReason, "idempotent_duplicate");

    const key = buildMessageIdempotencyKey({
      workflowId: "wf_dup",
      executionId: "exec_dup",
      patientId: "p_1001",
      nodeId: "n_msg_1",
      campaignStep: "nurture_1",
      scheduledPeriod: "2026-01-01T00:00:00Z",
    });
    assert.equal(hasSentMessage(key), true);
  });

  it("idempotency key is not based on message body alone", () => {
    markMessageSent(
      buildMessageIdempotencyKey({
        workflowId: "w1",
        executionId: "e1",
        patientId: "p1",
        nodeId: "n_msg_1",
        campaignStep: "nurture_1",
        scheduledPeriod: "t1",
      })
    );
    const otherStep = buildMessageIdempotencyKey({
      workflowId: "w1",
      executionId: "e1",
      patientId: "p1",
      nodeId: "n_msg_2",
      campaignStep: "nurture_2",
      scheduledPeriod: "t1",
    });
    assert.equal(hasSentMessage(otherStep), false);
  });

  it("missing patient context still runs; appointment.exists stays false without lookup", async () => {
    const result = await runNurturing({
      workflowId: "wf_no_patient",
      patient: null,
      appointment: {},
    });
    assert.equal(result.status, "completed");
    // Without patient id, messages may still attempt send with empty recipient — campaign completes.
    assert.ok(["completed", "failed"].includes(result.status));
  });

  it("missing appointment context is treated as no appointment", async () => {
    const ctx = {
      patient: basePatient(),
      hospital: baseHospital(),
      appointment: undefined,
    };
    await enrichAppointmentExists(ctx);
    assert.equal(ctx.appointment.exists, false);
    assert.equal(
      await evaluateJexlCondition("appointment.exists == false", ctx),
      true
    );
  });

  it("condition is patient-scoped — other patient appointments do not suppress", async () => {
    setAppointmentLookup(async ({ patientId }) => patientId === "p_other");
    const result = await runNurturing({
      workflowId: "wf_other_patient_appt",
      appointment: {},
    });
    assert.equal(result.status, "completed");
    assert.equal(sentLogs("wf_other_patient_appt").length, 4);
  });

  it("messaging gate skips when appointment.exists after suppress campaign", async () => {
    const dispatcher = new ActionDispatcher({
      channelManager,
      templateManager,
      variableResolver,
    });
    const out = await dispatcher.dispatch(
      {
        id: "n_msg_2",
        nodeType: "sendSms",
        data: { message: "Hi", recipient: "patient", campaignStep: "nurture_2" },
      },
      {
        executionId: "exec_skip",
        workflowId: "wf_skip",
        patient: basePatient(),
        hospital: baseHospital(),
        appointment: futureAppointment(),
        campaign: {
          key: FIRST_APPOINTMENT_NURTURING_CAMPAIGN,
          suppressOnAppointment: true,
        },
        system: { triggered_at: "2026-01-01T00:00:00Z" },
        variables: {},
      }
    );
    assert.equal(out.output?.skipReason, "appointment.exists");
  });
});
