/**
 * Embed mode — Laravel Admin iframe hosting of the Workflow Builder.
 *
 * Detection (UI shell):
 *   - pathname starts with /embed
 *   - OR query embed=1 | embed=true
 *
 * Auth bypass (middleware): only /embed/* routes skip frontend login.
 * Normal app routes still require auth even with ?embed=1.
 *
 * Production: set NEXT_PUBLIC_EMBED_REQUIRE_TOKEN=true and pass embed_token
 * from Laravel; validateEmbedAccess will enforce it.
 */

const EMBED_QUERY_TRUTHY = new Set(["1", "true", "yes"]);

/**
 * @param {string | null | undefined} pathname
 */
export function isEmbedPath(pathname) {
  if (!pathname || typeof pathname !== "string") return false;
  return pathname === "/embed" || pathname.startsWith("/embed/");
}

/**
 * @param {string | URLSearchParams | null | undefined} search
 */
export function isEmbedQuery(search) {
  let value = null;
  if (typeof search === "string") {
    value = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search).get("embed");
  } else if (search && typeof search.get === "function") {
    value = search.get("embed");
  }
  if (value == null) return false;
  return EMBED_QUERY_TRUTHY.has(String(value).toLowerCase());
}

/**
 * Client-side embed detection for UI / postMessage behavior.
 * Prefer pathname (/embed/…) for auth-gated embeds; query is a fallback.
 */
export function isEmbedMode() {
  if (typeof window === "undefined") return false;
  return (
    isEmbedPath(window.location.pathname) ||
    isEmbedQuery(window.location.search)
  );
}

/**
 * Expected parent origin from Laravel (?parent_origin=…).
 * @returns {string | null}
 */
export function getEmbedParentOrigin() {
  if (typeof window === "undefined") return null;
  const raw = new URLSearchParams(window.location.search).get("parent_origin");
  if (!raw) return null;
  try {
    return new URL(raw).origin;
  } catch {
    try {
      return new URL(raw, window.location.origin).origin;
    } catch {
      return null;
    }
  }
}

/**
 * Send a typed message to the Laravel Admin parent window.
 * @param {string} type
 * @param {Record<string, unknown>} [payload]
 * @returns {boolean}
 */
export function postToParent(type, payload = {}) {
  if (typeof window === "undefined") return false;
  if (window.parent === window) return false;

  const parentOrigin = getEmbedParentOrigin();
  // Fall back to "*" when parent_origin is missing/invalid so Laravel still receives the message.
  const targetOrigin = parentOrigin || "*";
  window.parent.postMessage({ type, payload }, targetOrigin);
  return true;
}

/**
 * Read optional embed token from the iframe URL (future production auth).
 * @returns {string | null}
 */
export function getEmbedToken() {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("embed_token");
}

/**
 * Gate for embed access. Dev: allow when on an embed path.
 * Production hook: validate `embed_token` against Laravel Admin.
 *
 * @param {{ token?: string | null, pathname?: string }} [options]
 * @returns {Promise<{ ok: boolean, bypass?: boolean, reason?: string }>}
 */
export async function validateEmbedAccess(options = {}) {
  const pathname =
    options.pathname ??
    (typeof window !== "undefined" ? window.location.pathname : "");

  if (!isEmbedPath(pathname)) {
    return { ok: false, reason: "not_embed_route" };
  }

  const requireToken =
    String(process.env.NEXT_PUBLIC_EMBED_REQUIRE_TOKEN || "").toLowerCase() ===
    "true";

  if (!requireToken) {
    // Development: Laravel Admin already authenticated the operator.
    return { ok: true, bypass: true };
  }

  const token = options.token ?? getEmbedToken();
  if (!token) {
    return { ok: false, reason: "missing_embed_token" };
  }

  // Future: call Laravel e.g. POST /api/admin/automation/embed/validate
  return { ok: true, bypass: false };
}
