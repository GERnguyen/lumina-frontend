import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api-base";
import { getServerAccessToken } from "@/lib/server-auth";

export const runtime = "nodejs";

type PresignedPayload = {
  success?: boolean;
  message?: string;
  data?: {
    presignedUrl?: string;
    fileName?: string;
    fileKey?: string;
  };
};

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message || fallback;
  return fallback;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "Missing upload file." }, { status: 400 });
    }

    const token = await getServerAccessToken();
    if (!token) {
      return NextResponse.json({ message: "Please sign in again before uploading files." }, { status: 401 });
    }

    const contentType = file.type || "application/octet-stream";
    const presignedUrl = new URL("/api/v1/users/upload/presigned-url", API_BASE_URL);
    presignedUrl.searchParams.set("fileName", file.name);
    presignedUrl.searchParams.set("contentType", contentType);

    const presignedResponse = await fetch(presignedUrl.toString(), {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const presignedPayload = (await presignedResponse.json().catch(() => ({}))) as PresignedPayload;

    if (!presignedResponse.ok || !presignedPayload.data?.presignedUrl || !presignedPayload.data.fileKey) {
      return NextResponse.json(
        { message: presignedPayload.message || "Could not prepare file upload." },
        { status: presignedResponse.status || 502 },
      );
    }

    const uploadResponse = await fetch(presignedPayload.data.presignedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": contentType,
        "x-amz-acl": "public-read",
      },
      body: Buffer.from(await file.arrayBuffer()),
    });

    if (!uploadResponse.ok) {
      return NextResponse.json(
        { message: `Storage upload failed with status ${uploadResponse.status}.` },
        { status: 502 },
      );
    }

    return NextResponse.json({
      fileKey: presignedPayload.data.fileKey,
      fileName: presignedPayload.data.fileName || file.name,
    });
  } catch (error) {
    return NextResponse.json(
      { message: errorMessage(error, "Could not upload file.") },
      { status: 500 },
    );
  }
}
