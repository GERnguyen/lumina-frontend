import { NextResponse, type NextRequest } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE,
} from "@/lib/auth-session";
import { API_BASE_URL } from "@/lib/api-base";

const isProduction = process.env.NODE_ENV === "production";
const guardedPublicPaths = new Set(["/", "/login", "/register"]);

function clearAuthCookies(response: NextResponse) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, "", { path: "/", maxAge: 0 });
  response.cookies.set(REFRESH_TOKEN_COOKIE, "", { path: "/", maxAge: 0 });
}

function setAuthCookies(response: NextResponse, tokens: { accessToken?: string; refreshToken?: string }) {
  if (tokens.accessToken) {
    response.cookies.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
      path: "/",
      maxAge: ACCESS_TOKEN_MAX_AGE,
    });
  }

  if (tokens.refreshToken) {
    response.cookies.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
      path: "/",
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });
  }
}

async function refreshSession(refreshToken: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh-token`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: refreshToken }),
    });

    if (!response.ok) return undefined;

    const payload = await response.json();
    return payload?.data as { accessToken?: string; refreshToken?: string } | undefined;
  } catch {
    return undefined;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!guardedPublicPaths.has(pathname)) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  const isAuthPath = pathname === "/login" || pathname === "/register";

  if (accessToken) {
    return isAuthPath ? NextResponse.redirect(new URL("/", request.url)) : NextResponse.next();
  }

  if (!refreshToken) {
    return NextResponse.next();
  }

  const tokens = await refreshSession(refreshToken);
  if (!tokens?.accessToken || !tokens.refreshToken) {
    const response = NextResponse.next();
    clearAuthCookies(response);
    return response;
  }

  const response = isAuthPath ? NextResponse.redirect(new URL("/", request.url)) : NextResponse.next();
  setAuthCookies(response, tokens);
  return response;
}

export const config = {
  matcher: ["/", "/login", "/register"],
};
