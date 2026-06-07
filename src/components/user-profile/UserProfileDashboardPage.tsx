import { ArrowLeft, ArrowRight } from "lucide-react";
import { CoursesFooter } from "@/components/courses/CoursesFooter";
import type { UserProfileDashboardData } from "@/data/user-profile";
import { UserProfileHero } from "./UserProfileHero";
import { UserProfileLearningCard } from "./UserProfileLearningCard";
import { UserProfileStatCard } from "./UserProfileStatCard";
import { UserProfileTopNav } from "./UserProfileTopNav";

export function UserProfileDashboardPage({ dashboard, isFallback }: { dashboard: UserProfileDashboardData; isFallback?: boolean }) {
  return (
    <main className="min-h-screen bg-white">
      <UserProfileTopNav avatar={dashboard.user.avatar} />
      <UserProfileHero dashboard={dashboard} />

      <section className="px-6 py-10 lg:px-8">
        <div className="mx-auto max-w-[1320px]">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold tracking-normal text-[#1D2026]">Dashboard</h2>
            {isFallback ? (
              <span className="rounded-full bg-[#FFF4E5] px-3 py-1 text-xs font-semibold text-[#B85C00]">
                Mock fallback
              </span>
            ) : null}
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {dashboard.stats.map((stat) => (
              <UserProfileStatCard key={stat.label} stat={stat} />
            ))}
          </div>

          <div className="mt-11 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-normal text-[#1D2026]">Let’s start learning, {dashboard.user.name.split(" ")[0]}</h2>
            <div className="flex gap-2">
              <button type="button" aria-label="Previous course" className="flex size-10 items-center justify-center bg-[#EBEBFF] text-[#564FFD] transition hover:bg-[#DEDDFF]">
                <ArrowLeft className="size-5" />
              </button>
              <button type="button" aria-label="Next course" className="flex size-10 items-center justify-center bg-[#EBEBFF] text-[#564FFD] transition hover:bg-[#DEDDFF]">
                <ArrowRight className="size-5" />
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {dashboard.learningCourses.map((course) => (
              <UserProfileLearningCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      <CoursesFooter />
    </main>
  );
}
