"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthApi } from "@/services/api/auth-api";
import { persistAuthSession } from "@/lib/auth-session";
import { useAuthStore } from "@/stores/auth-store";
import { PKCE_VERIFIER_KEY, PKCE_RETURN_URL_KEY } from "@/lib/pkce";
import { Loader2, AlertCircle } from "lucide-react";

interface GoogleCallbackHandlerProps {
  role: "USER" | "INSTRUCTOR";
}

export function GoogleCallbackHandler({ role }: GoogleCallbackHandlerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSession = useAuthStore((state) => state.setSession);
  const [error, setError] = useState<string | null>(null);
  const hasHandled = useRef(false);

  useEffect(() => {
    // Prevent double-invocation in StrictMode
    if (hasHandled.current) return;
    hasHandled.current = true;

    async function handleCallback() {
      const code = searchParams?.get("code");
      const errorParam = searchParams?.get("error");

      if (errorParam) {
        setError(`Google sign-in was cancelled or denied: ${errorParam}`);
        return;
      }

      if (!code) {
        setError("No authorization code received from Google.");
        return;
      }

      // Retrieve PKCE verifier from sessionStorage
      const codeVerifier = sessionStorage.getItem(PKCE_VERIFIER_KEY);
      const returnUrl = sessionStorage.getItem(PKCE_RETURN_URL_KEY);

      if (!codeVerifier) {
        setError("OAuth session expired. Please try signing in again.");
        return;
      }

      // Clean up PKCE storage
      sessionStorage.removeItem(PKCE_VERIFIER_KEY);
      sessionStorage.removeItem(PKCE_RETURN_URL_KEY);

      // Important: The redirectUri MUST exactly match the one sent to Google during authorization
      const redirectUri = `${window.location.origin}/oauth2/callback/${role.toLowerCase()}`;

      try {
        const response = await AuthApi.loginWithGoogle({
          code,
          codeVerifier,
          role,
          redirectUri,
        });

        if (!response.data?.accessToken || !response.data?.refreshToken) {
          setError(response.message || "Google sign-in failed. Please try again.");
          return;
        }

        const session = await persistAuthSession(response.data);
        setSession({ accessToken: session.accessToken });

        // Redirect based on role
        if (role === "INSTRUCTOR") {
          const target =
            returnUrl && returnUrl.startsWith("/instructor") ? returnUrl : "/instructor/dashboard";
          router.replace(target);
        } else {
          router.replace(returnUrl || "/");
        }
        router.refresh();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "An unexpected error occurred.";
        setError(message);
      }
    }

    handleCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, router, searchParams, setSession]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white px-4">
        <div className="flex max-w-sm flex-col items-center gap-4 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-red-50">
            <AlertCircle className="size-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-[#1D2026]">Sign-in Failed</h1>
          <p className="text-sm text-[#6E7485]">{error}</p>
          <a
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-[#564FFD] px-6 text-sm font-bold text-white transition hover:bg-[#433EE8]"
          >
            Back to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white">
      <Loader2 className="size-10 animate-spin text-[#564FFD]" />
      <p className="text-sm font-semibold text-[#6E7485]">Signing you in with Google…</p>
    </div>
  );
}
