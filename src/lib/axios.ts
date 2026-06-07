import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/auth-store";
import { API_BASE_URL } from "./api-base";

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

let refreshPromise: Promise<string | undefined> | undefined;

async function refreshAccessToken() {
  const refreshToken = useAuthStore.getState().refreshToken;

  if (!refreshToken) {
    useAuthStore.getState().clearSession();
    return undefined;
  }

  // Request directly via axiosClient to avoid circular dependency with AuthService
  refreshPromise ??= axiosClient
    .post("/api/v1/auth/refresh-token", { token: refreshToken })
    .then((res: any) => {
      const tokens = res.data?.data;

      if (!tokens?.accessToken || !tokens.refreshToken) {
        useAuthStore.getState().clearSession();
        return undefined;
      }

      useAuthStore.getState().setTokens(tokens);
      return tokens.accessToken;
    })
    .catch(() => {
      useAuthStore.getState().clearSession();
      return undefined;
    })
    .finally(() => {
      refreshPromise = undefined;
    });

  return refreshPromise;
}

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableRequestConfig | undefined;

    if (
      error.response?.status !== 401 ||
      !config ||
      config._retry ||
      config.url?.includes("/api/v1/auth/refresh-token")
    ) {
      if (error.response?.status === 401) {
        useAuthStore.getState().clearSession();
      }
      return Promise.reject(error);
    }

    config._retry = true;
    const accessToken = await refreshAccessToken();

    if (!accessToken) {
      return Promise.reject(error);
    }

    config.headers.Authorization = `Bearer ${accessToken}`;
    return axiosClient(config);
  },
);

export default axiosClient;
