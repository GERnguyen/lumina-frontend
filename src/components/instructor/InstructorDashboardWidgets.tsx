import Image from "next/image";
import Link from "next/link";
import { ArrowDown, MessageCircle, Pencil, ShoppingBag, Star, UploadCloud } from "lucide-react";
import type { InstructorDashboardData } from "@/services/instructor-dashboard-service";

const activityIcons = {
  comment: MessageCircle,
  rating: Star,
  purchase: ShoppingBag,
  course: UploadCloud,
};

export function InstructorProfileBanner({ data }: { data: InstructorDashboardData }) {
  return (
    <section className="flex flex-col gap-5 rounded-[18px] bg-[#111033] p-6 text-white lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 items-center gap-5">
        <div className="relative size-[72px] shrink-0 overflow-hidden rounded-full bg-[#EBEBFF]">
          <Image src={data.user.avatar} alt={data.user.name} fill sizes="72px" className="object-cover" />
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold">{data.user.name}</h2>
          <p className="mt-1 truncate text-xs text-white/65">{data.user.email || "Lumina instructor"}</p>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-4 lg:max-w-[520px]">
        <span className="shrink-0 text-xs text-white/65">
          {data.profile.completedSteps}/{data.profile.totalSteps} Steps
        </span>
        <div className="h-3 flex-1 bg-white/20">
          <div className="h-full bg-[#23BD33]" style={{ width: `${data.profile.percent}%` }} />
        </div>
        <strong className="shrink-0 text-sm">{data.profile.percent}% Completed</strong>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <Link href="/instructor/settings" className="inline-flex h-12 items-center justify-center rounded-[18px] bg-[#564FFD] px-6 text-sm font-semibold text-white transition hover:bg-[#453FCA]">
          Edit Biography
        </Link>
        <button type="button" aria-label="Download profile report" className="flex size-12 items-center justify-center bg-white/10 text-white transition hover:bg-white/15">
          <ArrowDown className="size-5" />
        </button>
      </div>
    </section>
  );
}

export function InstructorActivityPanel({ activities }: { activities: InstructorDashboardData["activities"] }) {
  return (
    <section className="overflow-hidden rounded-[18px] bg-white">
      <div className="flex h-[54px] items-center justify-between border-b border-[#E9EAF0] px-5">
        <h2 className="text-base font-medium text-[#1D2026]">Recent Activity</h2>
        <span className="text-sm tracking-[-0.14px] text-[#6E7485]">Today</span>
      </div>
      <div className="space-y-5 p-5">
        {activities.map((activity) => {
          const Icon = activityIcons[activity.type];
          return (
            <article key={activity.id} className="flex gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#564FFD] text-white">
                <Icon className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm leading-5 text-[#4E5566]">{activity.title}</p>
                <span className="mt-1 block text-xs text-[#8C94A3]">{activity.time}</span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function InstructorTopCoursesPanel({ courses }: { courses: InstructorDashboardData["topCourses"] }) {
  return (
    <section className="overflow-hidden rounded-[18px] bg-white">
      <div className="flex h-[54px] items-center justify-between border-b border-[#E9EAF0] px-5">
        <h2 className="text-base font-medium text-[#1D2026]">Top Courses</h2>
        <Link href="/instructor/courses" className="text-sm font-medium text-[#564FFD]">View all</Link>
      </div>
      <div className="divide-y divide-[#E9EAF0]">
        {courses.length ? courses.map((course) => (
          <article key={course.id} className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-medium text-[#1D2026]">{course.title}</h3>
              <p className="mt-1 text-xs text-[#8C94A3]">{course.status || "DRAFT"} · {course.enrollments} enrollments</p>
            </div>
            <strong className="shrink-0 text-sm font-semibold text-[#1D2026]">
              {new Intl.NumberFormat("en-US", { notation: "compact" }).format(course.revenue)} VND
            </strong>
          </article>
        )) : (
          <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
            <Pencil className="size-8 text-[#C6CAD1]" />
            <p className="mt-3 text-sm text-[#6E7485]">Create your first course to see performance here.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export function InstructorFooter() {
  return (
    <footer className="flex flex-col gap-4 py-5 text-sm tracking-[-0.14px] text-[#6E7485] md:flex-row md:items-center md:justify-between">
      <p>
        <span>© 2026 - Lumina. </span>
        <span className="text-[#1D2026]">All rights reserved.</span>
      </p>
      <div className="flex flex-wrap gap-6">
        <Link href="/#faq" className="transition hover:text-[#564FFD]">FAQs</Link>
        <Link href="#" className="transition hover:text-[#564FFD]">Privacy Policy</Link>
        <Link href="#" className="transition hover:text-[#564FFD]">Terms & Condition</Link>
      </div>
    </footer>
  );
}
