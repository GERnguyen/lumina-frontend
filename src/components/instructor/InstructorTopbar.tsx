"use client";

import Image from "next/image";
import { InstructorNotifications } from "@/components/instructor/InstructorNotifications";
import type { InstructorDashboardData } from "@/services/instructor-dashboard-service";

type InstructorTopbarProps = {
  user: InstructorDashboardData["user"];
  title?: string;
};

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

export function InstructorTopbar({ user, title = "Dashboard" }: InstructorTopbarProps) {
  return (
    <header className="flex min-h-[88px] items-center justify-between bg-white px-5 py-5 shadow-[inset_0_-1px_0_#E9EAF0] sm:px-8 2xl:px-40">
      <div>
        <p className="text-sm font-medium tracking-[-0.14px] text-[#6E7485]">{greeting()}</p>
        <h1 className="mt-1 text-xl font-semibold text-[#1D2026]">{title}</h1>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <InstructorNotifications />

        <div className="relative size-12 overflow-hidden rounded-full bg-[#EBEBFF]">
          <Image src={user.avatar} alt={user.name} fill sizes="48px" className="object-cover" />
        </div>
      </div>
    </header>
  );
}
