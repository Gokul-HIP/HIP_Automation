/**
 * Patient-scoped appointment existence helpers.
 * Injectable lookup for Laravel / API; local fallback derives from context.appointment.
 */

/** Statuses that must NOT suppress first-appointment nurturing. */
export const INACTIVE_APPOINTMENT_STATUSES = new Set([
  "cancelled",
  "canceled",
  "deleted",
  "no_show",
  "noshow",
  "no-show",
  "void",
]);

/** Statuses treated as an active / upcoming booking. */
export const ACTIVE_APPOINTMENT_STATUSES = new Set([
  "confirmed",
  "booked",
  "scheduled",
  "pending",
  "upcoming",
  "rescheduled",
  "checked_in",
  "checked-in",
]);

/** @type {null | ((args: { patientId: string|null, hospitalId: string|null, context: object }) => boolean | Promise<boolean>)} */
let appointmentLookupFn = null;

/**
 * Inject a real patient-scoped appointment query (Laravel API / DB).
 * Must return whether THIS patient (optionally scoped to hospital) has an active/future appointment.
 */
export function setAppointmentLookup(fn) {
  appointmentLookupFn = typeof fn === "function" ? fn : null;
}

export function clearAppointmentLookup() {
  appointmentLookupFn = null;
}

/**
 * @param {Record<string, unknown> | null | undefined} appointment
 * @returns {boolean}
 */
export function isActivePatientAppointment(appointment) {
  if (!appointment || typeof appointment !== "object") return false;

  if (appointment.exists === true) return true;
  if (appointment.exists === false) return false;

  const status = String(
    appointment.status ?? appointment.appointment_status ?? ""
  )
    .trim()
    .toLowerCase();

  if (status && INACTIVE_APPOINTMENT_STATUSES.has(status)) {
    return false;
  }

  const id = appointment.id ?? appointment.appointment_id ?? null;
  const dateRaw =
    appointment.date ??
    appointment.appointment_date ??
    appointment.scheduled_at ??
    appointment.start_at ??
    null;

  if (!id && !dateRaw && !status) {
    return false;
  }

  if (dateRaw) {
    const ts = new Date(String(dateRaw)).getTime();
    if (Number.isFinite(ts)) {
      const dayMs = 24 * 60 * 60 * 1000;
      // Prefer active/future appointments — historical bookings must not suppress nurturing.
      if (ts < Date.now() - dayMs) {
        return false;
      }
    }
  }

  if (status) {
    return (
      ACTIVE_APPOINTMENT_STATUSES.has(status) ||
      !INACTIVE_APPOINTMENT_STATUSES.has(status)
    );
  }

  return Boolean(id || dateRaw);
}

/**
 * Resolve appointment.exists for the current patient only.
 * @param {import('../types').ExecutionContext | Record<string, unknown>} context
 * @returns {Promise<boolean>}
 */
export async function resolveAppointmentExists(context = {}) {
  const patientId =
    context.patient?.id != null ? String(context.patient.id) : null;
  const hospitalId =
    context.hospital?.id != null
      ? String(context.hospital.id)
      : context.hospital?.hospital_id != null
        ? String(context.hospital.hospital_id)
        : null;

  if (appointmentLookupFn) {
    const result = await appointmentLookupFn({
      patientId,
      hospitalId,
      context,
    });
    return Boolean(result);
  }

  // Prefer explicit list of patient appointments when provided by the host.
  const list = context.appointments;
  if (Array.isArray(list)) {
    return list.some((item) => {
      if (!item || typeof item !== "object") return false;
      if (patientId && item.patient_id != null && String(item.patient_id) !== patientId) {
        return false;
      }
      return isActivePatientAppointment(item);
    });
  }

  return isActivePatientAppointment(context.appointment);
}

/**
 * Mutates context.appointment.exists (and nested exists) for JEXL / messaging gates.
 * @param {import('../types').ExecutionContext | Record<string, unknown>} context
 */
export async function enrichAppointmentExists(context) {
  const exists = await resolveAppointmentExists(context);
  const prev =
    context.appointment && typeof context.appointment === "object"
      ? context.appointment
      : {};
  context.appointment = {
    ...prev,
    exists,
  };
  return exists;
}
