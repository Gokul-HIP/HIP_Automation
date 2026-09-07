/**
 * Follow-up + relative_date wait helpers.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  deriveFollowupObject,
  resolveRelativeDateTargetMs,
} from "../services/FollowupContext.js";
import { delayScheduler } from "../engines/DelayScheduler.js";
import { evaluateJexlCondition, buildJexlContext } from "../engines/jexlCondition.js";
import { getTriggerSchema } from "@/components/flow/config/triggers/schemas.js";

describe("Follow-up context and relative waits", () => {
  it("deriveFollowupObject sets exists from followup_date", () => {
    const fu = deriveFollowupObject(
      { followup_date: "2030-01-15T10:00:00Z" },
      {}
    );
    assert.equal(fu.exists, true);
    assert.ok(fu.date);
  });

  it("cancelled empty followup is false", () => {
    const fu = deriveFollowupObject({}, {});
    assert.equal(fu.exists, false);
  });

  it("JEXL followup.exists works", async () => {
    const ctx = buildJexlContext({
      appointment: { followup_date: "2030-06-01T09:00:00Z" },
      patient: { id: "p1" },
    });
    assert.equal(await evaluateJexlCondition("followup.exists == true", ctx), true);
  });

  it("relative_date before 4 days computes earlier target", () => {
    const followupDate = "2030-01-15T10:00:00.000Z";
    const target = resolveRelativeDateTargetMs(
      {
        relativeDateField: "followup.date",
        relativeOffsetDirection: "before",
        relativeOffsetAmount: 4,
        relativeOffsetUnit: "days",
      },
      { followup: { date: followupDate, exists: true } }
    );
    const expected =
      new Date(followupDate).getTime() - 4 * 24 * 60 * 60 * 1000;
    assert.equal(target, expected);
  });

  it("DelayScheduler relative_date uses context", () => {
    const followupDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();
    const ms = delayScheduler.calculateDelayMs(
      {
        waitType: "relative_date",
        relativeDateField: "followup.date",
        relativeOffsetDirection: "before",
        relativeOffsetAmount: 4,
        relativeOffsetUnit: "days",
      },
      { followup: { date: followupDate, exists: true } }
    );
    assert.ok(ms > 0);
    assert.ok(ms < 10 * 24 * 60 * 60 * 1000);
  });

  it("digitalPrescription alias resolves to prescriptionAdded schema", () => {
    const schema = getTriggerSchema("digitalPrescription");
    assert.ok(schema);
    assert.match(String(schema.description || ""), /digital prescription/i);
  });

  it("womens_day is a valid anniversary default option path", () => {
    const schema = getTriggerSchema("anniversary");
    const field = schema.fields.find((f) => f.key === "anniversaryType");
    assert.ok(field.options.some((o) => o.value === "womens_day"));
  });
});
