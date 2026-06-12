import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api-base";
import { authHeaders } from "@/lib/server-auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ success: false, message: "Missing coupon code" }, { status: 400 });
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/vouchers/code?code=${encodeURIComponent(code)}`, {
    cache: "no-store",
    headers: await authHeaders({ Accept: "application/json" }),
  });
  const text = await response.text();

  return new NextResponse(text, {
    status: response.status,
    headers: { "Content-Type": response.headers.get("Content-Type") || "application/json" },
  });
}
