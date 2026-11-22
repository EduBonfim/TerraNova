import AsyncStorage from "@react-native-async-storage/async-storage";
const EXPLICIT_API_URL = process.env.EXPO_PUBLIC_API_URL?.trim();
const REQUEST_TIMEOUT_MS = 7000;
const BACKEND_RETRY_COOLDOWN_MS = 15000;
let resolvedBaseUrl = null;
let backendUnavailableUntil = 0;
const lastWarnAt = {};
const missingApiUrlMessage = "EXPO_PUBLIC_API_URL nao configurada.";
export const resetResolvedBaseUrl = () => {
  resolvedBaseUrl = null;
  backendUnavailableUntil = 0;
};
export const isBackendTemporarilyUnavailable = () =>
  Date.now() < backendUnavailableUntil;
export const API_BASE_URL = () => {
  if (!EXPLICIT_API_URL) {
    throw new Error(missingApiUrlMessage);
  }
  const baseUrl = resolvedBaseUrl || EXPLICIT_API_URL;
  return baseUrl.replace(/\/+$/, "");
};
async function ensureBaseUrlResolved() {
  if (Date.now() < backendUnavailableUntil) {
    return API_BASE_URL();
  }
  if (resolvedBaseUrl) {
    console.log(`[API] Usando URL base resolvida em cache: ${resolvedBaseUrl}`);
    return resolvedBaseUrl;
  }
  const baseUrl = API_BASE_URL();
  resolvedBaseUrl = baseUrl;
  console.log(`[API] Usando URL base do ambiente: ${baseUrl}`);
  return baseUrl;
}

export async function http(endpoint, options = {}) {
  const { method = "GET", headers = {}, body } = options;
  let url = endpoint;
  const defaultHeaders = {
    "Content-Type": "application/json; charset=utf-8",
    "ngrok-skip-browser-warning": "true",
    ...headers,
  };
  if (
    !endpoint.includes("/api/v1/auth/") &&
    !endpoint.includes("/api/v1/ping")
  ) {
    try {
      const sessionStr = await AsyncStorage.getItem(
        "@terra_nova/current_session"
      );
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        if (session?.token && !defaultHeaders.Authorization) {
          defaultHeaders.Authorization = `Bearer ${session.token}`;
        }
      }
    } catch (e) {
      console.warn("[API] Falha ao recuperar token para requisicao", e);
    }
  }
  try {
    const base = await ensureBaseUrlResolved();
    url = endpoint.startsWith("http") ? endpoint : `${base}${endpoint}`;
    if (
      Date.now() < backendUnavailableUntil &&
      endpoint !== "/api/v1/ping" &&
      !endpoint.includes("/api/v1/auth/")
    ) {
      return {
        success: false,
        error: "Backend indisponivel no momento",
        status: 0,
      };
    }
    const controller =
      typeof AbortController !== "undefined" ? new AbortController() : null;
    const timeoutId = controller
      ? setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
      : null;
    const fetchOptions = {
      method,
      headers: defaultHeaders,
      signal: controller?.signal,
    };
    if (body) {
      fetchOptions.body =
        typeof body === "string" ? body : JSON.stringify(body);
    }
    const response = await fetch(url, fetchOptions);
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        code: errorData.code || null,
        error:
          errorData.message ||
          errorData.erro ||
          errorData.error ||
          errorData.detail ||
          `HTTP ${response.status}`,
        status: response.status,
      };
    }
    let data = null;
    if (response.status !== 204) {
      data = await response.json().catch(() => null);
    }
    return {
      success: true,
      data,
      status: response.status,
    };
  } catch (error) {
    if (error instanceof Error && error.message === missingApiUrlMessage) {
      console.warn(
        `[API] ${missingApiUrlMessage} Defina a URL do backend no arquivo .env.`
      );
      return {
        success: false,
        error: missingApiUrlMessage,
        status: 0,
      };
    }
    const now = Date.now();
    const key = url || EXPLICIT_API_URL || "global";
    const last = lastWarnAt[key] || 0;
    if (error instanceof Error && error.name === "AbortError") {
      backendUnavailableUntil = Date.now() + BACKEND_RETRY_COOLDOWN_MS;
      if (now - last > BACKEND_RETRY_COOLDOWN_MS) {
        console.warn(`[API] Tempo limite ao conectar com ${url}`);
        lastWarnAt[key] = now;
      } else {
        console.debug(`[API] Tempo limite ao conectar com ${url} (throttled)`);
      }
      return {
        success: false,
        error: "Tempo limite excedido ao conectar com o backend",
        status: 0,
      };
    }
    backendUnavailableUntil = Date.now() + BACKEND_RETRY_COOLDOWN_MS;
    const errorMessage =
      error instanceof Error ? error.message : "Erro desconhecido";
    if (now - last > BACKEND_RETRY_COOLDOWN_MS) {
      console.warn(`[API] Falha na requisicao para ${url}: ${errorMessage}`);
      lastWarnAt[key] = now;
    } else {
      console.debug(
        `[API] Falha na requisicao para ${url} (throttled): ${errorMessage}`
      );
    }
    return {
      success: false,
      error: errorMessage,
      status: 0,
    };
  }
}
export async function get(endpoint) {
  return http(endpoint, { method: "GET" });
}
export async function post(endpoint, body, options = {}) {
  return http(endpoint, { method: "POST", body, ...options });
}
export async function put(endpoint, body, options = {}) {
  return http(endpoint, { method: "PUT", body, ...options });
}
export async function httpDelete(endpoint) {
  return http(endpoint, { method: "DELETE" });
}
export async function patch(endpoint, body, options = {}) {
  return http(endpoint, { method: "PATCH", body, ...options });
}
