import { API_BASE_URL } from "./api-base";
import { ACCESS_TOKEN_COOKIE } from "./auth-session";

export class ApiError extends Error {
  status: number;
  statusText: string;
  body: unknown;

  constructor(status: number, statusText: string, body: unknown) {
    const message =
      typeof body === "object" &&
      body !== null &&
      "message" in body &&
      typeof body.message === "string"
        ? body.message
        : typeof body === "object" &&
            body !== null &&
            "detail" in body &&
            typeof body.detail === "string"
          ? body.detail
          : `API request failed with status ${status}`;

    super(message);
    this.name = "ApiError";
    this.status = status;
    this.statusText = statusText;
    this.body = body;
  }
}

export interface FetchOptions extends Omit<RequestInit, "body"> {
  auth?: boolean;
  params?: Record<
    string,
    string | number | boolean | undefined | null | (string | number | boolean)[]
  >;
  body?: unknown;
}

let refreshTokenPromise: Promise<string | undefined> | undefined;

async function getAuthToken() {
  if (typeof window === "undefined") {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  }

  const response = await fetch("/api/auth/session", {
    cache: "no-store",
  }).catch(() => undefined);
  if (!response?.ok) return undefined;
  const session = (await response.json().catch(() => undefined)) as
    | { accessToken?: string }
    | undefined;
  return session?.accessToken;
}

async function refreshAuthToken() {
  if (typeof window === "undefined") {
    return undefined;
  }

  refreshTokenPromise ??= fetch("/api/auth/refresh", {
    method: "POST",
    cache: "no-store",
  })
    .then(async (response) => {
      if (!response.ok) {
        await fetch("/api/auth/session", { method: "DELETE" }).catch(
          () => undefined,
        );
        return undefined;
      }

      const session = (await response.json().catch(() => undefined)) as
        | { accessToken?: string }
        | undefined;
      return session?.accessToken;
    })
    .finally(() => {
      refreshTokenPromise = undefined;
    });

  return refreshTokenPromise;
}

async function redirectToLogin(): Promise<never> {
  if (typeof window !== "undefined") {
    await fetch("/api/auth/session", { method: "DELETE" }).catch(
      () => undefined,
    );
    window.location.replace("/login");
    throw new ApiError(401, "Unauthorized", {
      message: "Redirecting to login",
    });
  }

  const { redirect } = await import("next/navigation");
  redirect("/login");
  throw new ApiError(401, "Unauthorized", { message: "Redirecting to login" });
}

function isDynamicServerUsage(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    error.digest === "DYNAMIC_SERVER_USAGE"
  );
}

async function parseErrorResponse(response: Response) {
  try {
    return await response.json();
  } catch {
    try {
      return { message: await response.text() };
    } catch {
      return { message: "Unknown error occurred" };
    }
  }
}

async function parseSuccessResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return {} as T;
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return (await response.json()) as T;
  }

  return (await response.text()) as unknown as T;
}

export async function fetchClient<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const {
    auth = true,
    params,
    body,
    headers: customHeaders,
    ...fetchOpts
  } = options;

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
      const token = await getAuthToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    } catch (error) {
      if (!isDynamicServerUsage(error)) {
        console.warn("api-client: Failed to access auth token.", error);
      }
    }
  }

  const isDev = process.env.NODE_ENV === "development";
  const startTime = isDev ? Date.now() : 0;
  const requestInit: RequestInit = {
    ...fetchOpts,
    headers,
    body:
      body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  };
  console.log(url.toString());

  let response: Response;
  try {
    response = await fetch(url.toString(), requestInit);
  } catch (error: unknown) {
    if (isDev) {
      const duration = Date.now() - startTime;
      const message = error instanceof Error ? error.message : String(error);
      console.error(
        `[api-client] ${fetchOpts.method || "GET"} ${url.pathname}${url.search} - FAILED: ${message} (${duration}ms)`,
      );
    }
    throw error;
  }

  if (isDev) {
    const duration = Date.now() - startTime;
    console.log(
      `[api-client] ${fetchOpts.method || "GET"} ${url.pathname}${url.search} - Status: ${response.status} (${duration}ms)`,
    );
  }

  if (auth && response.status === 401) {
    const token = await refreshAuthToken();

    if (!token) {
      await redirectToLogin();
    }

    headers.set("Authorization", `Bearer ${token}`);
    response = await fetch(url.toString(), requestInit);

    if (isDev) {
      const duration = Date.now() - startTime;
      console.log(
        `[api-client] ${fetchOpts.method || "GET"} ${url.pathname}${url.search} - Retry status: ${response.status} (${duration}ms)`,
      );
    }

    if (response.status === 401) {
      await redirectToLogin();
    }
  }

  if (!response.ok) {
    const errorBody = await parseErrorResponse(response);
    throw new ApiError(response.status, response.statusText, errorBody);
  }

  return parseSuccessResponse<T>(response);
}

export const apiClient = {
  get: <T>(path: string, options?: Omit<FetchOptions, "method" | "body">) =>
    fetchClient<T>(path, { ...options, method: "GET" }),
  post: <T>(
    path: string,
    body?: unknown,
    options?: Omit<FetchOptions, "method" | "body">,
  ) => fetchClient<T>(path, { ...options, method: "POST", body }),
  put: <T>(
    path: string,
    body?: unknown,
    options?: Omit<FetchOptions, "method" | "body">,
  ) => fetchClient<T>(path, { ...options, method: "PUT", body }),
  patch: <T>(
    path: string,
    body?: unknown,
    options?: Omit<FetchOptions, "method" | "body">,
  ) => fetchClient<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: Omit<FetchOptions, "method" | "body">) =>
    fetchClient<T>(path, { ...options, method: "DELETE" }),
};
