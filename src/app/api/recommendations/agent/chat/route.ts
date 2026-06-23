import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api-base";
import { authHeaders } from "@/lib/server-auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Call the backend API gateway stream endpoint securely
    const response = await fetch(`${API_BASE_URL}/api/v1/recommendations/agent/chat`, {
      method: "POST",
      headers: await authHeaders({
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      }),
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      return new NextResponse(text || `Backend stream request failed with status ${response.status}`, {
        status: response.status,
      });
    }

    // Forward the readable stream directly back to the client browser
    return new NextResponse(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("Error in agent chat proxy route:", error);
    return new NextResponse(error?.message || "Internal Server Error", { status: 500 });
  }
}
