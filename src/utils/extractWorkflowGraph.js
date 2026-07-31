/**
 * Resolve the React Flow graph JSON from common API / Livewire payload shapes.
 *
 * Preferred (workflow templates):
 *   { definition: { nodes, edges, viewport } }
 *
 * Also supported:
 *   { configuration: { nodes, edges, viewport } }
 *   { workflow_version: { definition: { ... } } }
 *   { nodes, edges }  (graph at root)
 *
 * @param {Record<string, unknown> | null | undefined} payload
 * @returns {{ graph: Record<string, unknown> | null, field: string | null, raw: unknown }}
 */
export function extractWorkflowGraph(payload) {
  if (!payload || typeof payload !== "object") {
    return { graph: null, field: null, raw: payload };
  }

  const candidates = [
    ["definition", payload.definition],
    ["configuration", payload.configuration],
    ["workflow_version.definition", payload.workflow_version?.definition],
    ["data.definition", payload.data?.definition],
    ["data.configuration", payload.data?.configuration],
  ];

  for (const [field, value] of candidates) {
    if (value == null) continue;
    if (typeof value !== "object") continue;
    return { graph: value, field, raw: value };
  }

  if (Array.isArray(payload.nodes) || Array.isArray(payload.edges)) {
    return { graph: payload, field: "root", raw: payload };
  }

  return { graph: null, field: null, raw: payload };
}

/**
 * @param {Record<string, unknown> | null | undefined} graph
 */
export function graphNodeEdgeCounts(graph) {
  if (!graph || typeof graph !== "object") {
    return { nodeCount: 0, edgeCount: 0 };
  }
  return {
    nodeCount: Array.isArray(graph.nodes) ? graph.nodes.length : 0,
    edgeCount: Array.isArray(graph.edges) ? graph.edges.length : 0,
  };
}
