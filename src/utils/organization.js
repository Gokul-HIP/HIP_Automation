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
    const parsed = Number(trimmed);
    if (Number.isFinite(parsed) && parsed > 0) {
      return Math.trunc(parsed);
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
 * Persist the complete login user object with normalized ids.
 * @param {Record<string, unknown> | null | undefined} user
 * @param {Record<string, unknown> | null | undefined} [extra]
 */
export function normalizeAuthUser(user, extra = null) {
  if (!user && !extra) return null;

  const source = {
    ...(extra && typeof extra === "object" ? extra : {}),
    ...(user && typeof user === "object" ? user : {}),
  };

  const organizationId =
    resolveOrganizationId(source) ??
    normalizeOrganizationId(source.organization_id) ??
    normalizeOrganizationId(extra?.organization_id);

  const userId =
    resolveUserId(source) ??
    normalizeUserId(source.id) ??
    normalizeUserId(extra?.id);

  return {
    id: userId,
    email: source.email ?? null,
    first_name: source.first_name ?? source.firstName ?? null,
    last_name: source.last_name ?? source.lastName ?? null,
    organization_id: organizationId,
    // Keep any additional fields from the API
    ...source,
    // Force normalized ids last so they cannot be overwritten by string forms
    ...(userId ? { id: userId } : {}),
    ...(organizationId != null ? { organization_id: organizationId } : {}),
  };
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
  let rawUser = null;

  for (const layer of layers) {
    token =
      token ??
      (typeof layer.token === "string" ? layer.token : null) ??
      (typeof layer.access_token === "string" ? layer.access_token : null);

    rawUser =
      rawUser ??
      layer.user ??
      layer.admin ??
      layer.automation_user ??
      null;
  }

  const user = normalizeAuthUser(rawUser, data);
  const organizationId = resolveOrganizationId(user) ?? resolveOrganizationId(data);

  return {
    ...data,
    token,
    user,
    organization_id: organizationId,
  };
}
