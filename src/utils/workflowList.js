/**
 * Normalize medicine-workflows list API responses.
 */

/**
 * @param {unknown} response
 */
export function normalizeWorkflowList(response) {
  const root = response?.data ?? response;

  if (Array.isArray(root)) {
    return {
      items: root,
      total: root.length,
      page: 1,
      perPage: root.length || 10,
    };
  }

  if (root && typeof root === "object" && Array.isArray(root.data)) {
    return {
      items: root.data,
      total:
        root.total ??
        root.meta?.total ??
        root.pagination?.total ??
        root.data.length,
      page: root.current_page ?? root.meta?.current_page ?? 1,
      perPage: root.per_page ?? root.meta?.per_page ?? 10,
    };
  }

  return {
    items: [],
    total: 0,
    page: 1,
    perPage: 10,
  };
}

/**
 * @param {Record<string, unknown>} item
 */
export function normalizeWorkflowRow(item) {
  const createdBy =
    item.created_by_name ??
    item.created_by?.name ??
    item.created_by?.email ??
    (typeof item.created_by === "string" ? item.created_by : null) ??
    item.user?.name ??
    item.user?.email ??
    item.creator?.name ??
    "—";

  return {
    id: item.id,
    name: String(item.name || "Untitled Workflow"),
    module: item.module ?? item.module_name ?? "—",
    trigger:
      item.trigger ??
      item.trigger_name ??
      item.trigger_key ??
      item.triggerKey ??
      "—",
    status: String(item.status || "inactive"),
    createdBy,
    createdAt: item.created_at ?? null,
    updatedAt: item.updated_at ?? null,
  };
}

/**
 * Map API status to list UI badge.
 * @param {string | null | undefined} status
 * @returns {{ label: string, tone: "published" | "draft" | "paused" | "archived" }}
 */
export function getWorkflowStatusBadge(status) {
  const key = String(status || "inactive").toLowerCase();

  const map = {
    active: { label: "Published", tone: "published" },
    published: { label: "Published", tone: "published" },
    inactive: { label: "Draft", tone: "draft" },
    draft: { label: "Draft", tone: "draft" },
    paused: { label: "Paused", tone: "paused" },
    archived: { label: "Archived", tone: "archived" },
  };

  return (
    map[key] ?? {
      label: key.charAt(0).toUpperCase() + key.slice(1),
      tone: "draft",
    }
  );
}

/**
 * @param {string | null | undefined} dateStr
 */
export function formatWorkflowDate(dateStr) {
  if (!dateStr) return "—";

  try {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(dateStr));
  } catch {
    return "—";
  }
}

/**
 * Client-side filtering when API returns full list.
 * @param {ReturnType<typeof normalizeWorkflowRow>[]} items
 * @param {{ search?: string, status?: string, sort?: string }} filters
 */
export function filterWorkflowItems(items, { search = "", status = "all", sort = "newest" } = {}) {
  let result = [...items];

  if (search.trim()) {
    const q = search.trim().toLowerCase();
    result = result.filter((item) => item.name.toLowerCase().includes(q));
  }

  if (status !== "all") {
    result = result.filter((item) => {
      const normalized = item.status.toLowerCase();
      if (status === "published") {
        return normalized === "active" || normalized === "published";
      }
      if (status === "draft") {
        return normalized === "inactive" || normalized === "draft";
      }
      return normalized === status;
    });
  }

  result.sort((a, b) => {
    const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return sort === "oldest" ? aTime - bTime : bTime - aTime;
  });

  return result;
}

/**
 * @param {ReturnType<typeof normalizeWorkflowRow>[]} items
 * @param {number} page
 * @param {number} perPage
 */
export function paginateWorkflowItems(items, page, perPage) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * perPage;

  return {
    items: items.slice(start, start + perPage),
    total,
    page: safePage,
    totalPages,
    perPage,
  };
}
