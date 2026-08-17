import { apiClient } from "./client";
import { normalizeWorkflowList } from "@/utils/workflowList";
import { normalizeOrganizationId } from "@/utils/organization";

/**
 * Normalize a hospital list row from Laravel.
 * @param {Record<string, unknown>} item
 */
export function normalizeHospitalRow(item) {
  const id =
    normalizeOrganizationId(item?.id) ??
    normalizeOrganizationId(item?.hospital_id);

  return {
    id,
    name: String(
      item?.name ||
        item?.hospital_name ||
        item?.title ||
        (id != null ? `Hospital #${id}` : "Hospital")
    ),
    code: item?.code ?? item?.hospital_code ?? null,
    city: item?.city ?? item?.location ?? null,
  };
}

/**
 * List hospitals available for workflow assignment.
 * Expects GET /hospitals (paginated or plain array).
 * @param {{ search?: string, page?: number, perPage?: number }} [params]
 */
export async function fetchHospitals(params = {}) {
  const query = {};
  if (params.search) query.search = params.search;
  if (params.page) query.page = params.page;
  if (params.perPage) query.per_page = params.perPage;

  const response = await apiClient.get("/hospitals", { params: query });
  const normalized = normalizeWorkflowList(response.data);

  return {
    ...normalized,
    items: normalized.items
      .map(normalizeHospitalRow)
      .filter((row) => row.id != null),
    raw: response.data,
  };
}
