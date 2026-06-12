import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api-base";
import { authHeaders } from "@/lib/server-auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const year = url.searchParams.get("year");
  const month = url.searchParams.get("month");
  const date = url.searchParams.get("date");
  const targetUrl = new URL(year && month ? "/api/v1/daily-goals/month" : "/api/v1/daily-goals", API_BASE_URL);

  if (year && month) {
    targetUrl.searchParams.set("year", year);
    targetUrl.searchParams.set("month", month);
  } else if (date) {
    targetUrl.searchParams.set("date", date);
  }

  const response = await fetch(targetUrl, {
    cache: "no-store",
    headers: await authHeaders({ Accept: "application/json" }),
  });
  const text = await response.text();

  return new NextResponse(text, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") || "application/json",
    },
  });
}

async function proxyDailyGoal(request: Request, method: "POST" | "PUT") {
  const body = await request.json();
  const response = await fetch(`${API_BASE_URL}/api/v1/daily-goals`, {
    method,
    headers: await authHeaders({
      Accept: "application/json",
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(body),
  });

  const text = await response.text();
  return new NextResponse(text, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") || "application/json",
    },
  });
}

export async function POST(request: Request) {
  return proxyDailyGoal(request, "POST");
}

export async function PUT(request: Request) {
  return proxyDailyGoal(request, "PUT");
}
