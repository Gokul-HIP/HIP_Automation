/**
 * Reward Points Updated trigger contract and shared message variables.
 * Placeholders are stored as-is. These tests do not verify live delivery.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  WORKFLOW_VARIABLE_GROUPS,
  isRewardPointsUpdatedTrigger,
  variableGroupSections,
} from "../config/variables.js";
import { getMessagingSchema, MESSAGING_SCHEMAS } from "../config/messaging/schemas.js";
import {
  createNodeDefaults,
  getSidebarCatalogGroups,
  getWorkflowNode,
  WORKFLOW_NODES,
} from "../config/workflowNodes.js";
import {
  PAYMENT_EARNING_SOURCES,
  REWARD_SOURCE_OPTIONS,
  REWARD_UPDATE_OPTIONS,
  getTriggerSchema,
  normalizeRewardUpdatedData,
  normalizeRewardSourceList,
  normalizeRewardUpdateTypeList,
  renderTemplate,
} from "../config/triggers/index.js";
import { insertAtCursor } from "../panels/messaging/messagingUx.js";
import { normalizeVariableGroups } from "@/services/api/variables.js";
import {
  ensureValidPlaceholder,
  resolveVariableForInsert,
} from "@/utils/workflowVariableTokens.js";
import { buildWorkflowPayload } from "@/services/api/workflows.js";
import { serializeWorkflow } from "@/utils/flowSerializer.js";
import {
  deserializeWorkflow,
  extractWorkflowState,
} from "@/utils/flowDeserializer.js";
import { compileWorkflow } from "@/runtime/compiler/WorkflowCompiler.js";
import { variableResolver } from "@/runtime/variables/VariableResolver.js";

const EXAMPLE =
  "Hello {{patient_name}}, your reward balance has changed. Previous balance: {{rewards.previous_balance}} coins. Current balance: {{rewards.current_balance}} coins. Change: {{rewards.points_changed}} coins. Type: {{rewards.change_type}}. Source: {{rewards.source}}.";

const COINS_MESSAGE =
  "🎉 Hello {{patient_name}}! You earned {{rewards.coins_earned}} reward coins from your payment. Your current balance is {{rewards.current_balance}} coins. Thank you for choosing HealthInPocket! 💚";

const POINTS_KEYS = [
  "rewards.previous_balance",
  "rewards.current_balance",
  "rewards.points_changed",
  "rewards.coins_earned",
  "rewards.change_type",
  "rewards.source",
];

function keysOf(groups) {
  return groups.flatMap((group) => {
    const own = (group.variables || []).map((item) => item.key);
    const nested = (group.subgroups || []).flatMap((section) =>
      (section.variables || []).map((item) => item.key)
    );
    return [...own, ...nested];
  });
}

function rewardsGroup(groups) {
  return groups.find((group) => group.label === "Rewards");
}

describe("Reward Points Updated trigger", () => {
  it("is in the trigger selector once, including the RewardPointsUpdated alias", () => {
    const node = getWorkflowNode("rewardUpdated");
    assert.ok(node);
    assert.equal(node.title, "Reward Points Updated");
    assert.equal(node.isTrigger, true);
    assert.equal(node.category, "triggers");
    assert.equal(getWorkflowNode("RewardPointsUpdated"), null);
    assert.equal(getTriggerSchema("RewardPointsUpdated"), getTriggerSchema("rewardUpdated"));
    assert.equal(getTriggerSchema("rewardPointsUpdated"), getTriggerSchema("rewardUpdated"));
    assert.equal(getTriggerSchema("reward_points_updated"), getTriggerSchema("rewardUpdated"));
    assert.equal(isRewardPointsUpdatedTrigger("RewardPointsUpdated"), true);

    const groups = getSidebarCatalogGroups({
      apiTriggerCatalog: {
        triggers: [
          {
            key: "RewardPointsUpdated",
            name: "RewardPointsUpdated",
            description: "API alias",
          },
        ],
        groups: [],
      },
    });
    const triggers = groups.find((group) => group.category.id === "triggers");
    const matches = triggers.nodes.filter((item) => item.type === "rewardUpdated");
    assert.equal(matches.length, 1);
    assert.equal(
      (triggers.triggers || []).some((item) => item.key === "RewardPointsUpdated"),
      false
    );
  });

  it("maps Update Type labels to the backend values and reloads the selection", () => {
    const byLabel = Object.fromEntries(
      REWARD_UPDATE_OPTIONS.map((option) => [option.label, option.value])
    );
    assert.equal(byLabel.Any, "any");
    assert.equal(byLabel["Points Added"], "earned");
    assert.equal(byLabel["Points Redeemed"], "redeemed");
    assert.equal(byLabel["Points Adjusted"], "adjusted");
    assert.deepEqual(createNodeDefaults("rewardUpdated").updateType, ["any"]);

    assert.deepEqual(normalizeRewardUpdateTypeList("earned"), ["earned"]);
    assert.deepEqual(normalizeRewardUpdateTypeList([]), []);
    assert.deepEqual(normalizeRewardUpdateTypeList(null), []);
    assert.deepEqual(
      normalizeRewardUpdateTypeList(["points_added", "points_redeemed", "earned"]),
      ["earned", "redeemed"]
    );

    const legacy = {
      id: "n_trigger",
      type: "workflow",
      position: { x: 0, y: 0 },
      data: {
        nodeType: "RewardPointsUpdated",
        updateType: ["points_added", "points_adjusted"],
        label: "Reward Points Updated",
      },
    };
    const saved = serializeWorkflow({
      name: "Points",
      nodes: [legacy, {
        id: "n_end",
        type: "workflow",
        position: { x: 40, y: 0 },
        data: createNodeDefaults("end"),
      }],
      edges: [],
    });
    const trigger = saved.configuration.nodes.find((node) => node.id === "n_trigger");
    assert.equal(trigger.data.nodeType, "rewardUpdated");
    assert.deepEqual(trigger.data.updateType, ["earned", "adjusted"]);

    const reloaded = deserializeWorkflow(saved.configuration);
    assert.deepEqual(reloaded.nodes[0].data.updateType, ["earned", "adjusted"]);

    const empty = normalizeRewardUpdatedData({
      nodeType: "rewardUpdated",
      updateType: [],
    });
    assert.deepEqual(empty.updateType, []);

    const family = normalizeRewardUpdatedData({
      nodeType: "familyPackageTierUpdated",
      updateType: "upgraded",
    });
    assert.equal(family.updateType, "upgraded");
    assert.equal(Object.prototype.hasOwnProperty.call(family, "rewardSource"), false);
  });

  it("saves and reloads Reward Source without changing workflows that omit it", () => {
    const schema = getTriggerSchema("rewardUpdated");
    const field = schema.fields.find((item) => item.key === "rewardSource");
    assert.equal(field.label, "Reward Source");
    assert.deepEqual(createNodeDefaults("rewardUpdated").rewardSource, ["any"]);
    assert.deepEqual(
      REWARD_SOURCE_OPTIONS.find((option) => option.value === "payment_earnings").value,
      "payment_earnings"
    );
    assert.deepEqual(PAYMENT_EARNING_SOURCES, [
      "appointment_payment",
      "package_booking",
      "second_opinion_payment",
      "pharmacy_payment",
    ]);

    const legacy = {
      id: "n_trigger",
      type: "workflow",
      position: { x: 0, y: 0 },
      data: {
        nodeType: "rewardUpdated",
        updateType: ["any"],
        label: "Reward Points Updated",
      },
    };
    const unchanged = serializeWorkflow({
      name: "Existing",
      nodes: [legacy],
      edges: [],
    });
    const unchangedTrigger = unchanged.configuration.nodes[0];
    assert.equal(Object.prototype.hasOwnProperty.call(unchangedTrigger.data, "rewardSource"), false);
    assert.equal(
      Object.prototype.hasOwnProperty.call(deserializeWorkflow(unchanged.configuration).nodes[0].data, "rewardSource"),
      false
    );

    const selected = {
      ...legacy,
      data: {
        ...legacy.data,
        rewardSource: ["Payment Earnings", "pharmacy_payment", "HIP Points"],
      },
    };
    const saved = serializeWorkflow({
      name: "Filtered",
      nodes: [selected],
      edges: [],
    });
    const trigger = saved.configuration.nodes[0];
    assert.deepEqual(trigger.data.rewardSource, ["payment_earnings", "pharmacy_payment", "hip_points"]);
    const reloaded = deserializeWorkflow(saved.configuration);
    assert.deepEqual(reloaded.nodes[0].data.rewardSource, ["payment_earnings", "pharmacy_payment", "hip_points"]);
    assert.deepEqual(normalizeRewardSourceList([]), []);
    assert.deepEqual(normalizeRewardSourceList(null), []);
    assert.deepEqual(normalizeRewardSourceList("Any Source"), ["any"]);

    const tier = normalizeRewardUpdatedData({
      nodeType: "rewardsTierUpgraded",
      rewardSource: ["payment_earnings"],
    });
    assert.deepEqual(tier.rewardSource, ["payment_earnings"]);
  });
});

describe("Reward Points Updated variable picker", () => {
  it("exposes the canonical placeholders and hides unsupported ones", () => {
    for (const triggerKey of ["rewardUpdated", "RewardPointsUpdated"]) {
      const groups = normalizeVariableGroups(
        {
          groups: [
            {
              label: "Rewards",
              variables: [
                { key: "patient.first_name", label: "First name" },
                { key: "reward_source", label: "Reward source" },
                { key: "rewards.previous_tier.name", label: "Previous Tier Name" },
              ],
            },
          ],
        },
        triggerKey
      );
      const keys = keysOf(groups);
      for (const key of [
        "patient_name",
        "patient_mobile",
        "PatientName",
        "PatientMobile",
        ...POINTS_KEYS,
      ]) {
        assert.equal(keys.includes(key), true, `${triggerKey} missing ${key}`);
      }
      const patient = groups.find((group) => group.label === "Patient");
      const mobileAlias = patient.variables.find((item) => item.key === "PatientMobile");
      const genericMobile = patient.variables.find((item) => item.key === "patient_mobile");
      assert.match(mobileAlias.description, /patient_mobile/);
      assert.equal(ensureValidPlaceholder(mobileAlias.token), "{{PatientMobile}}");
      assert.equal(ensureValidPlaceholder(genericMobile.token), "{{patient_mobile}}");
      assert.equal(keys.includes("patient.first_name"), false);
      assert.equal(keys.includes("reward_source"), false);
      assert.equal(keys.includes("rewards.previous_tier.name"), false);

      const rewards = rewardsGroup(groups);
      assert.deepEqual(
        rewards.variables.map((item) => item.label),
        [
          "Previous Balance",
          "Current Balance",
          "Points Changed",
          "Coins Earned From This Payment",
          "Change Type",
          "Source",
        ]
      );
      const coins = rewards.variables.find((item) => item.key === "rewards.coins_earned");
      assert.equal(coins.label, "Coins Earned From This Payment");
      assert.equal(ensureValidPlaceholder(coins.token), "{{rewards.coins_earned}}");
      const source = rewards.variables.find((item) => item.key === "rewards.source");
      assert.equal(ensureValidPlaceholder(source.token), "{{rewards.source}}");
      assert.equal(ensureValidPlaceholder("reward_source"), "{{reward_source}}");
      assert.notEqual(
        ensureValidPlaceholder("reward_source"),
        "{{rewards.source}}"
      );
    }
  });

  it("inserts exact placeholders without replacing the rest of the message", () => {
    assert.equal(ensureValidPlaceholder("patient_name"), "{{patient_name}}");
    assert.equal(ensureValidPlaceholder("PatientName"), "{{PatientName}}");
    assert.equal(ensureValidPlaceholder("PatientMobile"), "{{PatientMobile}}");
    assert.equal(ensureValidPlaceholder("patient.first_name"), "");
    assert.equal(resolveVariableForInsert("PatientName").key, "patient_name");

    const inserted = insertAtCursor(
      "Hello , your reward balance has changed.",
      "{{patient_name}}",
      6,
      6
    );
    assert.equal(
      inserted.value,
      "Hello {{patient_name}}, your reward balance has changed."
    );

    const withSource = insertAtCursor(
      `${inserted.value} Source: .`,
      "{{rewards.source}}",
      inserted.value.length + " Source: ".length,
      inserted.value.length + " Source: ".length
    );
    assert.equal(
      withSource.value,
      "Hello {{patient_name}}, your reward balance has changed. Source: {{rewards.source}}."
    );
    assert.equal(withSource.value.includes("Bronze"), false);

    const withCoins = insertAtCursor(
      "Hello ! Your balance changed.",
      "{{rewards.coins_earned}}",
      6,
      6
    );
    assert.equal(
      withCoins.value,
      "Hello {{rewards.coins_earned}}! Your balance changed."
    );
  });

  it("leaves other triggers and Reward Tier variables unchanged", () => {
    const other = keysOf(normalizeVariableGroups([], "appointmentBooked"));
    for (const key of [...POINTS_KEYS, "PatientName", "PatientMobile"]) {
      assert.equal(other.includes(key), false, key);
    }
    assert.equal(other.includes("patient_mobile"), true);
    assert.equal(
      keysOf(WORKFLOW_VARIABLE_GROUPS).includes("rewards.previous_balance"),
      false
    );

    const tier = normalizeVariableGroups([], "rewardsTierUpgraded");
    const tierKeys = keysOf(tier);
    assert.equal(tierKeys.includes("rewards.previous_tier.name"), true);
    assert.equal(tierKeys.includes("rewards.current_tier.name"), true);
    assert.equal(tierKeys.includes("rewards.previous_balance"), false);
    assert.equal(tierKeys.includes("rewards.coins_earned"), false);

    const sms = getMessagingSchema("sendSms");
    assert.equal(sms.variableGroups, WORKFLOW_VARIABLE_GROUPS);
    assert.ok(sms.fields.some((field) => field.key === "message"));
    assert.equal(
      WORKFLOW_NODES.filter((node) => node.type === "sendSms").length,
      1
    );
  });

  it("shares one picker across push, WhatsApp, email, and SMS", () => {
    for (const type of ["sendPush", "sendWhatsApp", "sendEmail", "sendSms"]) {
      assert.equal(
        getMessagingSchema(type).variableGroups,
        WORKFLOW_VARIABLE_GROUPS
      );
      assert.equal(MESSAGING_SCHEMAS[type].variableGroups, WORKFLOW_VARIABLE_GROUPS);
      const channelKeys = keysOf(
        normalizeVariableGroups(getMessagingSchema(type).variableGroups, "rewardUpdated")
      );
      assert.equal(channelKeys.includes("rewards.coins_earned"), true, type);
    }
    assert.equal(
      keysOf(normalizeVariableGroups(WORKFLOW_VARIABLE_GROUPS, "paymentReceived")).includes(
        "rewards.coins_earned"
      ),
      false
    );
    const pushDefaults = createNodeDefaults("sendPush");
    assert.equal(JSON.stringify(pushDefaults).includes("Coins earned"), false);
    assert.equal(variableGroupSections(rewardsGroup(normalizeVariableGroups([], "rewardUpdated"))).length > 0, true);
  });
});

describe("Reward Points Updated save and preview", () => {
  it("stores the example placeholders through save, reload, and compile", () => {
    const nodes = [
      {
        id: "n_trigger",
        type: "workflow",
        position: { x: 0, y: 0 },
        data: {
          ...createNodeDefaults("rewardUpdated"),
          updateType: ["redeemed"],
        },
      },
      {
        id: "n_push",
        type: "workflow",
        position: { x: 20, y: 0 },
        data: { ...createNodeDefaults("sendPush"), title: "Balance", body: COINS_MESSAGE },
      },
      {
        id: "n_wa",
        type: "workflow",
        position: { x: 40, y: 0 },
        data: { ...createNodeDefaults("sendWhatsApp"), message: EXAMPLE },
      },
      {
        id: "n_email",
        type: "workflow",
        position: { x: 60, y: 0 },
        data: { ...createNodeDefaults("sendEmail"), subject: "Rewards", body: EXAMPLE },
      },
      {
        id: "n_sms",
        type: "workflow",
        position: { x: 80, y: 0 },
        data: { ...createNodeDefaults("sendSms"), message: EXAMPLE },
      },
      {
        id: "n_end",
        type: "workflow",
        position: { x: 100, y: 0 },
        data: createNodeDefaults("end"),
      },
    ];
    const edges = [
      { id: "e1", source: "n_trigger", target: "n_push" },
      { id: "e2", source: "n_push", target: "n_wa" },
      { id: "e3", source: "n_wa", target: "n_email" },
      { id: "e4", source: "n_email", target: "n_sms" },
      { id: "e5", source: "n_sms", target: "n_end" },
    ];

    const saved = buildWorkflowPayload({
      name: "Reward points",
      nodes,
      edges,
      triggerKey: "rewardUpdated",
    });
    const reloaded = extractWorkflowState({ data: saved });
    for (const node of reloaded.nodes) {
      const text = `${node.data?.message || ""} ${node.data?.body || ""}`;
      if (node.data?.nodeType === "rewardUpdated") {
        assert.deepEqual(node.data.updateType, ["redeemed"]);
      }
      if (node.data?.nodeType === "sendPush") {
        assert.equal(text.includes(COINS_MESSAGE), true);
      }
      if (["sendWhatsApp", "sendEmail", "sendSms"].includes(node.data?.nodeType)) {
        assert.equal(text.includes(EXAMPLE), true, node.data.nodeType);
      }
    }

    const published = serializeWorkflow({
      name: "Reward points",
      nodes,
      edges,
      status: "active",
    });
    const compiled = compileWorkflow({
      workflowName: "Reward points",
      configuration: published.configuration,
    });
    for (const type of ["sendWhatsApp", "sendEmail", "sendSms"]) {
      const step = Object.values(compiled.steps).find((item) => item.nodeType === type);
      const text = `${step.data.message || ""} ${step.data.body || ""}`;
      assert.equal(text.includes(EXAMPLE), true, type);
    }
    const pushStep = Object.values(compiled.steps).find((item) => item.nodeType === "sendPush");
    assert.equal(`${pushStep.data.body || ""}`.includes(COINS_MESSAGE), true);

    assert.equal(renderTemplate(EXAMPLE, {}), EXAMPLE);
    assert.equal(
      renderTemplate(EXAMPLE, { reward_source: "clinic", patient_name: "" }),
      EXAMPLE
    );
    assert.equal(
      renderTemplate("{{rewards.previous_balance}} {{rewards.points_changed}}", {
        rewards: { previous_balance: 0, points_changed: -4 },
      }),
      "0 -4"
    );
    assert.equal(
      renderTemplate("{{rewards.source}} {{rewards.current_balance}}", {
        reward_source: "clinic",
        rewards: { source: "" },
      }),
      "{{rewards.source}} {{rewards.current_balance}}"
    );
    assert.equal(
      renderTemplate("{{rewards.source}}", {
        rewards: { source: "appointment_redemption" },
      }),
      "appointment_redemption"
    );
    assert.equal(
      renderTemplate(COINS_MESSAGE, {
        patient_name: "Ada",
        rewards: { coins_earned: 9, current_balance: 45 },
      }),
      "🎉 Hello Ada! You earned 9 reward coins from your payment. Your current balance is 45 coins. Thank you for choosing HealthInPocket! 💚"
    );
    assert.equal(
      renderTemplate("{{rewards.coins_earned}}", {
        rewards: { coins_earned: null, points_changed: -4 },
      }),
      "{{rewards.coins_earned}}"
    );
    assert.equal(
      renderTemplate("{{rewards.coins_earned}}", {
        rewards: { points_changed: 5 },
      }),
      "{{rewards.coins_earned}}"
    );
    assert.equal(
      renderTemplate("{{rewards.coins_earned}}", {
        rewards: { coins_earned: 0 },
      }),
      "0"
    );
    assert.equal(
      renderTemplate("{{patient_mobile}} {{PatientMobile}}", {
        patient: { mobile: "9876543210" },
      }),
      "9876543210 9876543210"
    );
    assert.equal(
      renderTemplate("{{patient_mobile}} {{PatientMobile}}", { patient_mobile: "" }),
      "{{patient_mobile}} {{PatientMobile}}"
    );
    const preview = renderTemplate(EXAMPLE, {
      patient_name: "Ada Lovelace",
      rewards: {
        previous_balance: 0,
        current_balance: 5,
        points_changed: -4,
        change_type: "redeemed",
        source: "appointment_redemption",
      },
    });
    assert.equal(preview.includes("Ada Lovelace"), true);
    assert.equal(preview.includes("appointment_redemption"), true);
    assert.equal(preview.includes("{{rewards.previous_balance}}"), false);
    assert.equal(preview.includes("delivered"), false);
    assert.equal(preview.includes("sent"), false);

    assert.equal(
      variableResolver.resolve("{{patient_mobile}} {{PatientMobile}}", {
        patient: { mobile: "9876543210" },
      }),
      "9876543210 9876543210"
    );
    assert.equal(
      variableResolver.resolve("{{PatientMobile}}", { patient: { mobile: "" } }),
      "{{PatientMobile}}"
    );
    const resolved = variableResolver.resolve(EXAMPLE, {
      rewards: {
        previous_balance: 10,
        current_balance: 4,
        points_changed: -6,
        change_type: "redeemed",
        source: "clinic",
      },
      reward_source: "clinic",
      patient: { name: "Ada" },
    });
    assert.equal(resolved.includes("{{rewards.previous_balance}}"), true);
    assert.equal(resolved.includes("{{rewards.current_balance}}"), true);
    assert.equal(resolved.includes("{{rewards.points_changed}}"), true);
    assert.equal(resolved.includes("{{rewards.change_type}}"), true);
    assert.equal(resolved.includes("{{rewards.source}}"), true);
    assert.equal(
      variableResolver.resolve("{{rewards.coins_earned}}", {
        rewards: { coins_earned: 9, points_changed: 34 },
      }),
      "{{rewards.coins_earned}}"
    );
    assert.equal(resolved.includes("clinic"), false);
    assert.equal(resolved.includes("delivered"), false);
    assert.equal(resolved.includes("sent"), false);
  });
});
