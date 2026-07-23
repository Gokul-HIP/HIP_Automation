import { apiClient, unwrapData } from "./client";

/**
 * @param {unknown} response
 */
export function normalizeExecutions(response) {
  const root = response?.data ?? response;
  const list = Array.isArray(root)
    ? root
    : Array.isArray(root?.data)
      ? root.data
      : [];

  return {
    items: list.map(normalizeExecutionRow),
    total: root?.total ?? root?.meta?.total ?? list.length,
    page: root?.current_page ?? root?.meta?.current_page ?? 1,
    perPage: root?.per_page ?? root?.meta?.per_page ?? list.length,
    raw: response,
  };
}

function normalizeExecutionRow(item) {
  const started = item.started_at ?? item.startedAt ?? null;
  const completed = item.completed_at ?? item.completedAt ?? null;
  let durationMs = item.duration_ms ?? item.durationMs ?? null;

  if (durationMs == null && started && completed) {
    durationMs = new Date(completed).getTime() - new Date(started).getTime();
  }

  return {
    id: item.id,
    workflowId: item.workflow_id ?? item.workflowId ?? null,
    workflowName: item.workflow_name ?? item.workflow?.name ?? "—",
    trigger: item.trigger ?? item.trigger_name ?? item.trigger_key ?? "—",
    status: String(item.status ?? "unknown"),
    startedAt: started,
    completedAt: completed,
    durationMs,
  };
}

export function formatDuration(ms) {
  if (ms == null || !Number.isFinite(ms)) return "—";
  if (ms < 1000) return `${ms}ms`;
  const sec = Math.round(ms / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  const rem = sec % 60;
  return `${min}m ${rem}s`;
}

export async function fetchExecutions(params = {}) {
  const query = {};
  if (params.workflowId) query.workflow_id = params.workflowId;
  if (params.page) query.page = params.page;
  if (params.perPage) query.per_page = params.perPage;

  const response = await apiClient.get("/workflow/executions", { params: query });
  return normalizeExecutions(response.data);
}
