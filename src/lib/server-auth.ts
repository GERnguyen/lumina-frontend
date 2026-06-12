import "server-only";

import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth-session";

export async function getServerAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
}

export async function authHeaders(headers?: HeadersInit) {
  const token = await getServerAccessToken();
  return {
    ...headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}
