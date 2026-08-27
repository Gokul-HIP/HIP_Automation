import { WORKFLOW_VARIABLE_GROUPS } from "../variables";
import {
  DB_DELETE_DEFAULT_RECORD_ID,
  DB_DELETE_ENTITY_OPTIONS,
} from "./shared";

/**
 * Database node schemas for Flow Builder property panels.
 * Keep field keys aligned with Laravel DbDeleteExecutor (entity, recordId).
 */
export const DATABASE_SCHEMAS = {
  dbDelete: {
    description:
      "Delete a single hospital-scoped patient or appointment record. Does not allow arbitrary SQL or tables.",
    variableGroups: WORKFLOW_VARIABLE_GROUPS,
    fields: [
      { key: "label", type: "text", label: "Display Name", required: true },
      {
        key: "entity",
        type: "select",
        label: "Entity",
        options: DB_DELETE_ENTITY_OPTIONS,
        required: true,
        hint: "Only Patient and Appointment are supported by the backend executor.",
      },
      {
        key: "recordId",
        type: "text",
        label: "Record ID",
        required: true,
        placeholder: "{{appointment_id}}",
        hint: "Literal ID or workflow variable such as {{appointment_id}} / {{patient_id}}.",
      },
      { type: "variables" },
    ],
    defaults: {
      label: "Delete Record",
      status: "draft",
      entity: "appointment",
      recordId: DB_DELETE_DEFAULT_RECORD_ID.appointment,
    },
  },
};

export function getDatabaseSchema(type) {
  return DATABASE_SCHEMAS[type] || null;
}

export function buildDatabaseDefaults(type) {
  const schema = getDatabaseSchema(type);
  if (!schema?.defaults) return null;
  return structuredClone(schema.defaults);
}
