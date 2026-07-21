import { getWorkflowNode } from "@/components/flow/config/workflowNodes";
import {
  NODE_CATEGORIES,
  MESSAGING_NODE_TYPES,
  WAIT_NODE_TYPES,
  CONDITION_NODE_TYPES,
  DATABASE_NODE_TYPES,
  INTEGRATION_NODE_TYPES,
  AI_NODE_TYPES,
  nowIso,
} from "../types";

/**
 * Compiles React Flow workflow JSON into a runtime ExecutionGraph.
 * Generic — no business-specific logic.
 */
export class WorkflowCompiler {
  /**
   * @param {object} input
   * @param {string|number|null} [input.workflowId]
   * @param {string} [input.workflowName]
   * @param {import('@/types/workflow').WorkflowConfiguration} input.configuration
   */
  compile({ workflowId = null, workflowName = "Workflow", configuration }) {
    const nodes = configuration?.nodes ?? [];
    const edges = configuration?.edges ?? [];

    if (!nodes.length) {
      throw new Error("WorkflowCompiler: no nodes in configuration.");
    }

    const steps = {};
    const adjacency = new Map();
    const reverseAdj = new Map();

    for (const node of nodes) {
      const id = String(node.id);
      const data = node.data ?? {};
      const nodeType = String(data.nodeType ?? "");
      const def = getWorkflowNode(nodeType);
      const category = String(data.category ?? def?.category ?? "");

      adjacency.set(id, []);
      reverseAdj.set(id, []);

      steps[id] = this.#buildStep(id, nodeType, category, def, data);
    }

    for (const edge of edges) {
      const source = String(edge.source);
      const target = String(edge.target);
      if (!steps[source] || !steps[target]) continue;

      const outgoing = {
        edgeId: String(edge.id),
        targetId: target,
        sourceHandle: edge.sourceHandle ?? null,
        label: edge.label ?? null,
      };

      steps[source].outgoing.push(outgoing);
      steps[target].incoming.push(source);
      adjacency.get(source)?.push(outgoing);
      reverseAdj.get(target)?.push(source);
    }

    const startNode = nodes.find((n) => n.data?.nodeType === "start");
    const triggerNode = nodes.find((n) => {
      const def = getWorkflowNode(n.data?.nodeType);
      return def?.isTrigger && n.data?.nodeType !== "start";
    });

    const endNodeIds = Object.values(steps)
      .filter((s) => s.isEnd)
      .map((s) => s.id);

    const loopNodeIds = Object.values(steps)
      .filter((s) => s.isLoop)
      .map((s) => s.id);

    const entryNodeId = this.#resolveEntryNodeId(startNode, triggerNode, adjacency);

    const topologicalOrder = this.#topologicalSort(Object.keys(steps), adjacency);

    const branches = this.#detectBranches(steps);
    const hasCycles = this.#detectCycles(Object.keys(steps), adjacency, loopNodeIds);

    /** @type {import('../types').ExecutionGraph} */
    const graph = {
      workflowId,
      workflowName,
      compiledAt: nowIso(),
      entryNodeId,
      trigger: triggerNode ? steps[String(triggerNode.id)] : null,
      steps,
      endNodeIds,
      topologicalOrder,
      metadata: {
        builderVersion: configuration?.builderVersion ?? "1.0",
        reactFlowVersion: configuration?.reactFlowVersion ?? "12",
        nodeCount: nodes.length,
        edgeCount: edges.length,
        branchCount: branches.length,
        loopNodeIds,
        hasCycles,
        endNodeCount: endNodeIds.length,
      },
    };

    return graph;
  }

  #buildStep(id, nodeType, category, def, data) {
    const isStart = nodeType === "start";
    const isTrigger = Boolean(def?.isTrigger) && !isStart;
    const isEnd = nodeType === "end";
    const isLoop = nodeType === "loop";
    const isCondition = CONDITION_NODE_TYPES.has(nodeType);
    const isDelay = WAIT_NODE_TYPES.has(nodeType);
    const isAction =
      MESSAGING_NODE_TYPES.has(nodeType) ||
      DATABASE_NODE_TYPES.has(nodeType) ||
      INTEGRATION_NODE_TYPES.has(nodeType) ||
      AI_NODE_TYPES.has(nodeType);

    return {
      id,
      nodeType,
      category: category || def?.category || "",
      customPanel: def?.customPanel ?? null,
      data: structuredClone(data),
      incoming: [],
      outgoing: [],
      isStart,
      isTrigger,
      isCondition,
      isDelay,
      isAction,
      isEnd,
      isLoop,
    };
  }

  #resolveEntryNodeId(startNode, triggerNode, adjacency) {
    if (startNode) {
      const startId = String(startNode.id);
      const next = adjacency.get(startId)?.[0]?.targetId;
      if (next) return next;
    }
    if (triggerNode) return String(triggerNode.id);
    return null;
  }

  #topologicalSort(nodeIds, adjacency) {
    const inDegree = new Map();
    nodeIds.forEach((id) => inDegree.set(id, 0));

    for (const id of nodeIds) {
      for (const edge of adjacency.get(id) ?? []) {
        inDegree.set(edge.targetId, (inDegree.get(edge.targetId) ?? 0) + 1);
      }
    }

    const queue = nodeIds.filter((id) => inDegree.get(id) === 0);
    const order = [];

    while (queue.length) {
      const id = queue.shift();
      order.push(id);
      for (const edge of adjacency.get(id) ?? []) {
        const next = inDegree.get(edge.targetId) - 1;
        inDegree.set(edge.targetId, next);
        if (next === 0) queue.push(edge.targetId);
      }
    }

    return order.length === nodeIds.length ? order : nodeIds;
  }

  #detectBranches(steps) {
    return Object.values(steps).filter((s) => s.isCondition || s.outgoing.length > 1);
  }

  #detectCycles(nodeIds, adjacency, loopNodeIds) {
    if (loopNodeIds.length > 0) return false;

    const visiting = new Set();
    const visited = new Set();
    let cycle = false;

    const dfs = (id) => {
      if (visiting.has(id)) {
        cycle = true;
        return;
      }
      if (visited.has(id)) return;
      visiting.add(id);
      for (const edge of adjacency.get(id) ?? []) dfs(edge.targetId);
      visiting.delete(id);
      visited.add(id);
    };

    nodeIds.forEach((id) => {
      if (!cycle) dfs(id);
    });

    return cycle;
  }
}

export function compileWorkflow(input) {
  return new WorkflowCompiler().compile(input);
}
