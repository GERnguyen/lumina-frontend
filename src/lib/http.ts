import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/auth-store";

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

let isInterceptorReady = false;
let refreshPromise: Promise<string | undefined> | undefined;

async function refreshAccessToken() {
  refreshPromise ??= fetch("/api/auth/refresh", {
    method: "POST",
  })
    .then(async (response) => {
      if (!response.ok) {
        useAuthStore.getState().clearSession();
        return undefined;
      }

      return response.json() as Promise<{ accessToken?: string }>;
    })
    .then((response) => {
      if (!response?.accessToken) {
        useAuthStore.getState().clearSession();
        return undefined;
      }

      useAuthStore.getState().setAccessToken(response.accessToken);
      return response.accessToken;
    })
    .finally(() => {
      refreshPromise = undefined;
    });

  return refreshPromise;
}

export function setupHttpInterceptors() {
  if (isInterceptorReady) {
    return;
  }

  axios.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const config = error.config as RetriableRequestConfig | undefined;

      if (
        error.response?.status !== 401 ||
        !config ||
        config._retry ||
        config.url?.includes("/api/auth/refresh")
      ) {
        return Promise.reject(error);
      }

      config._retry = true;
      const accessToken = await refreshAccessToken();

      if (!accessToken) {
        return Promise.reject(error);
      }

      config.headers.Authorization = `Bearer ${accessToken}`;
      return axios.request(config);
    },
  );

  isInterceptorReady = true;
}
