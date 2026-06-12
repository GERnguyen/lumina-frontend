import axios from "axios";
import { API_BASE_URL } from "@/api/configure";
import { readClientAuthSession } from "@/lib/auth-session";
import { useAuthStore } from "@/stores/auth-store";

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use(
  async (config) => {
    let token = useAuthStore.getState().accessToken;
    if (!token) {
      const session = await readClientAuthSession();
      token = session?.accessToken;
      if (token) {
        useAuthStore.getState().setAccessToken(token);
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearSession();
    }
    return Promise.reject(error);
  },
);

export default axiosClient;
