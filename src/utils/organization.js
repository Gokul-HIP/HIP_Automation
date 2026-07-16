/**
 * Resolve organization / user ids from auth user or login API payload.
 */

/**
 * @param {unknown} value
 * @returns {number | null}
 */
export function normalizeOrganizationId(value) {
  if (value == null || value === "") return null;

  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.trunc(value);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    // Login API sends organization_id as a numeric string, e.g. "2"
    if (/^\d+$/.test(trimmed)) {
      const parsed = Number(trimmed);
      return parsed > 0 ? parsed : null;
    }
  }

  return null;
}

/**
 * User id may be a UUID string or a numeric id.
 * @param {unknown} value
 * @returns {string | null}
 */
export function normalizeUserId(value) {
  if (value == null || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || null;
  }
  return null;
}

/**
 * Prefer direct fields from the auth user — matches login response shape:
 * { user: { id, organization_id: "2", ... } }
 * @param {Record<string, unknown> | null | undefined} source
 * @returns {number | null}
 */
export function resolveOrganizationId(source) {
  if (!source || typeof source !== "object") return null;

  const candidates = [
    source.organization_id,
    source.organisation_id,
    source.organizationId,
    source.org_id,
    source.orgId,
    source.organization?.id,
    source.organisation?.id,
    source.user?.organization_id,
    source.user?.organisation_id,
    source.user?.organization?.id,
    source.data?.user?.organization_id,
    source.data?.organization_id,
  ];

  for (const candidate of candidates) {
    const id = normalizeOrganizationId(candidate);
    if (id != null) return id;
  }

  return null;
}

/**
 * @param {Record<string, unknown> | null | undefined} source
 * @returns {string | null}
 */
export function resolveUserId(source) {
  if (!source || typeof source !== "object") return null;

  const candidates = [
    source.id,
    source.user_id,
    source.userId,
    source.user?.id,
    source.data?.user?.id,
    source.data?.id,
  ];

  for (const candidate of candidates) {
    const id = normalizeUserId(candidate);
    if (id) return id;
  }

  return null;
}

/**
 * Flatten common login API response shapes.
 * @param {Record<string, unknown> | null | undefined} data
 */
export function normalizeLoginResponse(data) {
  if (!data || typeof data !== "object") {
    return { token: null, user: null, organization_id: null };
  }

  const layers = [data, data.data, data.result, data.payload].filter(
    (layer) => layer && typeof layer === "object"
  );

  let token = null;
  let user = null;

  for (const layer of layers) {
    token =
      token ??
      (typeof layer.token === "string" ? layer.token : null) ??
      (typeof layer.access_token === "string" ? layer.access_token : null);

    user =
      user ??
      layer.user ??
      layer.admin ??
      layer.automation_user ??
      null;
  }

  const organizationId =
    resolveOrganizationId(user) ?? resolveOrganizationId(data);
  const userId = resolveUserId(user) ?? resolveUserId(data);

  const normalizedUser =
    user && typeof user === "object"
      ? normalizeAuthUser(user, {
          organization_id: organizationId,
          id: userId,
        })
      : null;

  return {
    ...data,
    token,
    user: normalizedUser,
    organization_id: organizationId,
  };
}

/**
 * Ensure organization_id + id are present on the stored auth user.
 * @param {Record<string, unknown> | null | undefined} user
 * @param {Record<string, unknown> | null | undefined} [loginPayload]
 */
export function normalizeAuthUser(user, loginPayload = null) {
  if (!user && !loginPayload) return null;

  const normalized = user && typeof user === "object" ? { ...user } : {};

  const organizationId =
    resolveOrganizationId(normalized) ?? resolveOrganizationId(loginPayload);

  const userId =
    resolveUserId(normalized) ?? resolveUserId(loginPayload);

  if (organizationId != null) {
    // Store as number for consistent reads
    normalized.organization_id = organizationId;
  }

  if (userId) {
    normalized.id = userId;
  }

  return normalized;
}
