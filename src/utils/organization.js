/**
 * Resolve organization id from auth user or login API payload.
 */

/**
 * @param {unknown} value
 * @returns {number | null}
 */
export function normalizeOrganizationId(value) {
  if (value == null || value === "") return null;

  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (/^\d+$/.test(trimmed)) {
      const parsed = Number(trimmed);
      return parsed > 0 ? parsed : null;
    }
  }

  return null;
}

/**
 * @param {unknown} value
 * @returns {number | null}
 */
function pickOrganizationId(value) {
  return normalizeOrganizationId(value);
}

/**
 * @param {Record<string, unknown> | null | undefined} source
 * @param {number} [depth]
 * @returns {number | null}
 */
export function findOrganizationIdDeep(source, depth = 0) {
  if (!source || typeof source !== "object" || depth > 5) return null;

  const direct = pickOrganizationId(
    source.organization_id ??
      source.organisation_id ??
      source.org_id ??
      source.orgId ??
      source.organizationId ??
      source.current_organization_id ??
      source.currentOrganizationId
  );
  if (direct) return direct;

  const organization = source.organization ?? source.organisation;
  if (organization != null) {
    if (typeof organization === "object") {
      const nested = pickOrganizationId(
        organization.id ??
          organization.organization_id ??
          organization.organisation_id
      );
      if (nested) return nested;
    } else {
      const scalar = pickOrganizationId(organization);
      if (scalar) return scalar;
    }
  }

  const company = source.company;
  if (company && typeof company === "object") {
    const nested = pickOrganizationId(company.id ?? company.organization_id);
    if (nested) return nested;
  }

  if (Array.isArray(source.organizations) && source.organizations.length) {
    for (const item of source.organizations) {
      const nested = findOrganizationIdDeep(item, depth + 1);
      if (nested) return nested;
    }
  }

  if (source.user && typeof source.user === "object") {
    const nested = findOrganizationIdDeep(source.user, depth + 1);
    if (nested) return nested;
  }

  if (source.data && typeof source.data === "object" && depth < 2) {
    const nested = findOrganizationIdDeep(source.data, depth + 1);
    if (nested) return nested;
  }

  return null;
}

/**
 * @param {Record<string, unknown> | null | undefined} source
 * @returns {number | null}
 */
export function resolveOrganizationId(source) {
  return findOrganizationIdDeep(source);
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
    findOrganizationIdDeep(data) ??
    (user && typeof user === "object" ? findOrganizationIdDeep(user) : null);

  const normalizedUser =
    user && typeof user === "object"
      ? normalizeAuthUser(user, { organization_id: organizationId, ...data })
      : organizationId
        ? { organization_id: organizationId }
        : null;

  return {
    ...data,
    token,
    user: normalizedUser,
    organization_id: organizationId,
  };
}

/**
 * Ensure organization_id is present on the stored auth user when login returns it.
 * @param {Record<string, unknown> | null | undefined} user
 * @param {Record<string, unknown> | null | undefined} [loginPayload]
 */
export function normalizeAuthUser(user, loginPayload = null) {
  if (!user && !loginPayload) return null;

  const normalized = user ? { ...user } : {};
  const organizationId =
    resolveOrganizationId(normalized) ??
    resolveOrganizationId(loginPayload) ??
    findOrganizationIdDeep(loginPayload);

  if (organizationId != null) {
    normalized.organization_id = organizationId;
  }

  return normalized;
}
