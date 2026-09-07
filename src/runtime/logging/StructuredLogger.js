/**
 * Structured runtime logs — never log secrets or full PHI message bodies.
 */

const REDACT_KEYS = new Set([
  "authorization",
  "api_key",
  "apikey",
  "access_token",
  "token",
  "password",
  "secret",
  "body",
  "message",
  "content",
]);

function sanitize(value, depth = 0) {
  if (depth > 4) return "[truncated]";
  if (value == null) return value;
  if (typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map((v) => sanitize(v, depth + 1));

  const out = {};
  for (const [k, v] of Object.entries(value)) {
    if (REDACT_KEYS.has(String(k).toLowerCase())) {
      out[k] = "[redacted]";
      continue;
    }
    out[k] = sanitize(v, depth + 1);
  }
  return out;
}

/**
 * @param {string} event
 * @param {Record<string, unknown>} [fields]
 */
export function logRuntime(event, fields = {}) {
  const payload = sanitize({
    event,
    ts: new Date().toISOString(),
    ...fields,
  });
  // eslint-disable-next-line no-console
  console.info("[workflow-runtime]", JSON.stringify(payload));
}
