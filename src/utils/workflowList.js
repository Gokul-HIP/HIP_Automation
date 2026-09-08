/**
 * Normalize medicine-workflows list API responses.
 */

/**
 * Laravel LengthAwarePaginator (or equivalent) with an items array in `data`.
 * @param {unknown} value
 */
function isLaravelPaginator(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  if (!Array.isArray(value.data)) return false;
  return (
    value.total != null ||
    value.current_page != null ||
    value.last_page != null ||
    value.per_page != null ||
    value.meta?.total != null ||
    value.meta?.current_page != null ||
    value.meta?.last_page != null ||
    value.pagination?.total != null ||
    value.links != null
  );
}

/**
 * @param {Record<string, unknown>} root
 */
function fromLaravelPaginator(root) {
  const items = Array.isArray(root.data) ? root.data : [];
  const total = Number(
    root.total ?? root.meta?.total ?? root.pagination?.total ?? items.length
  );
  const perPage = Number(
    root.per_page ?? root.meta?.per_page ?? root.pagination?.per_page ?? 10
  );
  const page = Number(
    root.current_page ??
      root.meta?.current_page ??
      root.pagination?.current_page ??
      1
  );
  const lastPageRaw =
    root.last_page ?? root.meta?.last_page ?? root.pagination?.last_page;
  const lastPage = Number(
    lastPageRaw != null
      ? lastPageRaw
      : Math.max(1, Math.ceil((total || 0) / (perPage || 10)))
  );

  return {
    items,
    total: Number.isFinite(total) ? total : items.length,
    page: Number.isFinite(page) && page > 0 ? page : 1,
    perPage: Number.isFinite(perPage) && perPage > 0 ? perPage : 10,
    lastPage: Number.isFinite(lastPage) && lastPage > 0 ? lastPage : 1,
    serverPaginated: true,
  };
}

/**
 * @param {unknown} response — axios `response.data` body, or a nested envelope
 */
export function normalizeWorkflowList(response) {
  const candidates = [];
  if (response != null) candidates.push(response);
  if (
    response &&
    typeof response === "object" &&
    !Array.isArray(response) &&
    response.data != null
  ) {
    candidates.push(response.data);
  }

  for (const candidate of candidates) {
    if (isLaravelPaginator(candidate)) {
      return fromLaravelPaginator(candidate);
    }
  }

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return {
        items: candidate,
        total: candidate.length,
        page: 1,
        perPage: candidate.length || 10,
        lastPage: 1,
        serverPaginated: false,
      };
    }
  }

  return {
    items: [],
    total: 0,
    page: 1,
    perPage: 10,
    lastPage: 1,
    serverPaginated: false,
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
 * Client-side filtering when API returns a full unpaginated list.
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
 * Client-side pagination for unpaginated full lists only.
 * Do not use on an already server-paginated page of results.
 * @param {ReturnType<typeof normalizeWorkflowRow>[]} items
 * @param {number} page
 * @param {number} perPage
 */
export function paginateWorkflowItems(items, page, perPage) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage) || 1);
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * perPage;

  return {
    items: items.slice(start, start + perPage),
    total,
    page: safePage,
    totalPages,
    lastPage: totalPages,
    perPage,
  };
}

/**
 * Build list pagination state from a normalized fetch result.
 * Prefers server meta; falls back to client slice only when the API
 * returned a full unpaginated array.
 *
 * @param {{
 *   items?: unknown[],
 *   total?: number,
 *   page?: number,
 *   perPage?: number,
 *   lastPage?: number,
 *   serverPaginated?: boolean,
 * } | null | undefined} data
 * @param {number} requestedPage
 * @param {number} perPage
 * @param {{ search?: string, status?: string, sort?: string }} [clientFilters]
 */
export function resolveWorkflowListPagination(
  data,
  requestedPage,
  perPage,
  clientFilters = null
) {
  const rawItems = data?.items ?? [];

  if (data?.serverPaginated) {
    const total = Number(data.total) || 0;
    const page = Number(data.page) || requestedPage || 1;
    const size = Number(data.perPage) || perPage;
    const lastPage =
      Number(data.lastPage) ||
      Math.max(1, Math.ceil(total / size) || 1);

    return {
      items: rawItems,
      total,
      page,
      totalPages: lastPage,
      lastPage,
      perPage: size,
      serverPaginated: true,
    };
  }

  const filtered = clientFilters
    ? filterWorkflowItems(rawItems, clientFilters)
    : rawItems;
  return {
    ...paginateWorkflowItems(filtered, requestedPage, perPage),
    serverPaginated: false,
  };
}
