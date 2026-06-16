import Image from "next/image";
import { Bell, Search } from "lucide-react";
import type { InstructorDashboardData } from "@/services/instructor-dashboard-service";

type InstructorTopbarProps = {
  user: InstructorDashboardData["user"];
  title?: string;
  searchAction?: string;
};

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

export function InstructorTopbar({ user, title = "Dashboard", searchAction = "/instructor" }: InstructorTopbarProps) {
  return (
    <header className="flex min-h-[88px] items-center justify-between bg-white px-5 py-5 shadow-[inset_0_-1px_0_#E9EAF0] sm:px-8 2xl:px-40">
      <div>
        <p className="text-sm font-medium tracking-[-0.14px] text-[#6E7485]">{greeting()}</p>
        <h1 className="mt-1 text-xl font-semibold text-[#1D2026]">{title}</h1>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <form action={searchAction} className="hidden h-12 w-[312px] items-center gap-3 rounded-[18px] bg-[#F5F7FA] px-[18px] lg:flex">
          <Search className="size-5 text-[#4E5566]" />
          <input
            name="query"
            placeholder="Search"
            className="w-full border-0 bg-transparent p-0 text-sm text-[#1D2026] placeholder:text-[#8C94A3] focus:ring-0"
          />
        </form>

        <button type="button" aria-label="Notifications" className="relative flex size-12 items-center justify-center rounded-[18px] bg-[#F5F7FA] text-[#4E5566]">
          <Bell className="size-5" />
          <span className="absolute right-3 top-3 size-2 rounded-full bg-[#564FFD]" />
        </button>

        <div className="relative size-12 overflow-hidden rounded-full bg-[#EBEBFF]">
          <Image src={user.avatar} alt={user.name} fill sizes="48px" className="object-cover" />
        </div>
      </div>
    </header>
  );
}
