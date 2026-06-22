"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  PlusCircle,
  Settings,
  SquareStack,
} from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { InstructorSignOutButton } from "@/components/instructor/InstructorSignOutButton";

const navItems = [
  { key: "dashboard", label: "Dashboard", href: "/instructor", icon: BarChart3 },
  { key: "create-course", label: "Create New Course", href: "/instructor/courses/new", icon: PlusCircle },
  { key: "courses", label: "My Courses", href: "/instructor/courses", icon: SquareStack },
  { key: "earning", label: "Earning", href: "/instructor/earning", icon: CreditCard },
  { key: "settings", label: "Settings", href: "/instructor/settings", icon: Settings },
];

type InstructorSidebarProps = {
  activeItem?: "dashboard" | "create-course" | "courses" | "earning" | "settings";
};

export function InstructorSidebar({ activeItem = "dashboard" }: InstructorSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`sticky top-0 hidden h-screen shrink-0 flex-col bg-[#1D2026] transition-all duration-300 xl:flex ${collapsed ? "w-[84px]" : "w-[280px]"}`}>
      <div className={`flex h-[70px] items-center border-b border-[#363B47] ${collapsed ? "justify-between gap-1 px-3" : "justify-between px-6"}`}>
        {collapsed ? (
          <div className="flex h-10 w-10 items-center justify-center text-lg font-black tracking-[-0.08em] text-white">
            LM
          </div>
        ) : (
          <BrandLogo tone="light" size="sm" className="text-white" />
        )}
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          className="inline-flex size-8 shrink-0 items-center justify-center text-white/80 transition hover:text-white"
          aria-label={collapsed ? "Expand instructor sidebar" : "Collapse instructor sidebar"}
        >
          {collapsed ? <ChevronRight className="size-5" /> : <ChevronLeft className="size-5" />}
        </button>
      </div>

      <nav className="mt-4 flex flex-1 flex-col">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.key === activeItem;
          return (
            <Link
              key={item.label}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex h-12 items-center gap-3 text-sm font-medium tracking-[-0.14px] transition ${collapsed ? "justify-center px-3" : "px-6"} ${
                isActive ? "bg-[#564FFD] text-white" : "text-[#8C94A3] hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="size-5 shrink-0" />
              {collapsed ? null : <span className="min-w-0 flex-1 truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <InstructorSignOutButton collapsed={collapsed} />
    </aside>
  );
}
