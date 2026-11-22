export const VALID_ROLES = ["admin", "producer", "buyer"];

export function isValidRole(role) {
  return VALID_ROLES.includes(role);
}

export function normalizeRole(backendRole) {
  if (!backendRole) return undefined;
  const normalized = backendRole.toLowerCase().replace("role_", "");
  return isValidRole(normalized) ? normalized : undefined;
}
