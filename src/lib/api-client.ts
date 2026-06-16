import "server-only";
import { cookies } from "next/headers";
import { API_BASE_URL } from "./api-base";
import { ACCESS_TOKEN_COOKIE } from "./auth-session";

export class ApiError extends Error {
  status: number;
  statusText: string;
  body: any;

  constructor(status: number, statusText: string, body: any) {
    super(body?.message || body?.detail || `API request failed with status ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.statusText = statusText;
    this.body = body;
  }
}

export interface FetchOptions extends Omit<RequestInit, "body"> {
  auth?: boolean;
  params?: Record<string, string | number | boolean | undefined | null | (string | number | boolean)[]>;
  body?: any;
}

export async function fetchClient<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { auth = true, params, body, headers: customHeaders, ...fetchOpts } = options;

  // Build URL with search parameters
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(cleanPath, API_BASE_URL);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        if (Array.isArray(value)) {
          value.forEach((v) => {
            if (v !== undefined && v !== null && v !== "") {
              url.searchParams.append(key, String(v));
            }
          });
        } else {
          url.searchParams.set(key, String(value));
        }
      }
    });
  }

  // Build Headers
  const headers = new Headers(customHeaders);
  
  if (body && !(body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Accept", "application/json");

  // Retrieve the auth token from server-side cookies if auth is required
  if (auth) {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    } catch (error) {
      console.warn("api-client: Failed to access cookies store.", error);
    }
  }

  const isDev = process.env.NODE_ENV === "development";
  const startTime = isDev ? Date.now() : 0;

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      ...fetchOpts,
      headers,
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    });
  } catch (error: any) {
    if (isDev) {
      const duration = Date.now() - startTime;
      console.error(`[api-client] ${fetchOpts.method || "GET"} ${url.pathname}${url.search} - FAILED: ${error?.message || error} (${duration}ms)`);
    }
    throw error;
  }

  if (isDev) {
    const duration = Date.now() - startTime;
    console.log(`[api-client] ${fetchOpts.method || "GET"} ${url.pathname}${url.search} - Status: ${response.status} (${duration}ms)`);
  }

  if (!response.ok) {
    let errorBody: any;
    try {
      errorBody = await response.json();
    } catch {
      try {
        errorBody = { message: await response.text() };
      } catch {
        errorBody = { message: "Unknown error occurred" };
      }
    }
    throw new ApiError(response.status, response.statusText, errorBody);
  }

  // Handle No Content / Empty response gracefully
  if (response.status === 204) {
    return {} as T;
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return (await response.json()) as T;
  }

  return (await response.text()) as unknown as T;
}

export const apiClient = {
  get: <T>(path: string, options?: Omit<FetchOptions, "method" | "body">) =>
    fetchClient<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: any, options?: Omit<FetchOptions, "method" | "body">) =>
    fetchClient<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body?: any, options?: Omit<FetchOptions, "method" | "body">) =>
    fetchClient<T>(path, { ...options, method: "PUT", body }),
  patch: <T>(path: string, body?: any, options?: Omit<FetchOptions, "method" | "body">) =>
    fetchClient<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: Omit<FetchOptions, "method" | "body">) =>
    fetchClient<T>(path, { ...options, method: "DELETE" }),
};
