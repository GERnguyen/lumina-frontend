"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { FormEvent, useState } from "react";
import { Button, Input, Password, Radio } from "@/components/ui";
import { AuthService } from "@/services";
import type { AuthRequestDto, TokenResponseDto } from "@/types";
import { useAuthStore } from "@/stores/auth-store";
import { getErrorMessage } from "@/lib/errors";
import { persistAuthSession } from "@/lib/auth-session";
import { cn } from "@/lib/utils";

type LoginRequest = AuthRequestDto & {
  role: "USER" | "INSTRUCTOR" | "ADMIN";
};

async function login(requestBody: LoginRequest): Promise<TokenResponseDto> {
  const response = await AuthService.login({ body: requestBody });

  if (!response.data?.accessToken || !response.data.refreshToken) {
    throw new Error(response.message || "Login failed");
  }

  return response.data;
}

type LoginRole = Extract<LoginRequest["role"], "USER" | "INSTRUCTOR">;

const roleOptions: Array<{ label: string; value: LoginRole }> = [
  { label: "Student", value: "USER" },
  { label: "Instructor", value: "INSTRUCTOR" },
];

function getSafeRedirectUrl(url: string | null): string | null {
  if (!url) return null;
  try {
    const decoded = decodeURIComponent(url);
    if (decoded.startsWith("/") && !decoded.startsWith("//")) {
      return decoded;
    }
  } catch (e) {
    console.error(e);
  }
  return null;
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSession = useAuthStore((state) => state.setSession);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<LoginRole>("USER");

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: async (tokens) => {
      const session = await persistAuthSession(tokens);
      setSession({ accessToken: session.accessToken });

      const returnUrlParam = searchParams ? searchParams.get("returnUrl") : null;
      let returnUrl = getSafeRedirectUrl(returnUrlParam);

      if (!returnUrl && typeof window !== "undefined") {
        try {
          const cached = localStorage.getItem("login_return_url");
          returnUrl = getSafeRedirectUrl(cached);
          localStorage.removeItem("login_return_url");
        } catch (e) {
          console.error(e);
        }
      }

      if (!returnUrl && typeof window !== "undefined") {
        try {
          const referrer = document.referrer;
          if (referrer && referrer.startsWith(window.location.origin)) {
            const relativePath = referrer.substring(window.location.origin.length);
            if (
              relativePath.startsWith("/") &&
              !relativePath.startsWith("//") &&
              !relativePath.startsWith("/login") &&
              !relativePath.startsWith("/register")
            ) {
              returnUrl = relativePath;
            }
          }
        } catch (e) {
          console.error(e);
        }
      }

      router.push(returnUrl || (role === "INSTRUCTOR" ? "/instructor" : "/"));
      router.refresh();
    },
  });

  function handleRoleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setRole(event.target.value as LoginRole);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    loginMutation.mutate({ email, password, role });
  }

  const error = loginMutation.error
    ? getErrorMessage(loginMutation.error, "Unable to sign in")
    : undefined;

  const errorParam = searchParams ? searchParams.get("error") : null;
  const returnUrlParam = searchParams ? searchParams.get("returnUrl") : null;

  const displayMessage = (() => {
    if (errorParam === "session_expired") {
      return {
        text: "Your session has expired. Please sign in again.",
        type: "error",
      };
    }
    if (returnUrlParam && decodeURIComponent(returnUrlParam).includes("/learning/")) {
      return {
        text: "Please sign in to access your course.",
        type: "info",
      };
    }
    return null;
  })();

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-md flex-col gap-5"
    >
      <div className="space-y-2 text-center">
        <h1>Welcome back</h1>
        <p>Sign in to continue learning on Lumina.</p>
      </div>

      {displayMessage && (
        <div className={cn(
          "rounded-lg border px-4 py-3 text-sm font-semibold",
          displayMessage.type === "error"
            ? "border-danger-200 bg-danger-100 text-danger-700"
            : "border-[#DEDFFF] bg-[#F4F3FF] text-[#564FFD]"
        )}>
          {displayMessage.text}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-danger-200 bg-danger-100 px-4 py-3 text-sm text-danger-700">
          {error}
        </div>
      )}

      <div className="flex flex-col">
        <label className="mb-2 block text-sm font-medium text-foreground">
          Account type
        </label>
        <div className="flex flex-row gap-2">
          {roleOptions.map((option) => (
            <Radio
              key={option.value}
              name="role"
              value={option.value}
              checked={role === option.value}
              onChange={handleRoleChange}
              label={option.label}
              id={`login-${option.value}`}
            />
          ))}
        </div>
      </div>

      <Input
        id="email"
        name="email"
        label="Email"
        placeholder="Enter your email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />

      <Password
        purpose="login"
        id="password"
        name="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        autoComplete="current-password"
        required
      />

      <div className="flex items-center justify-between">
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          Forgot password?
        </Link>
      </div>

      <Button
        type="submit"
        content="Sign In"
        isLoading={loginMutation.isPending}
        className="w-full"
      />
    </form>
  );
}
