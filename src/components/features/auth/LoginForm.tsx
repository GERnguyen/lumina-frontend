"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { FormEvent, useState } from "react";
import { Button, Input, Password, Radio } from "@/components/ui";
import { AuthService } from "@/services";
import { useAuthStore } from "@/stores/auth-store";
import { getErrorMessage } from "@/lib/errors";

export default function LoginForm() {
  const router = useRouter();
  const setTokens = useAuthStore((state) => state.setTokens);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"USER" | "INSTRUCTOR">("USER");

  const loginMutation = useMutation({
    mutationFn: async (body: any) => {
      const res = await AuthService.login({ body });
      if (!res.success || !res.data) {
        throw new Error(res.message || "Unable to sign in");
      }
      return res.data;
    },
    onSuccess: (tokens) => {
      setTokens(tokens);
      router.push("/");
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    loginMutation.mutate({ email, password, role });
  }

  const error = loginMutation.error
    ? getErrorMessage(loginMutation.error, "Unable to sign in")
    : undefined;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-md flex-col gap-5"
    >
      <div className="space-y-2 text-center">
        <h1>Welcome back</h1>
        <p>Sign in to continue learning on Lumina.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-danger-200 bg-danger-100 px-4 py-3 text-sm text-danger-700">
          {error}
        </div>
      )}

      <div className="flex flex-col">
        <label className="block mb-2 text-sm font-medium text-foreground">
          User Type
        </label>
        <div className="flex flex-row gap-4">
          <Radio
            name="role"
            value="USER"
            checked={role === "USER"}
            onChange={() => setRole("USER")}
            label="Student"
            id="USER"
          />
          <Radio
            name="role"
            value="INSTRUCTOR"
            checked={role === "INSTRUCTOR"}
            onChange={() => setRole("INSTRUCTOR")}
            label="Instructor"
            id="INSTRUCTOR"
          />
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
