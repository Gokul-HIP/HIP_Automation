/** @typedef {{ value: string, label: string }} SelectOption */

/** @type {SelectOption[]} */
export const DB_DELETE_ENTITY_OPTIONS = [
  { value: "patient", label: "Patient" },
  { value: "appointment", label: "Appointment" },
];

/** Allowlisted entity values accepted by Laravel DbDeleteExecutor. */
export const DB_DELETE_ALLOWED_ENTITIES = DB_DELETE_ENTITY_OPTIONS.map(
  (opt) => opt.value
);

export const DB_DELETE_DEFAULT_RECORD_ID = {
  patient: "{{patient_id}}",
  appointment: "{{appointment_id}}",
};
