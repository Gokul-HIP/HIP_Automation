/**
 * Node system readiness tests — registry, defaults, serialize round-trip,
 * connection rules, aliases. Does not create workflow records.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  createNodeDefaults,
  getWorkflowNode,
  getSidebarCatalogGroups,
  WORKFLOW_NODES,
} from "../config/workflowNodes.js";
import { getTriggerSchema, TRIGGER_TYPE_ALIASES } from "../config/triggers/index.js";
import { getMessagingSchema } from "../config/messaging/schemas.js";
import { WAIT_SCHEMAS } from "../config/wait/schemas.js";
import { serializeWorkflow, serializeNode } from "@/utils/flowSerializer.js";
import { deserializeWorkflow, deserializeNode } from "@/utils/flowDeserializer.js";
import { validateWorkflowGraph } from "../validation/workflowGraphValidation.js";
import { isValidWorkflowConnection } from "../validation/connectionRules.js";
import { JEXL_CONDITION_EXAMPLES } from "@/runtime/engines/jexlCondition.js";

function resolveTriggerType(type) {
  return TRIGGER_TYPE_ALIASES[type] || type;
}

const REQUIRED_TYPES = [
  "patientRegistered",
  "appointmentBooked",
  "appointmentCompleted",
  "appointmentMissed",
  "prescriptionAdded",
  "medicineReminder",
  "birthday",
  "anniversary",
  "scheduledEvent",
  "condition",
  "wait",
  "sendWhatsApp",
  "sendSms",
  "sendPush",
  "sendEmail",
  "end",
];

describe("Node system — registry and palette", () => {
  it("registers each required node type exactly once", () => {
    const seen = new Set();
    for (const node of WORKFLOW_NODES) {
      assert.ok(node.type, "node missing type");
      assert.equal(seen.has(node.type), false, `duplicate type ${node.type}`);
      seen.add(node.type);
    }
    for (const type of REQUIRED_TYPES) {
      assert.ok(seen.has(type), `missing required type ${type}`);
      assert.ok(getWorkflowNode(type), `getWorkflowNode(${type})`);
    }
  });

  it("palette groups include required nodes", () => {
    const groups = getSidebarCatalogGroups();
    const types = new Set(
      groups.flatMap((g) => (g.nodes || []).map((n) => n.type))
    );
    for (const type of REQUIRED_TYPES) {
      assert.ok(types.has(type), `${type} missing from palette groups`);
    }
  });

  it("folds API-only Campaign Triggered into the single Triggers category", () => {
    const groups = getSidebarCatalogGroups({
      apiTriggerCatalog: {
        groups: [
          {
            group: "campaign",
            triggers: [
              {
                key: "campaignTriggered",
                name: "Campaign Triggered",
                description: "Triggers when a campaign event fires.",
                group: "campaign",
              },
            ],
          },
          {
            group: "lab",
            triggers: [
              {
                key: "labCompleted",
                name: "Lab Completed",
                description: "Lab completed event.",
                group: "lab",
              },
            ],
          },
        ],
      },
    });

    const triggerSections = groups.filter(
      (g) =>
        g.category?.id === "triggers" ||
        String(g.category?.id || "").startsWith("api-trigger-") ||
        /campaign|lab/i.test(g.category?.label || "")
    );
    assert.equal(
      triggerSections.length,
      1,
      "expected exactly one Triggers section, no standalone API trigger groups"
    );
    assert.equal(triggerSections[0].category.id, "triggers");

    const apiKeys = (triggerSections[0].triggers || []).map((t) => t.key);
    assert.ok(apiKeys.includes("campaignTriggered"));
    assert.ok(apiKeys.includes("labCompleted"));
    assert.equal(
      apiKeys.filter((k) => k === "campaignTriggered").length,
      1,
      "Campaign Triggered must appear only once"
    );

    const localTitles = (triggerSections[0].nodes || []).map((n) => n.title);
    assert.ok(localTitles.includes("Patient Registered"));
    assert.ok(localTitles.includes("On Message Received"));
  });

  it("search finds Campaign Triggered inside Triggers", () => {
    const groups = getSidebarCatalogGroups({
      search: "Campaign Triggered",
      apiTriggerCatalog: {
        groups: [
          {
            group: "campaign",
            triggers: [
              {
                key: "campaignTriggered",
                name: "Campaign Triggered",
                description: "Triggers when a campaign event fires.",
              },
            ],
          },
        ],
      },
    });
    assert.equal(groups.length, 1);
    assert.equal(groups[0].category.id, "triggers");
    assert.equal(groups[0].triggers[0]?.key, "campaignTriggered");
  });

  it("createNodeDefaults returns nodeType for every required type", () => {
    for (const type of REQUIRED_TYPES) {
      const defaults = createNodeDefaults(type);
      assert.ok(defaults, `defaults for ${type}`);
      assert.equal(defaults.nodeType, type);
    }
  });

  it("womens_day is anniversary option, not a separate node type", () => {
    assert.ok(!getWorkflowNode("womens_day"));
    const schema = getTriggerSchema("anniversary");
    const field = (schema.fields || []).find((f) => f.key === "anniversaryType");
    assert.ok(field?.options?.some((o) => o.value === "womens_day"));
  });

  it("digitalPrescription alias resolves to prescriptionAdded", () => {
    assert.equal(resolveTriggerType("digitalPrescription"), "prescriptionAdded");
    assert.equal(resolveTriggerType("digital_prescription"), "prescriptionAdded");
  });
});

describe("Node system — messaging / wait schemas", () => {
  it("messaging nodes expose recipient and campaignStep", () => {
    for (const type of ["sendWhatsApp", "sendSms", "sendPush", "sendEmail"]) {
      const keys = (getMessagingSchema(type).fields || []).map((f) => f.key);
      assert.ok(keys.includes("recipient"), `${type} recipient`);
      assert.ok(keys.includes("campaignStep"), `${type} campaignStep`);
    }
  });

  it("wait duration units include weeks", () => {
    const unitField = WAIT_SCHEMAS.wait.fields.find((f) => f.key === "unit");
    assert.ok(unitField.options.some((o) => o.value === "weeks"));
    const relativeUnit = WAIT_SCHEMAS.wait.fields.find(
      (f) => f.key === "relativeOffsetUnit"
    );
    assert.ok(relativeUnit.options.some((o) => o.value === "weeks"));
  });

  it("condition examples include appointment.exists == false", () => {
    assert.ok(JEXL_CONDITION_EXAMPLES.includes("appointment.exists == false"));
  });
});

describe("Node system — serialize / deserialize round trip", () => {
  it("round-trips defaults for required nodes", () => {
    const nodes = REQUIRED_TYPES.map((type, i) => ({
      id: `n_${type}`,
      type: "workflow",
      position: { x: i * 40, y: 0 },
      data: createNodeDefaults(type),
    }));
    const edges = [];
    const payload = serializeWorkflow({
      name: "Node round trip",
      nodes,
      edges,
      status: "inactive",
    });
    const restored = deserializeWorkflow(payload.configuration);
    for (const type of REQUIRED_TYPES) {
      const original = nodes.find((n) => n.data.nodeType === type);
      const back = restored.nodes.find((n) => n.data.nodeType === type);
      assert.ok(back, `restored ${type}`);
      assert.equal(back.data.nodeType, original.data.nodeType);
    }
  });

  it("preserves wait amount/unit and messaging recipient/campaignStep", () => {
    const waitNode = {
      id: "w1",
      type: "workflow",
      position: { x: 0, y: 0 },
      data: {
        ...createNodeDefaults("wait"),
        amount: 2,
        unit: "weeks",
      },
    };
    const msgNode = {
      id: "m1",
      type: "workflow",
      position: { x: 100, y: 0 },
      data: {
        ...createNodeDefaults("sendWhatsApp"),
        recipient: "caregiver",
        campaignStep: "step_a",
        message: "Hello {{patient_name}}",
      },
    };
    const serializedWait = serializeNode(waitNode);
    const serializedMsg = serializeNode(msgNode);
    assert.equal(serializedWait.data.unit, "weeks");
    assert.equal(serializedWait.data.amount, 2);
    assert.equal(serializedMsg.data.recipient, "caregiver");
    assert.equal(serializedMsg.data.campaignStep, "step_a");

    const backWait = deserializeNode(serializedWait);
    const backMsg = deserializeNode(serializedMsg);
    assert.equal(backWait.data.unit, "weeks");
    assert.equal(backMsg.data.recipient, "caregiver");
    assert.equal(backMsg.data.campaignStep, "step_a");
  });
});

describe("Node system — validation and connections", () => {
  it("rejects invalid wait amount", () => {
    const nodes = [
      {
        id: "t",
        type: "workflow",
        position: { x: 0, y: 0 },
        data: createNodeDefaults("patientRegistered"),
      },
      {
        id: "w",
        type: "workflow",
        position: { x: 100, y: 0 },
        data: { ...createNodeDefaults("wait"), amount: 0, unit: "days" },
      },
      {
        id: "e",
        type: "workflow",
        position: { x: 200, y: 0 },
        data: createNodeDefaults("end"),
      },
    ];
    const edges = [
      { id: "a", source: "t", target: "w" },
      { id: "b", source: "w", target: "e" },
    ];
    const result = validateWorkflowGraph(nodes, edges);
    assert.equal(result.valid, false);
    assert.ok(result.issues.some((i) => i.field === "amount"));
  });

  it("allows weeks as wait unit", () => {
    const nodes = [
      {
        id: "t",
        type: "workflow",
        position: { x: 0, y: 0 },
        data: createNodeDefaults("patientRegistered"),
      },
      {
        id: "w",
        type: "workflow",
        position: { x: 100, y: 0 },
        data: { ...createNodeDefaults("wait"), amount: 1, unit: "weeks" },
      },
      {
        id: "e",
        type: "workflow",
        position: { x: 200, y: 0 },
        data: createNodeDefaults("end"),
      },
    ];
    const edges = [
      { id: "a", source: "t", target: "w" },
      { id: "b", source: "w", target: "e" },
    ];
    const result = validateWorkflowGraph(nodes, edges);
    assert.equal(result.valid, true, JSON.stringify(result.issues));
  });

  it("connection rules: no outgoing from end; nothing into trigger; one out from actions", () => {
    const nodes = [
      {
        id: "t",
        type: "workflow",
        position: { x: 0, y: 0 },
        data: { ...createNodeDefaults("patientRegistered"), isTrigger: true },
      },
      {
        id: "m",
        type: "workflow",
        position: { x: 100, y: 0 },
        data: createNodeDefaults("sendSms"),
      },
      {
        id: "e",
        type: "workflow",
        position: { x: 200, y: 0 },
        data: createNodeDefaults("end"),
      },
      {
        id: "c",
        type: "workflow",
        position: { x: 100, y: 100 },
        data: createNodeDefaults("condition"),
      },
    ];
    assert.equal(
      isValidWorkflowConnection({
        source: "e",
        target: "m",
        nodes,
        edges: [],
      }),
      false
    );
    assert.equal(
      isValidWorkflowConnection({
        source: "m",
        target: "t",
        nodes,
        edges: [],
      }),
      false
    );
    assert.equal(
      isValidWorkflowConnection({
        source: "t",
        target: "m",
        nodes,
        edges: [],
      }),
      true
    );
    assert.equal(
      isValidWorkflowConnection({
        source: "m",
        target: "e",
        nodes,
        edges: [{ id: "x", source: "m", target: "c" }],
      }),
      false
    );
    assert.equal(
      isValidWorkflowConnection({
        source: "c",
        target: "e",
        sourceHandle: "true",
        nodes,
        edges: [],
      }),
      true
    );
    assert.equal(
      isValidWorkflowConnection({
        source: "c",
        target: "e",
        sourceHandle: null,
        nodes,
        edges: [],
      }),
      false
    );

    // Legacy start→trigger is no longer a valid editor connection.
    const withStart = [
      {
        id: "start",
        type: "workflow",
        position: { x: -100, y: 0 },
        data: createNodeDefaults("start"),
      },
      ...nodes,
    ];
    assert.equal(
      isValidWorkflowConnection({
        source: "start",
        target: "t",
        nodes: withStart,
        edges: [],
      }),
      false
    );
  });
});
