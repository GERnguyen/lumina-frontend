"use client";

import { Suspense } from "react";
import { GoogleCallbackHandler } from "@/components/features/auth/GoogleCallbackHandler";
import { Loader2 } from "lucide-react";

export default function InstructorGoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white">
          <Loader2 className="size-10 animate-spin text-[#564FFD]" />
          <p className="text-sm font-semibold text-[#6E7485]">Loading Google sign-in…</p>
        </div>
      }
    >
      <GoogleCallbackHandler role="INSTRUCTOR" />
    </Suspense>
  );
}
