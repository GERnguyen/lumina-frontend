"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, UserRound, Home } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { clearAuthSession } from "@/lib/auth-session";
import { useAuthStore } from "@/stores/auth-store";

export function UserProfileUserMenu({ avatar }: { avatar: string }) {
  const router = useRouter();
  const clearSession = useAuthStore((state) => state.clearSession);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  async function handleLogout() {
    await clearAuthSession();
    clearSession();
    setIsOpen(false);
    router.push("/login?logout=true");
    router.refresh();
  }

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative size-12 overflow-hidden rounded-full bg-[#E9EAF0] focus:outline-none transition hover:opacity-90 cursor-pointer border border-[#E9EAF0]"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <Image src={avatar} alt="User avatar" fill sizes="48px" className="object-cover" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+10px)] z-30 w-56 overflow-hidden rounded-[14px] border border-[#E9EAF0] bg-white py-2 shadow-[0_18px_48px_rgba(29,32,38,0.16)]">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#4E5566] transition hover:bg-[#F5F7FA] hover:text-[#7872FD]"
          >
            <Home className="size-4" />
            Home
          </Link>
          <Link
            href="/user-profile"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#4E5566] transition hover:bg-[#F5F7FA] hover:text-[#7872FD]"
          >
            <UserRound className="size-4" />
            Profile Dashboard
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-[#4E5566] transition hover:bg-[#F5F7FA] hover:text-[#D92D20] cursor-pointer"
          >
            <LogOut className="size-4" />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
