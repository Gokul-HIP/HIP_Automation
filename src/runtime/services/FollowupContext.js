/**
 * Follow-up appointment context helpers for JEXL / wait relative_date.
 * Portable contract — Laravel AutomationContextBuilder should mirror this.
 */

/**
 * @param {Record<string, unknown> | null | undefined} appointment
 * @param {Record<string, unknown> | null | undefined} followup
 */
export function deriveFollowupObject(appointment = {}, followup = {}) {
  const fromExplicit =
    followup && typeof followup === "object" ? { ...followup } : {};
  const appt =
    appointment && typeof appointment === "object" ? appointment : {};

  const date =
    fromExplicit.date ??
    fromExplicit.followup_date ??
    appt.followup_date ??
    appt.follow_up_date ??
    appt.next_followup_date ??
    null;

  const existsExplicit =
    typeof fromExplicit.exists === "boolean"
      ? fromExplicit.exists
      : typeof appt.followup_exists === "boolean"
        ? appt.followup_exists
        : null;

  const exists =
    existsExplicit != null ? existsExplicit : Boolean(date);

  return {
    ...fromExplicit,
    date: date || null,
    exists,
  };
}

/**
 * Resolve a dotted path like followup.date from execution context.
 * @param {string} path
 * @param {Record<string, unknown>} context
 */
export function resolveContextDatePath(path, context = {}) {
  const raw = String(path || "").trim();
  if (!raw) return null;

  // Allow ISO / literal dates for until-style overrides
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    const t = new Date(raw).getTime();
    return Number.isFinite(t) ? t : null;
  }

  const parts = raw.split(".");
  let cur = context;
  for (const part of parts) {
    if (cur == null || typeof cur !== "object") return null;
    cur = cur[part];
  }

  if (cur == null || cur === "") return null;
  const t = new Date(String(cur)).getTime();
  return Number.isFinite(t) ? t : null;
}

/**
 * Compute target timestamp for relative_date waits.
 * @param {Record<string, unknown>} data wait node data
 * @param {Record<string, unknown>} context
 * @returns {number | null} epoch ms
 */
export function resolveRelativeDateTargetMs(data, context = {}) {
  const field = String(
    data.relativeDateField || data.relative_date_field || "followup.date"
  ).trim();
  const baseMs = resolveContextDatePath(field, context);
  if (baseMs == null) return null;

  const direction = String(
    data.relativeOffsetDirection || data.relative_offset_direction || "on"
  ).toLowerCase();

  if (direction === "on") return baseMs;

  const amount = Number(data.relativeOffsetAmount ?? data.amount ?? 0);
  const unit = String(data.relativeOffsetUnit || data.unit || "days");
  const multipliers = {
    minutes: 60 * 1000,
    hours: 60 * 60 * 1000,
    days: 24 * 60 * 60 * 1000,
    weeks: 7 * 24 * 60 * 60 * 1000,
  };
  const delta = Math.max(0, amount) * (multipliers[unit] ?? multipliers.days);

  if (direction === "before") return baseMs - delta;
  if (direction === "after") return baseMs + delta;
  return baseMs;
}
