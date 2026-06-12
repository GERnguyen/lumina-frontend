import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api-base";
import { authHeaders } from "@/lib/server-auth";

function parseMessage(text: string, fallback: string) {
  try {
    const payload = JSON.parse(text) as { message?: string; detail?: string; title?: string };
    return payload.message || payload.detail || payload.title || fallback;
  } catch {
    return text || fallback;
  }
}

export async function POST(request: Request) {
  const body = await request.json();

  const response = await fetch(`${API_BASE_URL}/api/v1/auth/change-password`, {
    method: "POST",
    headers: await authHeaders({
      Accept: "application/json",
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({
      email: body.email,
      oldPassword: body.currentPassword,
      newPassword: body.newPassword,
    }),
  });
  const text = await response.text();

  if (!response.ok) {
    return NextResponse.json(
      { success: false, message: parseMessage(text, "Could not change password.") },
      { status: response.status },
    );
  }

  return new NextResponse(text || JSON.stringify({ success: true, message: "Password changed successfully." }), {
    status: response.status,
    headers: { "Content-Type": response.headers.get("Content-Type") || "application/json" },
  });
}
