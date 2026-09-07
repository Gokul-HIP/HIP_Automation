import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  UI_START_EDGE_ID,
  UI_START_NODE_ID,
  isSyntheticUiStartNode,
  normalizeEditorGraph,
  stripUiStartFromGraph,
} from "@/utils/flowEditorLifecycle.js";
import { serializeWorkflow } from "@/utils/flowSerializer.js";
import { extractWorkflowState } from "@/utils/flowDeserializer.js";
import { createNodeDefaults } from "@/components/flow/config/workflowNodes.js";

describe("flowEditorLifecycle — no synthetic Workflow Start", () => {
  const trigger = {
    id: "n_trigger",
    type: "workflow",
    position: { x: 360, y: 180 },
    data: {
      ...createNodeDefaults("appointmentCompleted"),
      nodeType: "appointmentCompleted",
      isTrigger: true,
    },
  };
  const action = {
    id: "n_sms",
    type: "workflow",
    position: { x: 640, y: 180 },
    data: createNodeDefaults("sendSms"),
  };
  const realEdge = {
    id: "e1",
    source: "n_trigger",
    target: "n_sms",
  };

  it("identifies only known synthetic start nodes", () => {
    assert.equal(
      isSyntheticUiStartNode({
        id: UI_START_NODE_ID,
        data: { nodeType: "start", uiOnly: true },
      }),
      true
    );
    assert.equal(
      isSyntheticUiStartNode({
        id: "n_start_custom",
        data: { nodeType: "start" },
      }),
      true
    );
    assert.equal(isSyntheticUiStartNode(trigger), false);
    assert.equal(
      isSyntheticUiStartNode({
        id: "start",
        data: { nodeType: "patientRegistered", label: "Start somehow" },
      }),
      false
    );
  });

  it("strips synthetic start + edge and keeps real nodes", () => {
    const nodes = [
      {
        id: UI_START_NODE_ID,
        type: "workflow",
        position: { x: 80, y: 180 },
        data: { nodeType: "start", uiOnly: true, label: "Workflow Start" },
      },
      trigger,
      action,
    ];
    const edges = [
      {
        id: UI_START_EDGE_ID,
        source: UI_START_NODE_ID,
        target: trigger.id,
        data: { uiOnly: true },
      },
      realEdge,
    ];

    const { nodes: nextNodes, edges: nextEdges } = stripUiStartFromGraph(
      nodes,
      edges
    );
    assert.equal(nextNodes.length, 2);
    assert.ok(nextNodes.every((n) => n.data?.nodeType !== "start"));
    assert.ok(nextNodes.some((n) => n.id === "n_trigger"));
    assert.equal(nextEdges.length, 1);
    assert.equal(nextEdges[0].id, "e1");
  });

  it("normalizeEditorGraph does not inject a start node", () => {
    const { nodes, edges } = normalizeEditorGraph([trigger, action], [realEdge]);
    assert.equal(nodes.length, 2);
    assert.equal(edges.length, 1);
    assert.ok(!nodes.some((n) => n.data?.nodeType === "start"));
  });

  it("serializeWorkflow omits synthetic start from payload", () => {
    const payload = serializeWorkflow({
      name: "Test",
      nodes: [
        {
          id: UI_START_NODE_ID,
          type: "workflow",
          position: { x: 0, y: 0 },
          data: { nodeType: "start", uiOnly: true },
        },
        trigger,
        action,
      ],
      edges: [
        {
          id: UI_START_EDGE_ID,
          source: UI_START_NODE_ID,
          target: trigger.id,
          data: { uiOnly: true },
        },
        realEdge,
      ],
    });
    assert.ok(
      !payload.configuration.nodes.some((n) => n.data?.nodeType === "start")
    );
    assert.ok(
      !payload.configuration.edges.some(
        (e) => e.id === UI_START_EDGE_ID || e.source === UI_START_NODE_ID
      )
    );
    assert.equal(payload.configuration.nodes.length, 2);
    assert.equal(payload.configuration.edges.length, 1);
  });

  it("extractWorkflowState strips legacy start from API responses", () => {
    const state = extractWorkflowState({
      data: {
        id: 1,
        name: "Post-Visit Follow-up",
        status: "inactive",
        configuration: {
          nodes: [
            {
              id: "start",
              type: "workflow",
              position: { x: 0, y: 0 },
              data: { nodeType: "start", label: "Workflow Start" },
            },
            {
              id: "n_trigger",
              type: "workflow",
              position: { x: 280, y: 0 },
              data: {
                nodeType: "appointmentCompleted",
                label: "Appointment Completed",
              },
            },
          ],
          edges: [
            {
              id: "ui-start-edge",
              source: "start",
              target: "n_trigger",
            },
          ],
        },
      },
    });
    assert.equal(state.nodes.length, 1);
    assert.equal(state.nodes[0].data.nodeType, "appointmentCompleted");
    assert.equal(state.edges.length, 0);
  });
});
