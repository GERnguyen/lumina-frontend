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

export async function PUT(request: Request) {
  const body = await request.json();
  const userId = body.userId as string | undefined;

  if (!userId) {
    return NextResponse.json({ success: false, message: "Missing user id." }, { status: 400 });
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/users/${encodeURIComponent(userId)}`, {
    method: "PUT",
    headers: await authHeaders({
      Accept: "application/json",
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({
      name: body.name,
      bio: body.bio,
    }),
  });
  const text = await response.text();

  if (!response.ok) {
    return NextResponse.json(
      { success: false, message: parseMessage(text, "Could not update profile.") },
      { status: response.status },
    );
  }

  return new NextResponse(text, {
    status: response.status,
    headers: { "Content-Type": response.headers.get("Content-Type") || "application/json" },
  });
}
