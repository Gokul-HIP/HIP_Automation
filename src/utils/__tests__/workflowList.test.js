import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeWorkflowList,
  resolveWorkflowListPagination,
  paginateWorkflowItems,
} from "../workflowList.js";

describe("normalizeWorkflowList — Laravel pagination", () => {
  it("keeps total/last_page when body is a LengthAwarePaginator", () => {
    const body = {
      data: Array.from({ length: 10 }, (_, i) => ({ id: i + 1, name: `W${i}` })),
      current_page: 1,
      per_page: 10,
      total: 14,
      last_page: 2,
    };
    const result = normalizeWorkflowList(body);
    assert.equal(result.items.length, 10);
    assert.equal(result.total, 14);
    assert.equal(result.page, 1);
    assert.equal(result.perPage, 10);
    assert.equal(result.lastPage, 2);
    assert.equal(result.serverPaginated, true);
  });

  it("does not treat paginator.data array as the whole list (10 of 10 bug)", () => {
    const body = {
      data: [{ id: 1 }, { id: 2 }],
      total: 14,
      current_page: 2,
      per_page: 10,
      last_page: 2,
    };
    const result = normalizeWorkflowList(body);
    assert.notEqual(result.total, result.items.length);
    assert.equal(result.total, 14);
    assert.equal(result.page, 2);
  });

  it("supports nested { data: paginator } envelopes", () => {
    const result = normalizeWorkflowList({
      data: {
        data: [{ id: 1 }],
        total: 11,
        current_page: 2,
        per_page: 10,
        last_page: 2,
      },
    });
    assert.equal(result.total, 11);
    assert.equal(result.lastPage, 2);
    assert.equal(result.serverPaginated, true);
  });

  it("supports meta.total / meta.current_page shape", () => {
    const result = normalizeWorkflowList({
      data: [{ id: 1 }, { id: 2 }],
      meta: { total: 22, current_page: 1, last_page: 3, per_page: 10 },
    });
    assert.equal(result.total, 22);
    assert.equal(result.lastPage, 3);
    assert.equal(result.serverPaginated, true);
  });

  it("treats plain arrays as unpaginated full lists", () => {
    const result = normalizeWorkflowList([{ id: 1 }, { id: 2 }, { id: 3 }]);
    assert.equal(result.total, 3);
    assert.equal(result.serverPaginated, false);
    assert.equal(result.lastPage, 1);
  });

  it("treats { data: [...] } without pagination meta as a full list", () => {
    const result = normalizeWorkflowList({
      data: [{ id: 1 }, { id: 2 }],
    });
    assert.equal(result.total, 2);
    assert.equal(result.serverPaginated, false);
  });
});

describe("resolveWorkflowListPagination", () => {
  it("uses API total for server-paginated pages (14 workflows, page size 10)", () => {
    const data = normalizeWorkflowList({
      data: Array.from({ length: 10 }, (_, i) => ({ id: i + 1 })),
      total: 14,
      current_page: 1,
      per_page: 10,
      last_page: 2,
    });
    const page1 = resolveWorkflowListPagination(data, 1, 10);
    assert.equal(page1.total, 14);
    assert.equal(page1.totalPages, 2);
    assert.equal(page1.items.length, 10);
    assert.equal(page1.page, 1);

    const page2Data = normalizeWorkflowList({
      data: [{ id: 11 }, { id: 12 }, { id: 13 }, { id: 14 }],
      total: 14,
      current_page: 2,
      per_page: 10,
      last_page: 2,
    });
    const page2 = resolveWorkflowListPagination(page2Data, 2, 10);
    assert.equal(page2.total, 14);
    assert.equal(page2.items.length, 4);
    assert.equal(page2.page, 2);
    assert.equal(page2.totalPages, 2);
  });

  it("does not re-slice server page results", () => {
    const data = normalizeWorkflowList({
      data: [{ id: 11 }, { id: 12 }, { id: 13 }, { id: 14 }],
      total: 14,
      current_page: 2,
      per_page: 10,
      last_page: 2,
    });
    const resolved = resolveWorkflowListPagination(data, 2, 10);
    assert.equal(resolved.items.length, 4);
    assert.deepEqual(
      resolved.items.map((i) => i.id),
      [11, 12, 13, 14]
    );
  });

  it("falls back to client pagination for full arrays", () => {
    const items = Array.from({ length: 14 }, (_, i) => ({
      id: i + 1,
      name: `W${i}`,
      status: "inactive",
      updatedAt: null,
      createdAt: null,
    }));
    const data = normalizeWorkflowList(items);
    const page1 = resolveWorkflowListPagination(data, 1, 10, {
      search: "",
      status: "all",
      sort: "newest",
    });
    assert.equal(page1.total, 14);
    assert.equal(page1.items.length, 10);
    assert.equal(page1.totalPages, 2);

    const page2 = resolveWorkflowListPagination(data, 2, 10, {
      search: "",
      status: "all",
      sort: "newest",
    });
    assert.equal(page2.items.length, 4);
  });

  it("handles empty list", () => {
    const data = normalizeWorkflowList({ data: [], total: 0, current_page: 1, per_page: 10, last_page: 1 });
    const resolved = resolveWorkflowListPagination(data, 1, 10);
    assert.equal(resolved.total, 0);
    assert.equal(resolved.items.length, 0);
  });
});

describe("paginateWorkflowItems", () => {
  it("computes pages for 11 items", () => {
    const items = Array.from({ length: 11 }, (_, i) => ({ id: i }));
    const p1 = paginateWorkflowItems(items, 1, 10);
    const p2 = paginateWorkflowItems(items, 2, 10);
    assert.equal(p1.total, 11);
    assert.equal(p1.items.length, 10);
    assert.equal(p2.items.length, 1);
    assert.equal(p2.totalPages, 2);
  });
});
