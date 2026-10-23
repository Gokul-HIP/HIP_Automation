/**
 * RewardTierUpgraded template variables.
 * Canonical dotted keys only — the frontend does not resolve tier names.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  WORKFLOW_VARIABLE_GROUPS,
  applyRewardTierVariableGroups,
  isRewardTierUpgradedTrigger,
  variableGroupSections,
} from "../config/variables.js";
import { getMessagingSchema, MESSAGING_SCHEMAS } from "../config/messaging/schemas.js";
import {
  createNodeDefaults,
  getWorkflowNode,
  WORKFLOW_NODES,
} from "../config/workflowNodes.js";
import { getTriggerSchema } from "../config/triggers/index.js";
import { isValidWorkflowConnection } from "../validation/connectionRules.js";
import { insertAtCursor } from "../panels/messaging/messagingUx.js";
import { normalizeVariableGroups } from "@/services/api/variables.js";
import {
  REWARD_TIER_VARIABLE_DEFS,
  VARIABLE_INSERT_ALIASES,
  ensureValidPlaceholder,
} from "@/utils/workflowVariableTokens.js";
import { serializeWorkflow } from "@/utils/flowSerializer.js";
import {
  deserializeWorkflow,
  extractWorkflowState,
} from "@/utils/flowDeserializer.js";
import { buildWorkflowPayload } from "@/services/api/workflows.js";
import { compileWorkflow } from "@/runtime/compiler/WorkflowCompiler.js";
import { variableResolver } from "@/runtime/variables/VariableResolver.js";
import { MESSAGING_NODE_TYPES } from "@/runtime/types.js";

const PREVIOUS_NAME = "{{rewards.previous_tier.name}}";
const CURRENT_NAME = "{{rewards.current_tier.name}}";
const MESSAGE = `You moved from ${PREVIOUS_NAME} to ${CURRENT_NAME}.`;

function rewardsGroup(groups = WORKFLOW_VARIABLE_GROUPS) {
  return groups.find((group) => group.label === "Rewards");
}

function sectionVariables(group, sectionLabel) {
  const section = variableGroupSections(group).find(
    (item) => item.label === sectionLabel
  );
  assert.ok(section, `missing section ${sectionLabel}`);
  return section.variables;
}

function pickerToken(group, sectionLabel, variableLabel) {
  const variable = sectionVariables(group, sectionLabel).find(
    (item) => item.label === variableLabel
  );
  assert.ok(variable, `missing ${variableLabel}`);
  return ensureValidPlaceholder(variable.token || variable.key);
}

function messageNode(type, field, value) {
  return {
    id: `n_${type}`,
    type: "workflow",
    position: { x: 80, y: 80 },
    data: {
      ...createNodeDefaults(type),
      [field]: value,
    },
  };
}

describe("Rewards variable catalog", () => {
  it("exposes Previous Tier and Current Tier under one Rewards category", () => {
    const rewards = rewardsGroup();
    assert.ok(rewards);
    assert.equal(
      WORKFLOW_VARIABLE_GROUPS.filter((group) => group.label === "Rewards").length,
      1
    );

    const previous = sectionVariables(rewards, "Previous Tier");
    const current = sectionVariables(rewards, "Current Tier");
    const previousKeys = previous.map((item) => item.key);
    const currentKeys = current.map((item) => item.key);

    assert.deepEqual(previousKeys, [
      "rewards.previous_tier.id",
      "rewards.previous_tier.name",
      "rewards.previous_tier.rank",
    ]);
    assert.deepEqual(currentKeys, [
      "rewards.current_tier.id",
      "rewards.current_tier.name",
      "rewards.current_tier.rank",
    ]);
    assert.equal(
      previous.find((item) => item.key === "rewards.previous_tier.name").label,
      "Previous Tier Name"
    );
    assert.equal(
      current.find((item) => item.key === "rewards.current_tier.name").label,
      "Current Tier Name"
    );
  });

  it("uses id, string, and number metadata with tier descriptions", () => {
    const rewards = rewardsGroup();
    const byKey = Object.fromEntries(
      rewards.variables.map((item) => [item.key, item])
    );

    assert.equal(byKey["rewards.previous_tier.id"].valueType, "id");
    assert.equal(byKey["rewards.current_tier.id"].valueType, "id");
    assert.equal(byKey["rewards.previous_tier.name"].valueType, "string");
    assert.equal(byKey["rewards.current_tier.name"].valueType, "string");
    assert.equal(byKey["rewards.previous_tier.rank"].valueType, "number");
    assert.equal(byKey["rewards.current_tier.rank"].valueType, "number");

    assert.match(
      byKey["rewards.previous_tier.name"].description,
      /before this upgrade/
    );
    assert.match(
      byKey["rewards.current_tier.name"].description,
      /newly assigned/
    );
    assert.equal(JSON.stringify(rewards).includes("Bronze"), false);
    assert.equal(JSON.stringify(rewards).includes("Silver"), false);
    assert.equal(JSON.stringify(rewards).includes("Gold"), false);
  });

  it("keeps dotted keys canonical and does not add snake_case aliases", () => {
    for (const def of REWARD_TIER_VARIABLE_DEFS) {
      assert.equal(VARIABLE_INSERT_ALIASES[def.key], def.key);
      assert.equal(ensureValidPlaceholder(def.key), `{{${def.key}}}`);
      assert.equal(ensureValidPlaceholder(`{{${def.key}}}`), `{{${def.key}}}`);
    }
    assert.equal(VARIABLE_INSERT_ALIASES.previous_tier_name, undefined);
    assert.equal(VARIABLE_INSERT_ALIASES.new_tier_name, undefined);
    assert.equal(VARIABLE_INSERT_ALIASES.current_tier, undefined);
  });

  it("inserts Previous Tier Name and Current Tier Name at the cursor selection", () => {
    const rewards = rewardsGroup();
    const previousToken = pickerToken(rewards, "Previous Tier", "Previous Tier Name");
    const currentToken = pickerToken(rewards, "Current Tier", "Current Tier Name");
    assert.equal(previousToken, PREVIOUS_NAME);
    assert.equal(currentToken, CURRENT_NAME);

    const replaced = insertAtCursor("Hello [tier] today", previousToken, 6, 12);
    assert.equal(replaced.value, `Hello ${PREVIOUS_NAME} today`);
    assert.equal(replaced.cursor, 6 + PREVIOUS_NAME.length);

    const appended = insertAtCursor(replaced.value, currentToken, replaced.cursor, replaced.cursor);
    assert.equal(
      appended.value,
      `Hello ${PREVIOUS_NAME}${CURRENT_NAME} today`
    );
  });
});

describe("RewardTierUpgraded variable picker filtering", () => {
  it("shows both tier groups for rewardTierUpgraded and rewardsTierUpgraded", () => {
    for (const triggerKey of ["rewardTierUpgraded", "rewardsTierUpgraded", "RewardTierUpgraded"]) {
      assert.equal(isRewardTierUpgradedTrigger(triggerKey), true);
      const groups = normalizeVariableGroups([], triggerKey);
      const rewards = rewardsGroup(groups);
      assert.ok(rewards, triggerKey);
      assert.equal(
        pickerToken(rewards, "Previous Tier", "Previous Tier Name"),
        PREVIOUS_NAME
      );
      assert.equal(
        pickerToken(rewards, "Current Tier", "Current Tier Name"),
        CURRENT_NAME
      );
    }
  });

  it("hides reward tier variables for other triggers", () => {
    const groups = normalizeVariableGroups(
      {
        groups: [
          {
            label: "Rewards",
            variables: REWARD_TIER_VARIABLE_DEFS.map((def) => ({
              key: def.key,
              label: def.label,
            })),
          },
        ],
      },
      "appointmentBooked"
    );
    assert.equal(rewardsGroup(groups), undefined);
    const keys = groups.flatMap((group) =>
      (group.variables || []).map((item) => item.key)
    );
    assert.equal(keys.includes("rewards.previous_tier.name"), false);
    assert.equal(keys.includes("rewards.current_tier.name"), false);
  });

  it("preserves dotted placeholders when the variables API returns them", () => {
    const groups = normalizeVariableGroups(
      {
        groups: [
          {
            label: "Variables",
            variables: [
              { key: "rewards.previous_tier.name", label: "Previous Tier Name" },
              { key: "rewards.current_tier.name", label: "Current Tier Name" },
            ],
          },
        ],
      },
      "rewardTierUpgraded"
    );
    const rewards = rewardsGroup(groups);
    assert.equal(
      pickerToken(rewards, "Previous Tier", "Previous Tier Name"),
      PREVIOUS_NAME
    );
    assert.equal(
      pickerToken(rewards, "Current Tier", "Current Tier Name"),
      CURRENT_NAME
    );
    const stray = groups
      .filter((group) => group.label !== "Rewards")
      .flatMap((group) => group.variables.map((item) => item.key));
    assert.equal(stray.includes("rewards.previous_tier.name"), false);
  });
});

describe("Message editors share the Rewards catalog", () => {
  it("wires Send WhatsApp, Email, Push, and the other message schemas to the same groups", () => {
    const messageTypes = Object.keys(MESSAGING_SCHEMAS);
    assert.ok(messageTypes.includes("sendWhatsApp"));
    assert.ok(messageTypes.includes("sendEmail"));
    assert.ok(messageTypes.includes("sendPush"));

    for (const type of messageTypes) {
      const schema = getMessagingSchema(type);
      assert.equal(schema.variableGroups, WORKFLOW_VARIABLE_GROUPS);
      const rewards = rewardsGroup(schema.variableGroups);
      assert.equal(
        pickerToken(rewards, "Previous Tier", "Previous Tier Name"),
        PREVIOUS_NAME
      );
      assert.equal(
        pickerToken(rewards, "Current Tier", "Current Tier Name"),
        CURRENT_NAME
      );
    }
  });
});

describe("Save, reload, and compile keep canonical placeholders", () => {
  function graph() {
    const nodes = [
      {
        id: "n_trigger",
        type: "workflow",
        position: { x: 0, y: 0 },
        data: createNodeDefaults("rewardsTierUpgraded"),
      },
      messageNode("sendWhatsApp", "message", MESSAGE),
      messageNode("sendEmail", "body", MESSAGE),
      messageNode("sendPush", "body", MESSAGE),
      {
        id: "n_end",
        type: "workflow",
        position: { x: 240, y: 0 },
        data: createNodeDefaults("end"),
      },
    ];
    const edges = [
      { id: "e1", source: "n_trigger", target: "n_sendWhatsApp" },
      { id: "e2", source: "n_sendWhatsApp", target: "n_sendEmail" },
      { id: "e3", source: "n_sendEmail", target: "n_sendPush" },
      { id: "e4", source: "n_sendPush", target: "n_end" },
    ];
    return { nodes, edges };
  }

  function messagesFrom(nodes) {
    return nodes.map((node) => {
      const data = node.data || {};
      return data.message || data.body || "";
    });
  }

  it("round-trips save, reload, and the publish payload without resolving values", () => {
    const { nodes, edges } = graph();
    const saved = buildWorkflowPayload({
      name: "Tier upgrade",
      nodes,
      edges,
      triggerKey: "rewardsTierUpgraded",
    });
    const reloaded = extractWorkflowState({ data: saved });
    assert.ok(messagesFrom(reloaded.nodes).includes(MESSAGE));

    const published = serializeWorkflow({
      name: "Tier upgrade",
      nodes,
      edges,
      status: "active",
    });
    const restored = deserializeWorkflow(published.configuration);
    assert.ok(messagesFrom(restored.nodes).includes(MESSAGE));
    assert.equal(published.configuration.nodes.some((node) => {
      const text = `${node.data?.message || ""} ${node.data?.body || ""}`;
      return text.includes(PREVIOUS_NAME) && text.includes(CURRENT_NAME);
    }), true);

    const compiled = compileWorkflow({
      workflowId: 1,
      workflowName: "Tier upgrade",
      configuration: published.configuration,
    });
    const whatsapp = Object.values(compiled.steps).find(
      (step) => step.nodeType === "sendWhatsApp"
    );
    const email = Object.values(compiled.steps).find(
      (step) => step.nodeType === "sendEmail"
    );
    const push = Object.values(compiled.steps).find(
      (step) => step.nodeType === "sendPush"
    );
    assert.equal(whatsapp.data.message, MESSAGE);
    assert.equal(email.data.body, MESSAGE);
    assert.equal(push.data.body, MESSAGE);

    const resolved = variableResolver.resolve(MESSAGE, {
      rewards: {
        previous_tier: { name: "Bronze" },
        current_tier: { name: "Silver" },
      },
    });
    assert.equal(resolved, MESSAGE);
  });
});

describe("RewardTierUpgraded stays an entry-only trigger", () => {
  it("does not add an action node or a second variable registry", () => {
    const tierNodes = WORKFLOW_NODES.filter(
      (node) =>
        node.type === "rewardsTierUpgraded" || node.type === "rewardTierUpgraded"
    );
    assert.equal(tierNodes.length, 1);
    assert.equal(tierNodes[0].type, "rewardsTierUpgraded");
    assert.equal(tierNodes[0].isTrigger, true);
    assert.equal(tierNodes[0].category, "triggers");
    assert.equal(tierNodes[0].customPanel, "trigger");
    assert.equal(getWorkflowNode("rewardTierUpgraded"), null);
    assert.equal(
      getTriggerSchema("rewardTierUpgraded"),
      getTriggerSchema("rewardsTierUpgraded")
    );
    assert.equal(MESSAGING_NODE_TYPES.has("rewardsTierUpgraded"), false);
    assert.equal(MESSAGING_NODE_TYPES.has("rewardTierUpgraded"), false);

    const messagingTypes = WORKFLOW_NODES.filter(
      (node) => node.category === "messaging"
    ).map((node) => node.type);
    assert.deepEqual(messagingTypes, [
      "sendWhatsApp",
      "sendSms",
      "sendEmail",
      "sendPush",
      "sendAiChat",
      "sendAiVoice",
      "sendIvr",
      "sendTemplate",
    ]);

    const nodes = [
      {
        id: "n_wa",
        data: { nodeType: "sendWhatsApp" },
      },
      {
        id: "n_trigger",
        data: { nodeType: "rewardsTierUpgraded" },
      },
    ];
    assert.equal(
      isValidWorkflowConnection({
        source: "n_wa",
        target: "n_trigger",
        nodes,
        edges: [],
      }),
      false
    );
    assert.equal(
      isValidWorkflowConnection({
        source: "n_trigger",
        target: "n_wa",
        nodes,
        edges: [],
      }),
      true
    );

    const compiled = compileWorkflow({
      workflowName: "Tier upgrade",
      configuration: {
        nodes: [
          {
            id: "n_trigger",
            type: "workflow",
            data: createNodeDefaults("rewardsTierUpgraded"),
          },
        ],
        edges: [],
      },
    });
    assert.equal(compiled.trigger.isTrigger, true);
    assert.equal(compiled.trigger.isAction, false);
    assert.equal(applyRewardTierVariableGroups([], "patientRegistered").some(
      (group) => group.label === "Rewards"
    ), false);
  });
});
