"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpenCheck, CalendarDays, CheckCircle, PlayCircle, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getCourseProgressByCourseIdsAction } from "@/services/actions/learning";
import { LearningPathApi, LearningProgressApi } from "@/services/api/learning-api";
import { CourseApi } from "@/services/api/course-api";
import type {
  UserDto,
  UserStreakResponse,
  CourseResponse,
  CourseProgressResponse,
  DailyGoalResponse,
  UserNotificationResponse,
  EnrolledCourseResponse,
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
import { getCourseProgressPercentage } from "@/lib/format";

type StudentHomePageProps = {
  user?: UserDto;
  streak?: UserStreakResponse;
  enrolledCourses: EnrolledCourseResponse[];
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

  const [localUnreadCount, setLocalUnreadCount] = useState(unreadNotificationsCount);
  const [activePath, setActivePath] = useState<any>(null);
  const [loadingPath, setLoadingPath] = useState(true);

  useEffect(() => {
    async function loadActivePath() {
      try {
        setLoadingPath(true);
        const activeRes = await LearningPathApi.getActiveLearningPath().catch(() => ({ data: null }));
        if (activeRes.data && activeRes.data.id) {
          const resolved = await resolveActivePathDetails(activeRes.data);
          setActivePath(resolved);
        } else {
          setActivePath(null);
        }
      } catch (err) {
        console.error("Failed to load active learning path:", err);
      } finally {
        setLoadingPath(false);
      }
    }
    loadActivePath();
  }, []);

  async function resolveActivePathDetails(path: any) {
    if (!path.items || path.items.length === 0) {
      return { ...path, itemsWithDetails: [] };
    }

    const uniqueCourseIds = Array.from(new Set(path.items.map((i: any) => i.courseId).filter(Boolean))) as string[];

    try {
      const courseDetails = await Promise.all(
        uniqueCourseIds.map(async (courseId) => {
          try {
            const [courseRes, curriculumRes, progressRes] = await Promise.all([
              CourseApi.getReadableCourseById(courseId),
              CourseApi.getReadableCurriculum(courseId),
              LearningProgressApi.getLearningItemProgressByCourseId(courseId).catch(() => ({ data: [] }))
            ]);
            return {
              courseId,
              course: courseRes.data,
              curriculum: curriculumRes.data,
              progress: progressRes.data || []
            };
          } catch (err) {
            console.error(`Failed to fetch details for course ${courseId}:`, err);
            return { courseId, course: null, curriculum: null, progress: [] };
          }
        })
      );

      const itemsWithDetails = path.items.map((item: any) => {
        const detail = courseDetails.find((d) => d.courseId === item.courseId);
        let lessonTitle = `Bài học ID: ${item.lessonId?.substring(0, 8)}...`;
        if (detail?.curriculum?.sections) {
          for (const section of detail.curriculum.sections) {
            const lesson = section.lessons?.find((l: any) => l.id === item.lessonId);
            if (lesson) {
              lessonTitle = lesson.title || lessonTitle;
              break;
            }
          }
        }

        const isCompleted = detail?.progress?.find((p: any) => p.itemId === item.lessonId)?.isCompleted || item.isCompleted || false;

        return {
          ...item,
          isCompleted,
          courseTitle: detail?.course?.title || "Khóa học không tên",
          lessonTitle,
        };
      });

      const completedItems = itemsWithDetails.filter((i: any) => i.isCompleted).length;
      const totalItems = itemsWithDetails.length;
      const currentProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

      return {
        ...path,
        completedItems,
        totalItems,
        currentProgress,
        itemsWithDetails,
      };
    } catch (err) {
      console.error("Error resolving active path details:", err);
      return {
        ...path,
        itemsWithDetails: path.items.map((item: any) => ({
          ...item,
          courseTitle: `Khóa học ID: ${item.courseId?.substring(0, 8)}...`,
          lessonTitle: `Bài học ID: ${item.lessonId?.substring(0, 8)}...`,
        })),
      };
    }
  }

  useEffect(() => {
    setLocalUnreadCount(unreadNotificationsCount);
  }, [unreadNotificationsCount]);

  useEffect(() => {
    const handleSync = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { action, isRead, count } = customEvent.detail || {};

      if (action === "mark-all-read") {
        setLocalUnreadCount(0);
      } else if (action === "mark-all-unread") {
        if (count !== undefined) setLocalUnreadCount(count);
      } else if (action === "toggle-read") {
        setLocalUnreadCount((prev) => (isRead ? Math.max(0, prev - 1) : prev + 1));
      } else if (action === "new-notification") {
        setLocalUnreadCount((prev) => prev + 1);
      }
    };

    window.addEventListener("cinx:notifications-changed", handleSync);
    return () => {
      window.removeEventListener("cinx:notifications-changed", handleSync);
    };
  }, []);

  const courseIds = enrolledCourses.map((c) => c.course?.id).filter(Boolean) as string[];

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
          <h1 className="mt-2 flex flex-wrap items-center gap-3 text-3xl font-semibold leading-tight text-[#1D2026] sm:text-4xl">
            Welcome back, {welcomeName}.
            {user?.xp !== undefined && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EBEBFF] px-3.5 py-1 text-sm font-bold text-[#7872FD] shadow-sm">
                <Sparkles className="size-4 animate-pulse" />
                {user.xp} XP
              </span>
            )}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[#6E7485]">
            Continue learning, keep your goals visible, and discover the next course that fits your IT path.
          </p>
        </div>

        <HomeStats
          stats={{
            activeCourses: enrolledCourses.length - courseProgresses.filter((p) => p.isCompleted && p.isPassed).length,
            completedCourses: courseProgresses.filter((p) => p.isCompleted && p.isPassed).length,
            currentStreak: streak?.currentStreak || 0,
            unreadNotifications: localUnreadCount,
            xp: user?.xp || 0,
          }}
          isLoading={isLoading}
        />

        <RoadmapStudio
          goals={goals}
          monthGoals={monthGoals}
          enrolledCourses={enrolledCourses}
          courseProgresses={courseProgresses}
          recommendations={recommendations}
          isLoading={isLoading || loadingPath}
          activePath={activePath}
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
  activePath,
}: {
  goals: DailyGoalResponse[];
  monthGoals: DailyGoalResponse[];
  enrolledCourses: EnrolledCourseResponse[];
  courseProgresses: CourseProgressResponse[];
  recommendations: CourseResponse[];
  isLoading?: boolean;
  activePath?: any;
}) {
  const steps = [
    { title: "Choose your focus", copy: "Pick a course from your active queue or start a new IT track.", icon: BookOpenCheck },
    { title: "Set today's target", copy: "Use daily goals to define the next measurable learning block.", icon: CalendarDays },
    { title: "Keep the streak alive", copy: "Review progress and return tomorrow with less friction.", icon: Sparkles },
  ];
  const inProgressCourses = enrolledCourses.filter((item) => {
    const course = item.course;
    if (!course?.id) return false;
    const progress = courseProgresses.find((p) => p.courseId === course.id);
    const percentage = getCourseProgressPercentage(progress);
    return progress && (!progress.isCompleted || !progress.isPassed) && percentage >= 0;
  });
  const activeCourses = inProgressCourses.length
    ? inProgressCourses
    : enrolledCourses.filter((item) => {
      const progress = courseProgresses.find((p) => p.courseId === item.course?.id);
      return !progress || !progress.isCompleted || !progress.isPassed;
    });

  return (
    <div className="grid gap-8">
      <section className="grid gap-6 rounded-[18px] border border-[#E9EAF0] bg-white p-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-sm font-semibold uppercase text-[#7872FD]">Roadmap Studio</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight text-[#1D2026]">Turn today&apos;s study time into a visible plan.</h2>
          <p className="mt-4 text-base leading-7 text-[#6E7485]">
            This layout emphasizes goals, checkpoints, and your next learning sequence.
          </p>
          <div className="mt-5">
            <Link
              href="/ai-assistant"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] bg-[#7872FD] px-5 text-sm font-semibold text-white transition hover:bg-[#5F58F0]"
            >
              <Sparkles className="size-4" /> Ask AI Assistant
            </Link>
          </div>
        </div>
        <div className="grid gap-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="flex gap-4 rounded-[18px] border border-[#E9EAF0] bg-[#F8F8FF] p-5">
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
          <HomeSectionHeader title="In progress courses" action="/user-profile?tab=courses" />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {activeCourses.length ? (
              activeCourses.slice(0, 4).map((item, index) => {
                const progress = courseProgresses.find((p) => p.courseId === item.course?.id);
                return (
                  <ContinueCourseCard
                    key={item.course?.id || index}
                    course={item.course!}
                    progress={progress}
                    index={index}
                    isLoading={isLoading}
                    enrolledAt={item.enrolledAt}
                  />
                );
              })
            ) : (
              <EmptyHomeState
                title="No courses in progress"
                copy="Start a course and your active learning queue will appear here."
                href="/courses"
                action="Explore courses"
              />
            )}
          </div>
        </section>
        <GoalCalendar goals={monthGoals} />
      </div>

      {activePath && (
        <section>
          <HomeSectionHeader
            title={`Lộ trình học: ${activePath.title}`}
            action="/learning-paths"
          />
          <div className="mt-4 rounded-[18px] border border-[#E9EAF0] bg-white p-6">
            <div className="flex items-center justify-between text-sm mb-4">
              <span className="font-semibold text-[#1D2026]">Tiến trình của lộ trình</span>
              <span className="font-bold text-[#23BD33]">{activePath.completedItems} / {activePath.totalItems} bài học ({activePath.currentProgress}%)</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#F5F7FA] mb-6">
              <div
                className="h-full rounded-full bg-[#23BD33] transition-all duration-300"
                style={{ width: `${activePath.currentProgress}%` }}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {activePath.itemsWithDetails?.slice(0, 3).map((item: any, index: number) => (
                <div key={item.id || index} className="rounded-xl border border-[#E9EAF0] bg-[#F8F9FB] p-4 flex flex-col justify-between hover:border-[#D8D6FF] transition">
                  <div>
                    <span className="text-[10px] font-bold text-[#8C94A3] uppercase">Bước {index + 1}: {item.courseTitle}</span>
                    <h4 className="mt-1 text-sm font-semibold text-[#1D2026] line-clamp-1">{item.lessonTitle}</h4>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${item.isCompleted ? "text-[#1E7E34]" : "text-[#7872FD]"}`}>
                      {item.isCompleted ? (
                        <>
                          <CheckCircle className="size-4" />
                          <span>Đã xong</span>
                        </>
                      ) : (
                        <>
                          <PlayCircle className="size-4" />
                          <span>Chưa học</span>
                        </>
                      )}
                    </span>
                    <Link
                      href={`/learning/${item.courseId}?lessonId=${item.lessonId}`}
                      className={`inline-flex h-8 items-center justify-center rounded-lg px-3 text-xs font-semibold transition ${item.isCompleted
                        ? "bg-[#E6FBD9] text-[#1E7E34] hover:bg-[#d4f7c5]"
                        : "bg-[#564FFD] text-white hover:bg-[#433EE8]"
                        }`}
                    >
                      Học ngay
                    </Link>
                  </div>
                </div>
              ))}
              {activePath.totalItems > 3 && (
                <div className="rounded-xl border border-dashed border-[#D8D6FF] bg-white p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-sm font-semibold text-[#1D2026]">{activePath.totalItems - 3} bài học khác</span>
                  <Link href="/learning-paths" className="mt-2 text-xs font-bold text-[#564FFD] hover:underline">
                    Xem toàn bộ lộ trình &rarr;
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

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
