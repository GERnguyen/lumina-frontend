import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, BookOpen, Bell, Flame, Trophy } from "lucide-react";
import type {
  CourseResponse,
  CourseProgressResponse,
  DailyGoalResponse,
  UserNotificationResponse,
} from "@/types";
import { StudentCourseCard } from "@/components/courses/StudentCourseCard";
import { cn } from "@/lib/utils";
import {
  getCourseImage,
  getCourseCategory,
  getCourseInstructorName,
  getCourseProgressPercentage,
  money,
} from "@/lib/format";

export function HomeSectionHeader({ title, action }: { title: string; action?: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="text-xl font-semibold text-[#1D2026]">{title}</h2>
      {action ? (
        <Link href={action} className="flex items-center gap-2 text-sm font-semibold text-[#7872FD] transition hover:text-[#5F58F0]">
          View all <ArrowRight className="size-4" />
        </Link>
      ) : null}
    </div>
  );
}

export function HomeStatCard({ icon: Icon, label, value, tone = "purple" }: { icon: LucideIcon; label: string; value: string | number; tone?: "purple" | "green" | "orange" | "blue" }) {
  const tones = {
    purple: "bg-[#EBEBFF] text-[#7872FD]",
    green: "bg-[#E7F7ED] text-[#19703E]",
    orange: "bg-[#FFF4E5] text-[#B85C00]",
    blue: "bg-[#E6F0FF] text-[#0066FF]",
  };

  return (
    <div className="rounded-[18px] border border-[#E9EAF0] bg-white p-5">
      <div className={cn("grid size-11 place-items-center rounded-[8px]", tones[tone])}>
        <Icon className="size-5" />
      </div>
      <p className="mt-5 text-2xl font-semibold text-[#1D2026]">{value}</p>
      <p className="mt-1 text-sm text-[#6E7485]">{label}</p>
    </div>
  );
}

export function HomeStats({
  stats,
  isLoading = false,
}: {
  stats: {
    activeCourses: number;
    completedCourses: number;
    currentStreak: number;
    unreadNotifications: number;
  };
  isLoading?: boolean;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <HomeStatCard
        icon={BookOpen}
        label="Active courses"
        value={isLoading ? "..." : stats.activeCourses}
      />
      <HomeStatCard
        icon={Trophy}
        label="Completed courses"
        value={isLoading ? "..." : stats.completedCourses}
        tone="green"
      />
      <HomeStatCard icon={Flame} label="Day streak" value={stats.currentStreak} tone="orange" />
      <HomeStatCard icon={Bell} label="Unread updates" value={stats.unreadNotifications} tone="blue" />
    </div>
  );
}

