import "server-only";

import { API_BASE_URL } from "@/lib/api-base";
import { authHeaders } from "@/lib/server-auth";
import type { UserDto } from "@/types";

type ApiPayload<T> = {
  data?: T;
};

export async function getCurrentUser() {
  try {
    const response = await fetch(new URL("/api/v1/users/me", API_BASE_URL), {
      cache: "no-store",
      headers: await authHeaders({ Accept: "application/json" }),
    });

    if (!response.ok) return undefined;

    const payload = (await response.json()) as ApiPayload<UserDto>;
    return payload.data;
  } catch {
    return undefined;
  }
}
