import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { AuthControllerService } from "@/api/generated/auth";
import { useAuthStore } from "@/stores/auth-store";

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

let isInterceptorReady = false;
let refreshPromise: Promise<string | undefined> | undefined;

async function refreshAccessToken() {
  const refreshToken = useAuthStore.getState().refreshToken;

  if (!refreshToken) {
    useAuthStore.getState().clearSession();
    return undefined;
  }

  refreshPromise ??= AuthControllerService.refreshToken({
    requestBody: { token: refreshToken },
  })
    .then((response) => {
      const tokens = response.data;

      if (!tokens?.accessToken || !tokens.refreshToken) {
        useAuthStore.getState().clearSession();
        return undefined;
      }

      useAuthStore.getState().setTokens(tokens);
      return tokens.accessToken;
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
        config.url?.includes("/api/v1/auth/refresh-token")
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
