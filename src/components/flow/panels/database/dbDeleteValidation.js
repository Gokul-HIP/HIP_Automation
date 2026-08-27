import { DB_DELETE_ALLOWED_ENTITIES } from "../../config/database/shared";

function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  return false;
}

/**
 * Validate dbDelete node data against the backend executor contract.
 * @param {Record<string, unknown> | null | undefined} data
 * @returns {Record<string, string>}
 */
export function getDbDeleteFieldErrors(data) {
  const errors = {};
  const entity = String(data?.entity ?? "").trim();
  const recordId = String(data?.recordId ?? data?.id ?? data?.record_id ?? "").trim();

  if (isEmpty(data?.label)) {
    errors.label = "Display Name is required";
  }

  if (!entity) {
    errors.entity = "Entity is required";
  } else if (!DB_DELETE_ALLOWED_ENTITIES.includes(entity)) {
    errors.entity = "Entity must be Patient or Appointment";
  }

  if (!recordId) {
    errors.recordId = "Record ID is required";
  }

  return errors;
}

/**
 * @param {Record<string, unknown> | null | undefined} data
 * @param {{ title?: string } | null} [def]
 * @returns {{ level: "error", message: string, field?: string }[]}
 */
export function validateDbDeleteNodeFields(data, def = null) {
  const title = data?.label || def?.title || "Delete Record";
  const fieldErrors = getDbDeleteFieldErrors(data);

  return Object.entries(fieldErrors).map(([field, message]) => ({
    level: "error",
    message: `"${title}" → ${message}`,
    field,
  }));
}
