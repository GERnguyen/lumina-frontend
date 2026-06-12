import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api-base";
import { authHeaders } from "@/lib/server-auth";

export async function POST(request: Request) {
  const body = await request.json();
  const response = await fetch(`${API_BASE_URL}/api/v1/wishlist`, {
    method: "POST",
    headers: await authHeaders({
      Accept: "application/json",
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({ courseId: body.courseId }),
  });
  const text = await response.text();

  return new NextResponse(text, {
    status: response.status,
    headers: { "Content-Type": response.headers.get("Content-Type") || "application/json" },
  });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("courseId");

  if (!courseId) {
    return NextResponse.json({ success: false, message: "Missing course id" }, { status: 400 });
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/wishlist?courseId=${encodeURIComponent(courseId)}`, {
    method: "DELETE",
    headers: await authHeaders({ Accept: "application/json" }),
  });
  const text = await response.text();

  return new NextResponse(text, {
    status: response.status,
    headers: { "Content-Type": response.headers.get("Content-Type") || "application/json" },
  });
}
