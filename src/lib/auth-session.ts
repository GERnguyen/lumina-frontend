import type { TokenResponseDto } from "@/types";

export const ACCESS_TOKEN_COOKIE = "lumina_access_token";
export const REFRESH_TOKEN_COOKIE = "lumina_refresh_token";

export const ACCESS_TOKEN_MAX_AGE = 60 * 60;
export const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7;

export type AuthSession = {
  accessToken?: string;
  authenticated: boolean;
};

export async function persistAuthSession(tokens: TokenResponseDto) {
  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(tokens),
  });

  if (!response.ok) {
    throw new Error("Could not persist auth session");
  }

  return (await response.json()) as AuthSession;
}

export async function readClientAuthSession() {
  const response = await fetch("/api/auth/session", {
    cache: "no-store",
  });

  if (!response.ok) {
    return undefined;
  }

  return (await response.json()) as AuthSession;
}

export async function clearAuthSession() {
  await fetch("/api/auth/session", {
    method: "DELETE",
  });
}
