import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ProfileTab, UserProfileDashboardData } from "@/data/user-profile";

type UserProfileHeroData = Pick<UserProfileDashboardData, "user"> & {
  tabs: ProfileTab[];
};

export function UserProfileHero({ dashboard }: { dashboard: UserProfileHeroData }) {
  return (
    <section className="relative bg-[#EBEBFF] px-6 pt-20 lg:px-8">
      <div className="mx-auto max-w-[1320px] overflow-hidden rounded-[18px] border border-[#D8D6FF] bg-white shadow-[0_14px_34px_rgba(86,79,253,0.08)]">
        <div className="flex flex-col gap-8 p-8 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-6">
            <div className="relative size-[110px] shrink-0 overflow-hidden rounded-full bg-[#E9EAF0]">
              <Image src={dashboard.user.avatar} alt={dashboard.user.name} fill priority sizes="110px" className="object-cover" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-normal text-[#1D2026]">{dashboard.user.name}</h1>
              <p className="mt-3 text-base text-[#6E7485]">{dashboard.user.headline}</p>
            </div>
          </div>

          <Link href="#" className="inline-flex h-14 items-center justify-center gap-3 rounded-[18px] bg-[#EBEBFF] px-8 text-lg font-semibold text-[#564FFD] transition hover:bg-[#DEDDFF]">
            Become Instructor
            <ArrowRight className="size-6" />
          </Link>
        </div>

        <nav className="border-t border-[#E9EAF0]">
          <div className="flex overflow-x-auto px-4 sm:justify-center sm:gap-6 sm:px-0">
            {dashboard.tabs.map((tab) => (
              <Link
                key={tab.label}
                href={tab.href}
                className={`relative flex h-[68px] min-w-[168px] items-center justify-center text-center text-base font-medium transition ${
                  tab.active ? "text-[#1D2026]" : "text-[#4E5566] hover:text-[#564FFD]"
                }`}
              >
                {tab.label}
                {tab.active ? <span className="absolute inset-x-0 bottom-0 h-[3px] bg-[#564FFD]" /> : null}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </section>
  );
}
