import { NextResponse } from "next/server";
import type { TokenResponseDto } from "@/types";
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE,
} from "@/lib/auth-session";

const isProduction = process.env.NODE_ENV === "production";

function setSessionCookies(response: NextResponse, tokens: TokenResponseDto) {
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

function clearSessionCookies(response: NextResponse) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/",
    maxAge: 0,
  });
  response.cookies.set(REFRESH_TOKEN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/",
    maxAge: 0,
  });
}

export async function GET(request: Request) {
  const accessToken = request.headers
    .get("cookie")
    ?.split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${ACCESS_TOKEN_COOKIE}=`))
    ?.split("=")[1];

  return NextResponse.json({
    authenticated: Boolean(accessToken),
    accessToken,
  });
}

export async function POST(request: Request) {
  const tokens = (await request.json()) as TokenResponseDto;

  if (!tokens.accessToken || !tokens.refreshToken) {
    return NextResponse.json({ authenticated: false, message: "Missing auth tokens" }, { status: 400 });
  }

  const response = NextResponse.json({
    authenticated: true,
    accessToken: tokens.accessToken,
  });
  setSessionCookies(response, tokens);
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  clearSessionCookies(response);
  return response;
}
