import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api-base";
import { authHeaders } from "@/lib/server-auth";

async function proxyJson(response: Response) {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text().catch(() => "");
  return { message: text || response.statusText || "Request failed" };
}

export async function GET(request: NextRequest) {
  const url = new URL("/api/v1/course-qna/questions", API_BASE_URL);
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url, {
    headers: await authHeaders({ Accept: "application/json" }),
    cache: "no-store",
  });

  return NextResponse.json(await proxyJson(response), { status: response.status });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const response = await fetch(new URL("/api/v1/course-qna/questions", API_BASE_URL), {
    method: "POST",
    headers: await authHeaders({
      Accept: "application/json",
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(body),
    cache: "no-store",
  });

  return NextResponse.json(await proxyJson(response), { status: response.status });
}
