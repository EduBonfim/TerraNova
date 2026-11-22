/**
 * Utilitários para manipulação e validação de tokens JWT.
 */
export function decodeToken(token) {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.warn("[TokenUtils] Token inválido - formato JWT esperado");
      return null;
    }
    const payload = parts[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    const decoded = atob(padded);
    const claims = JSON.parse(decoded);
    return claims;
  } catch (e) {
    console.warn("[TokenUtils] Erro ao decodificar token", e);
    return null;
  }
}
export function isTokenExpired(token) {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    const expirationTime = decoded.exp * 1000;
    const isExpired = Date.now() >= expirationTime;
    if (isExpired) {
      console.warn("[TokenUtils] Token expirado");
    }
    return isExpired;
  } catch (e) {
    console.error("[TokenUtils] Erro ao verificar expiração", e);
    return true;
  }
}
export function getTokenTimeRemaining(token) {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return -1;
    const expirationTime = decoded.exp * 1000;
    const remaining = expirationTime - Date.now();
    return remaining > 0 ? remaining : -1;
  } catch (_e) {
    return -1;
  }
}
export function getTokenSubject(token) {
  try {
    const decoded = decodeToken(token);
    return decoded?.sub || null;
  } catch (_e) {
    return null;
  }
}
export function generateRateLimitKey(email) {
  const normalized = email.toLowerCase().trim();
  return "@terra_nova/rate_limit:" + normalized;
}
export function generateLastSuccessfulLoginKey(email) {
  const normalized = email.toLowerCase().trim();
  return "@terra_nova/last_login:" + normalized;
}
