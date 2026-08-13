/** Laravel WorkflowStatus enum: active | inactive */

export const WORKFLOW_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
};

/**
 * Map legacy/UI values to API workflow status.
 * @param {string | null | undefined} status
 * @returns {"active" | "inactive"}
 */
export function normalizeWorkflowStatus(status) {
  if (status === WORKFLOW_STATUS.ACTIVE) return WORKFLOW_STATUS.ACTIVE;
  if (status === WORKFLOW_STATUS.INACTIVE) return WORKFLOW_STATUS.INACTIVE;

  // Legacy builder values → API enum
  if (status === "published") return WORKFLOW_STATUS.ACTIVE;

  return WORKFLOW_STATUS.INACTIVE;
}
