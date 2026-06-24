"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, UserRound, Bell } from "lucide-react";
import { useState } from "react";
import type { UserDto } from "@/types";
import { clearAuthSession } from "@/lib/auth-session";
import { useAuthStore } from "@/stores/auth-store";
import { getProfileAvatar } from "@/lib/format";

export function CoursesUserMenu({ user }: { user: UserDto }) {
  const router = useRouter();
  const clearSession = useAuthStore((state) => state.clearSession);
  const [isOpen, setIsOpen] = useState(false);
  const avatar = getProfileAvatar(user, "Lumina learner");
  const name = user.name || "Lumina learner";

  async function handleLogout() {
    await clearAuthSession();
    clearSession();
    setIsOpen(false);
    router.push("/login?logout=true");
    router.refresh();
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="flex h-12 items-center gap-3 rounded-full border border-[#E9EAF0] bg-white py-1 pl-1 pr-4 text-left transition hover:border-[#7872FD] hover:shadow-[0_12px_28px_rgba(120,114,253,0.16)]"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <span className="relative size-10 overflow-hidden rounded-full bg-[#E9EAF0]">
          <Image src={avatar} alt={name} fill sizes="40px" className="object-cover" />
        </span>
        <span className="hidden max-w-[140px] truncate text-sm font-semibold text-[#1D2026] lg:block">
          {name}
        </span>
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-[calc(100%+10px)] z-30 w-56 overflow-hidden rounded-[14px] border border-[#E9EAF0] bg-white py-2 shadow-[0_18px_48px_rgba(29,32,38,0.16)]">
          <Link
            href="/user-profile"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#4E5566] transition hover:bg-[#F5F7FA] hover:text-[#7872FD]"
          >
            <UserRound className="size-4" />
            Profile
          </Link>
          <Link
            href="/user-profile?tab=notifications"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#4E5566] transition hover:bg-[#F5F7FA] hover:text-[#7872FD]"
          >
            <Bell className="size-4" />
            Notifications
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-[#4E5566] transition hover:bg-[#F5F7FA] hover:text-[#D92D20]"
          >
            <LogOut className="size-4" />
            Log out
          </button>
        </div>
      ) : null}
    </div>
  );
}