export function ContinueCourseCard({
  course,
  progress,
  index = 0,
  compact = false,
  isLoading = false,
}: {
  course: CourseResponse;
  progress?: CourseProgressResponse;
  index?: number;
  compact?: boolean;
  isLoading?: boolean;
}) {
  const image = getCourseImage(course, index);
  const category = getCourseCategory(course);
  const title = course.title || "Untitled Course";
  const instructor = getCourseInstructorName(course);
  const percentage = getCourseProgressPercentage(progress);
  const watchHref = course.id ? `/courses/${course.id}/watch` : "/courses";

  return (
    <Link href={watchHref} className="group flex gap-4 rounded-[18px] border border-[#E9EAF0] bg-white p-3 transition hover:-translate-y-0.5 hover:border-[#D8D6FF] hover:shadow-[0_16px_36px_rgba(29,32,38,0.08)]">
      <div className={cn("relative shrink-0 overflow-hidden rounded-[14px] bg-[#F5F7FA]", compact ? "size-20" : "h-24 w-32")}>
        <Image src={image} alt={title} fill sizes="128px" className="object-cover transition duration-300 group-hover:scale-105" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase text-[#7872FD]">{category}</p>
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-[#1D2026]">{title}</h3>
        <p className="mt-1 text-xs text-[#6E7485]">By {instructor}</p>
        {isLoading ? (
          <div className="mt-3 animate-pulse space-y-2">
            <div className="h-1.5 rounded-full bg-[#E2E8F0]" />
            <div className="h-3 w-16 bg-[#E2E8F0] rounded" />
          </div>
        ) : (
          <>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#E9EAF0]">
              <div className="h-full rounded-full bg-[#7872FD]" style={{ width: `${percentage}%` }} />
            </div>
            <p className="mt-1 text-xs text-[#6E7485]">{percentage}% complete</p>
          </>
        )}
      </div>
    </Link>
  );
}

export function RecommendationCard({ course, index = 0 }: { course: CourseResponse; index?: number }) {
  const image = getCourseImage(course, index);
  const category = getCourseCategory(course);
  const title = course.title || "Untitled Course";
  const price = course.discountedPrice ?? course.price;
  const priceLabel = money(price);
  const courseHref = course.id ? `/courses/${course.id}` : "/courses";

  return (
    <StudentCourseCard
      href={courseHref}
      title={title}
      image={image}
      category={category}
      price={priceLabel}
      className="min-h-[340px]"
      imageSizes="(min-width: 1280px) 240px, (min-width: 768px) 33vw, 100vw"
    />
  );
}

export function EmptyHomeState({ title, copy, href, action }: { title: string; copy: string; href: string; action: string }) {
  return (
    <div className="rounded-[18px] border border-dashed border-[#C6CAD1] bg-[#F8F8FF] p-6 text-center">
      <h3 className="text-base font-semibold text-[#1D2026]">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#6E7485]">{copy}</p>
      <Link href={href} className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-[#7872FD] px-5 text-sm font-semibold text-white transition hover:bg-[#5F58F0]">
        {action}
      </Link>
    </div>
  );
}

export function NotificationList({ notifications }: { notifications: UserNotificationResponse[] }) {
  if (!notifications.length) {
    return <EmptyHomeState title="No notifications yet" copy="Course updates, reminders, and account messages will appear here." href="/courses" action="Explore courses" />;
  }

  return (
    <div className="space-y-3">
      {notifications.map((item) => (
        <div key={item.id} className="rounded-[18px] border border-[#E9EAF0] bg-white p-4">
          <div className="flex items-start gap-3">
            <span className={cn("mt-1 size-2 shrink-0 rounded-full", item.isRead ? "bg-[#C6CAD1]" : "bg-[#7872FD]")} />
            <div>
              <h3 className="text-sm font-semibold text-[#1D2026]">{item.title}</h3>
              <p className="mt-1 text-sm leading-6 text-[#6E7485]">{item.message}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function MiniGoalList({ goals }: { goals: DailyGoalResponse[] }) {
  if (!goals.length) {
    return <p className="text-sm leading-6 text-[#6E7485]">No goal set for today. Add one to keep your study rhythm visible.</p>;
  }

  return (
    <div className="space-y-3">
      {goals.map((goal) => {
        const targetValue = goal.targetValue || 0;
        const currentValue = goal.currentValue || 0;
        const progress = targetValue > 0 ? Math.min(100, Math.round((currentValue / targetValue) * 100)) : 0;
        
        let label = "Learning goal";
        if (goal.goalType === "XP") label = "Earn XP";
        else if (goal.goalType === "LEARNING_ITEMS_COMPLETED") label = "Complete learning items";
        else if (goal.goalType === "VIDEOS_COMPLETED") label = "Finish videos";
        else if (goal.goalType === "QUIZZES_PASSED") label = "Pass quizzes";
        else if (goal.goalType === "ASSIGNMENTS_SUBMITTED") label = "Submit assignments";
        else if (goal.goalType === "SPECIFIC_LESSON_COMPLETED") label = "Complete a specific lesson";

        return (
          <div key={`${goal.goalType}-${goal.id || goal.goalDate}`} className="rounded-[18px] border border-[#E9EAF0] bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[#1D2026]">{label}</p>
              <p className="text-xs text-[#6E7485]">{currentValue}/{targetValue}</p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#E9EAF0]">
              <div className={cn("h-full rounded-full", goal.isCompleted ? "bg-[#23BD33]" : "bg-[#7872FD]")} style={{ width: `${progress}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
