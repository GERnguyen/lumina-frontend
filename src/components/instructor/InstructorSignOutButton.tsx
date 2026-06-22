"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { clearAuthSession } from "@/lib/auth-session";
import { useAuthStore } from "@/stores/auth-store";

export function InstructorSignOutButton({ collapsed = false }: { collapsed?: boolean }) {
  const router = useRouter();
  const clearSession = useAuthStore((state) => state.clearSession);

  async function handleSignOut() {
    await clearAuthSession();
    clearSession();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      title={collapsed ? "Sign out" : undefined}
      className={`mb-8 flex h-12 items-center gap-3 text-sm font-medium tracking-[-0.14px] text-[#8C94A3] transition hover:text-white ${collapsed ? "w-full justify-center px-3" : "px-6"}`}
    >
      <LogOut className="size-5 shrink-0" />
      {collapsed ? null : "Sign out"}
    </button>
  );
}
