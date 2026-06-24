"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Award,
  Bell,
  BookOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  User,
  X,
} from "lucide-react";
import type { UserDto } from "@/types";
import { clearAuthSession } from "@/lib/auth-session";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";
import { getProfileAvatar } from "@/lib/format";
import { Button, ToastContainer } from "../ui/shared";
import { InstructorNotifications } from "./notifications/InstructorNotifications";

interface InstructorLayoutClientProps {
  children: React.ReactNode;
  user: UserDto;
}

export function InstructorLayoutClient({ children, user }: InstructorLayoutClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const clearSession = useAuthStore((state) => state.clearSession);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const avatar = getProfileAvatar(user, "Giảng viên");
  const name = user.name || "Giảng viên";
  const email = user.email || "instructor@cinx.local";

  const navigationItems = [
    {
      name: "Tổng quan",
      href: "/instructor/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/instructor/dashboard",
    },
    {
      name: "Khóa học của tôi",
      href: "/instructor/courses",
      icon: BookOpen,
      active: pathname.startsWith("/instructor/courses"),
    },
    {
      name: "Chứng chỉ",
      href: "/instructor/certificates",
      icon: Award,
      active: pathname.startsWith("/instructor/certificates"),
    },
    {
      name: "Cá nhân",
      href: "/instructor/profile",
      icon: User,
      active: pathname.startsWith("/instructor/profile"),
    },
    {
      name: "Thông báo",
      href: "/instructor/notifications",
      icon: Bell,
      active: pathname.startsWith("/instructor/notifications"),
    },
  ];

  async function handleLogout() {
    try {
      await clearAuthSession();
      clearSession();
      router.push("/login?logout=true");
      router.refresh();
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  }

  const pageTitle = pathname.includes("/instructor/dashboard")
    ? "Tổng quan"
    : pathname.includes("/instructor/courses")
      ? "Khóa học của tôi"
      : pathname.includes("/instructor/certificates")
        ? "Quản lý chứng chỉ"
        : pathname.includes("/instructor/profile")
          ? "Thông tin cá nhân"
          : pathname.includes("/instructor/notifications")
            ? "Thông báo giảng viên"
            : "Khu vực giảng viên";

  const sidebar = (
    <>
      <div className="flex h-[72px] items-center border-b border-primary-900/60 px-6">
        <Link href="/instructor/dashboard" className="flex items-center gap-2.5">
          <span className="font-logo text-2xl font-bold tracking-wide text-white">
            LM <span className="text-primary-400">Cinx</span>
          </span>
          <span className="rounded-md border border-primary-500/30 bg-primary-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-300">
            Giảng viên
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-6">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "group flex items-center justify-between rounded-lg px-4 py-3 text-sm font-semibold transition-colors",
                item.active
                  ? "bg-primary-500/20 text-white ring-1 ring-primary-400/20"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn("size-5 shrink-0", item.active ? "text-primary-300" : "text-gray-500 group-hover:text-white")} />
                <span>{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center justify-between gap-3 border-t border-primary-900/60 bg-primary-950/70 p-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative size-10 shrink-0 overflow-hidden rounded-full border border-white/10 bg-white/10">
            <Image src={avatar} alt={name} fill sizes="40px" className="object-cover" />
          </div>
          <div className="min-w-0 text-left">
            <p className="truncate text-xs font-semibold text-white">{name}</p>
            <p className="truncate text-[10px] text-gray-400">{email}</p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="text-gray-400 hover:bg-white/10 hover:text-red-300"
          title="Đăng xuất"
        >
          <LogOut className="size-4" />
        </Button>
      </div>
    </>
  );

  return (
    <div className="instructor-shell flex h-screen bg-gray-50 font-sans text-gray-800 antialiased">
      <aside className="hidden w-[260px] shrink-0 flex-col bg-primary-950 text-white md:flex">
        {sidebar}
      </aside>

      <div className="fixed left-0 right-0 top-0 z-40 flex h-[60px] items-center justify-between border-b border-primary-900/60 bg-primary-950 px-4 text-white md:hidden">
        <span className="font-logo text-xl font-bold tracking-wide">
          LM <span className="text-primary-400">Cinx</span>
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen((value) => !value)}
          className="text-gray-300 hover:bg-white/10 hover:text-white"
          aria-label={isMobileMenuOpen ? "Đóng menu" : "Mở menu"}
        >
          {isMobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </Button>
      </div>

      {isMobileMenuOpen ? (
        <button
          type="button"
          aria-label="Đóng menu"
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed bottom-0 left-0 top-[60px] z-40 flex w-[260px] flex-col border-r border-primary-900/60 bg-primary-950 text-white transition-transform duration-300 md:hidden",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebar}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden pt-[60px] md:pt-0">
        <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 md:px-8">
          <div className="min-w-0 text-left">
            <h1 className="truncate text-lg font-bold leading-none text-gray-900 sm:text-xl">{pageTitle}</h1>
            <p className="mt-1 truncate text-xs text-gray-500">Xin chào, {name}</p>
          </div>
          <div className="flex items-center gap-3">
            <InstructorNotifications />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 md:p-8">
          <div className="mx-auto w-full max-w-[1400px]">{children}</div>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
