"use client";

import { BookOpenCheck, CalendarDays, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getCourseProgressByCourseIdsAction } from "@/services/actions/learning";
import type {
  UserDto,
  UserStreakResponse,
  CourseResponse,
  CourseProgressResponse,
  DailyGoalResponse,
  UserNotificationResponse,
} from "@/types";
import {
  ContinueCourseCard,
  EmptyHomeState,
  HomeSectionHeader,
  MiniGoalList,
  RecommendationCard,
  HomeStats,
} from "./HomePrimitives";
import { GoalCalendar } from "./HomeVariantTools";

type StudentHomePageProps = {
  user?: UserDto;
  streak?: UserStreakResponse;
  enrolledCourses: CourseResponse[];
  recommendations: CourseResponse[];
  goals: DailyGoalResponse[];
  monthGoals: DailyGoalResponse[];
  notifications: UserNotificationResponse[];
  unreadNotificationsCount: number;
  header: React.ReactNode;
  footer: React.ReactNode;
};

export function StudentHomePage({
  user,
  streak,
  enrolledCourses,
  recommendations,
  goals,
  monthGoals,
  notifications,
  unreadNotificationsCount,
  header,
  footer,
}: StudentHomePageProps) {
  const welcomeName = user?.name ? user.name.split(" ")[0] : "Learner";

  const courseIds = enrolledCourses.map((c) => c.id).filter(Boolean) as string[];

  // Fetch course progress client-side using React Query
  const { data: progressRes, isLoading } = useQuery({
    queryKey: ["courseProgress", courseIds.join(",")],
    queryFn: () => getCourseProgressByCourseIdsAction(courseIds.join(",")),
    enabled: courseIds.length > 0,
  });

  const courseProgresses = progressRes?.data || [];

  return (
    <main className="min-h-screen bg-white">
      {header}
      <section className="mx-auto flex max-w-[1320px] flex-col gap-8 px-5 py-8 sm:px-8">
        <div>
          <p className="text-sm font-semibold uppercase text-[#7872FD]">Student home</p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight text-[#1D2026] sm:text-4xl">
            Welcome back, {welcomeName}.
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[#6E7485]">
            Continue learning, keep your goals visible, and discover the next course that fits your IT path.
          </p>
        </div>

        <HomeStats
          stats={{
            activeCourses: enrolledCourses.length - courseProgresses.filter((p) => p.isCompleted).length,
            completedCourses: courseProgresses.filter((p) => p.isCompleted).length,
            currentStreak: streak?.currentStreak || 0,
            unreadNotifications: unreadNotificationsCount,
          }}
          isLoading={isLoading}
        />

        <RoadmapStudio
          goals={goals}
          monthGoals={monthGoals}
          enrolledCourses={enrolledCourses}
          courseProgresses={courseProgresses}
          recommendations={recommendations}
          isLoading={isLoading}
        />
      </section>
      {footer}
    </main>
  );
}

function RoadmapStudio({
  goals,
  monthGoals,
  enrolledCourses,
  courseProgresses,
  recommendations,
  isLoading = false,
}: {
  goals: DailyGoalResponse[];
  monthGoals: DailyGoalResponse[];
  enrolledCourses: CourseResponse[];
  courseProgresses: CourseProgressResponse[];
  recommendations: CourseResponse[];
  isLoading?: boolean;
}) {
  const steps = [
    { title: "Choose your focus", copy: "Pick a course from your active queue or start a new IT track.", icon: BookOpenCheck },
    { title: "Set today's target", copy: "Use daily goals to define the next measurable learning block.", icon: CalendarDays },
    { title: "Keep the streak alive", copy: "Review progress and return tomorrow with less friction.", icon: Sparkles },
  ];

  return (
    <div className="grid gap-8">
      <section className="grid gap-6 border border-[#E9EAF0] bg-white p-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-sm font-semibold uppercase text-[#7872FD]">Roadmap Studio</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight text-[#1D2026]">Turn today&apos;s study time into a visible plan.</h2>
          <p className="mt-4 text-base leading-7 text-[#6E7485]">
            This layout emphasizes goals, checkpoints, and your next learning sequence.
          </p>
          <div className="mt-6">
            <MiniGoalList goals={goals} />
          </div>
        </div>
        <div className="grid gap-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="flex gap-4 border border-[#E9EAF0] bg-[#F8F8FF] p-5">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#7872FD] text-sm font-semibold text-white">{index + 1}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <Icon className="size-5 text-[#7872FD]" />
                    <h3 className="font-semibold text-[#1D2026]">{step.title}</h3>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-[#6E7485]">{step.copy}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <section>
          <HomeSectionHeader title="Next courses in your path" action="/user-profile/courses" />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {enrolledCourses.length ? (
              enrolledCourses.slice(0, 4).map((course, index) => {
                const progress = courseProgresses.find((p) => p.courseId === course.id);
                return (
                  <ContinueCourseCard
                    key={course.id || index}
                    course={course}
                    progress={progress}
                    index={index}
                    compact
                    isLoading={isLoading}
                  />
                );
              })
            ) : (
              <EmptyHomeState
                title="No path yet"
                copy="Enroll in your first course and Lumina will build this path from your activity."
                href="/courses"
                action="Start learning"
              />
            )}
          </div>
        </section>
        <GoalCalendar goals={monthGoals} />
      </div>

      <section>
        <HomeSectionHeader title="Recommended next" action="/courses" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {recommendations.slice(0, 4).map((course, index) => (
            <RecommendationCard key={course.id || index} course={course} index={index} />
          ))}
        </div>
      </section>
    </div>
  );
}
