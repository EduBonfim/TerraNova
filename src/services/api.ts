import { useAuth } from "../contexts/AuthContext";

export const API_BASE_URL = "https://api.example.com"; // Mude para seu servidor

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
}

interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: any;
}

/**
 * Función HTTP centralizada para todas as requisições
 * Use em vez de fetch() direto
 */
export async function http<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  const { method = "GET", headers = {}, body } = options;

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  try {
    const fetchOptions: RequestInit = {
      method,
      headers: defaultHeaders,
    };

    if (body) {
      fetchOptions.body = typeof body === "string" ? body : JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || `HTTP ${response.status}`,
        status: response.status,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
      status: response.status,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return {
      success: false,
      error: errorMessage,
      status: 0,
    };
  }
}

/**
 * GET simplificado
 */
export async function get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
  return http<T>(endpoint, { method: "GET" });
}

/**
 * POST simplificado
 */
export async function post<T = any>(
  endpoint: string,
  body?: any,
): Promise<ApiResponse<T>> {
  return http<T>(endpoint, { method: "POST", body });
}

/**
 * PUT simplificado
 */
export async function put<T = any>(
  endpoint: string,
  body?: any,
): Promise<ApiResponse<T>> {
  return http<T>(endpoint, { method: "PUT", body });
}

/**
 * DELETE simplificado
 */
export async function httpDelete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
  return http<T>(endpoint, { method: "DELETE" });
}
