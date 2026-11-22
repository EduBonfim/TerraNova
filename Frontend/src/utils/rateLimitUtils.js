import AsyncStorage from "@react-native-async-storage/async-storage";
import { generateRateLimitKey } from "./tokenUtils";
const DEFAULT_MAX_ATTEMPTS = 5;
const DEFAULT_WINDOW_MS = 15 * 60 * 1000;
export async function checkRateLimit(
  email,
  maxAttempts = DEFAULT_MAX_ATTEMPTS,
  windowMs = DEFAULT_WINDOW_MS
) {
  try {
    const key = generateRateLimitKey(email);
    const stored = await AsyncStorage.getItem(key);
    if (!stored) {
      return { isBlocked: false, attempts: 0 };
    }
    const data = JSON.parse(stored);
    const now = Date.now();
    if (data.blockedUntil && now < data.blockedUntil) {
      const remainingMs = data.blockedUntil - now;
      console.warn(
        "[RateLimit] Email " + email + " bloqueado por " + remainingMs + "ms"
      );
      return { isBlocked: true, remainingMs, attempts: data.attempts };
    }
    const windowExpired = now - data.firstAttemptTime > windowMs;
    if (windowExpired) {
      console.log(
        "[RateLimit] Janela de tempo expirou para " +
          email +
          ". Contador resetado."
      );
      await AsyncStorage.removeItem(key);
      return { isBlocked: false, attempts: 0 };
    }
    if (data.attempts >= maxAttempts) {
      const lockoutUntil = data.firstAttemptTime + windowMs;
      const updatedData = { ...data, blockedUntil: lockoutUntil };
      await AsyncStorage.setItem(key, JSON.stringify(updatedData));
      const remainingMs = Math.max(0, lockoutUntil - now);
      console.warn(
        "[RateLimit] Limite de " +
          maxAttempts +
          " tentativas atingido para " +
          email +
          ". Bloqueado por " +
          remainingMs +
          "ms"
      );
      return { isBlocked: true, remainingMs, attempts: data.attempts };
    }
    return { isBlocked: false, attempts: data.attempts };
  } catch (e) {
    console.error("[RateLimit] Erro ao verificar rate limit", e);
    return { isBlocked: false };
  }
}
export async function recordLoginAttempt(email, windowMs = DEFAULT_WINDOW_MS) {
  try {
    const key = generateRateLimitKey(email);
    const now = Date.now();
    const stored = await AsyncStorage.getItem(key);
    let data;
    if (!stored) {
      data = {
        attempts: 1,
        firstAttemptTime: now,
      };
    } else {
      const parsed = JSON.parse(stored);
      const windowExpired = now - parsed.firstAttemptTime > windowMs;
      if (windowExpired) {
        data = {
          attempts: 1,
          firstAttemptTime: now,
        };
      } else {
        data = {
          ...parsed,
          attempts: parsed.attempts + 1,
        };
      }
    }
    await AsyncStorage.setItem(key, JSON.stringify(data));
    console.log(
      "[RateLimit] Tentativa registrada para " +
        email +
        ". Total: " +
        data.attempts
    );
    return data.attempts;
  } catch (e) {
    console.error("[RateLimit] Erro ao registrar tentativa", e);
    return 1;
  }
}
export async function clearLoginAttempts(email) {
  try {
    const key = generateRateLimitKey(email);
    await AsyncStorage.removeItem(key);
    console.log("[RateLimit] Tentativas limpas para " + email);
  } catch (e) {
    console.error("[RateLimit] Erro ao limpar tentativas", e);
  }
}
export const recordRateLimitAttempt = recordLoginAttempt;
export const clearRateLimitAttempts = clearLoginAttempts;
export async function resetRateLimit(email) {
  try {
    if (email) {
      const key = generateRateLimitKey(email);
      await AsyncStorage.removeItem(key);
      console.log("[RateLimit] Rate limiting resetado para " + email);
    } else {
      const keys = await AsyncStorage.getAllKeys();
      const rateLimitKeys = keys.filter((k) =>
        k.startsWith("@terra_nova/rate_limit:")
      );
      await AsyncStorage.multiRemove(rateLimitKeys);
      console.log("[RateLimit] Todos os rate limits resetados");
    }
  } catch (e) {
    console.error("[RateLimit] Erro ao resetar rate limit", e);
  }
}
export async function getRateLimitInfo(email) {
  try {
    const key = generateRateLimitKey(email);
    const stored = await AsyncStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  } catch (_e) {
    return null;
  }
}
