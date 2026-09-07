/**
 * Unit tests for campaign workflow duplicate lookup.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  campaignKeysMatch,
  findExistingCampaignWorkflow,
  readWorkflowCampaignKey,
  workflowNamesMatch,
  FIRST_APPOINTMENT_NURTURING_CAMPAIGN_KEY,
  FIRST_APPOINTMENT_NURTURING_NAME,
  MEDICINE_REMINDER_CAMPAIGN_KEY,
  MEDICINE_REMINDER_NAME,
  DIGITAL_PRESCRIPTION_CAMPAIGN_KEY,
  DIGITAL_PRESCRIPTION_DELIVERY_NAME,
  POST_VISIT_FOLLOWUP_CAMPAIGN_KEY,
  POST_VISIT_FOLLOWUP_NAME,
} from "@/utils/workflowCampaignLookup.js";

describe("workflowCampaignLookup", () => {
  it("matches camelCase and snake_case campaign keys", () => {
    assert.equal(
      campaignKeysMatch(
        "first_appointment_nurturing",
        "firstAppointmentNurturing"
      ),
      true
    );
    assert.equal(
      campaignKeysMatch(
        FIRST_APPOINTMENT_NURTURING_CAMPAIGN_KEY,
        "first_appointment_nurturing"
      ),
      true
    );
    assert.equal(
      campaignKeysMatch("medicine_reminder", "medicineReminder"),
      true
    );
    assert.equal(
      campaignKeysMatch("digital_prescription", "digitalPrescriptionDelivery"),
      true
    );
    assert.equal(
      campaignKeysMatch("post_visit_followup", "postVisitFollowup"),
      true
    );
    assert.equal(campaignKeysMatch("other_campaign", "first_appointment_nurturing"), false);
  });

  it("matches Medicine Reminder and Medicine Remainder display names", () => {
    assert.equal(
      workflowNamesMatch("Medicine Reminder", "Medicine Remainder"),
      true
    );
    assert.equal(workflowNamesMatch("Medicine Reminder", "Other"), false);
  });

  it("matches Digital Prescription Delivery name aliases", () => {
    assert.equal(
      workflowNamesMatch(
        "Digital Prescription Delivery",
        "Digital Prescription Share"
      ),
      true
    );
    assert.equal(
      workflowNamesMatch("Digital Prescription Delivery", "Other"),
      false
    );
  });

  it("matches Post-Visit Follow-up name aliases", () => {
    assert.equal(
      workflowNamesMatch("Post-Visit Follow-up", "Post Visit Follow-up"),
      true
    );
    assert.equal(workflowNamesMatch("Post-Visit Follow-up", "Other"), false);
  });

  it("reads campaignKey from configuration", () => {
    assert.equal(
      readWorkflowCampaignKey({
        configuration: { campaignKey: "first_appointment_nurturing" },
      }),
      "first_appointment_nurturing"
    );
    assert.equal(
      readWorkflowCampaignKey({
        configuration: { campaign_key: "first_appointment_nurturing" },
      }),
      "first_appointment_nurturing"
    );
  });

  it("finds existing workflow by campaignKey and prevents duplicate create", () => {
    const items = [
      {
        id: 10,
        name: "Other",
        configuration: { campaignKey: "birthday_wishes" },
      },
      {
        id: 42,
        name: FIRST_APPOINTMENT_NURTURING_NAME,
        configuration: { campaignKey: "first_appointment_nurturing" },
      },
    ];
    const found = findExistingCampaignWorkflow(items);
    assert.equal(found?.id, 42);
  });

  it("finds Medicine Reminder by key or Remainder name alias", () => {
    const byKey = findExistingCampaignWorkflow(
      [
        {
          id: 11,
          name: "Medicine Remainder",
          configuration: { campaignKey: MEDICINE_REMINDER_CAMPAIGN_KEY },
        },
      ],
      {
        campaignKey: MEDICINE_REMINDER_CAMPAIGN_KEY,
        name: MEDICINE_REMINDER_NAME,
      }
    );
    assert.equal(byKey?.id, 11);

    const byName = findExistingCampaignWorkflow(
      [{ id: 11, name: "Medicine Remainder" }],
      {
        campaignKey: MEDICINE_REMINDER_CAMPAIGN_KEY,
        name: MEDICINE_REMINDER_NAME,
      }
    );
    assert.equal(byName?.id, 11);
  });

  it("finds Digital Prescription Delivery by key or Share name alias", () => {
    const byKey = findExistingCampaignWorkflow(
      [
        {
          id: 38,
          name: "Digital Prescription Share",
          configuration: { campaignKey: DIGITAL_PRESCRIPTION_CAMPAIGN_KEY },
        },
      ],
      {
        campaignKey: DIGITAL_PRESCRIPTION_CAMPAIGN_KEY,
        name: DIGITAL_PRESCRIPTION_DELIVERY_NAME,
      }
    );
    assert.equal(byKey?.id, 38);

    const byName = findExistingCampaignWorkflow(
      [{ id: 38, name: "Digital Prescription Share" }],
      {
        campaignKey: DIGITAL_PRESCRIPTION_CAMPAIGN_KEY,
        name: DIGITAL_PRESCRIPTION_DELIVERY_NAME,
      }
    );
    assert.equal(byName?.id, 38);
  });

  it("finds Post-Visit Follow-up by key or name alias", () => {
    const byKey = findExistingCampaignWorkflow(
      [
        {
          id: 39,
          name: "Post Visit Follow-up",
          configuration: { campaignKey: POST_VISIT_FOLLOWUP_CAMPAIGN_KEY },
        },
      ],
      {
        campaignKey: POST_VISIT_FOLLOWUP_CAMPAIGN_KEY,
        name: POST_VISIT_FOLLOWUP_NAME,
      }
    );
    assert.equal(byKey?.id, 39);

    const byName = findExistingCampaignWorkflow(
      [{ id: 39, name: "Post Visit Followup" }],
      {
        campaignKey: POST_VISIT_FOLLOWUP_CAMPAIGN_KEY,
        name: POST_VISIT_FOLLOWUP_NAME,
      }
    );
    assert.equal(byName?.id, 39);
  });

  it("falls back to display name when configuration key is absent", () => {
    const found = findExistingCampaignWorkflow([
      { id: 7, name: "First Appointment Nurturing" },
    ]);
    assert.equal(found?.id, 7);
  });

  it("excludes the current workflow id when updating", () => {
    const found = findExistingCampaignWorkflow(
      [
        {
          id: 42,
          name: FIRST_APPOINTMENT_NURTURING_NAME,
          configuration: { campaignKey: "first_appointment_nurturing" },
        },
      ],
      { excludeId: 42 }
    );
    assert.equal(found, null);
  });
});
