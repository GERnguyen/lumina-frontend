"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getCourseProgressByCourseIdsAction } from "@/services/actions/learning";
import type { UserDto, CourseResponse } from "@/types";
import { getProfileTabs, mockUserProfileDashboard } from "@/data/user-profile";
import { getProfileAvatar } from "@/lib/format";
import { UserProfileHero } from "./UserProfileHero";
import { UserProfileLearningCard } from "./UserProfileLearningCard";

type UserProfileDashboardPageProps = {
  user: UserDto | undefined;
  enrolledCourses: CourseResponse[];
  totalEnrolled: number;
  header: React.ReactNode;
  footer: React.ReactNode;
};

export function UserProfileDashboardPage({
  user,
  enrolledCourses,
  header,
  footer,
}: UserProfileDashboardPageProps) {
  const courseIds = enrolledCourses.map((c) => c.id).filter(Boolean) as string[];

  // Fetch learning progress client-side using React Query
  const { data: progressRes } = useQuery({
    queryKey: ["courseProgress", courseIds.join(",")],
    queryFn: () => getCourseProgressByCourseIdsAction(courseIds.join(",")),
    enabled: courseIds.length > 0,
  });

  const progressList = progressRes?.data || [];

  const dashboardHero = {
    user: {
      name: user?.name || "Lumina Learner",
      headline: user?.role === "INSTRUCTOR" ? "Instructor on Lumina" : user?.bio || "Lifelong learner on Lumina",
      avatar: getProfileAvatar(user),
    },
    tabs: getProfileTabs("Dashboard"),
  };

  const learningCourses = enrolledCourses.map((course, index) => {
    const progressItem = progressList.find((item) => item.courseId === course.id);
    const progress = progressItem?.totalItems
      ? Math.round(((progressItem.completedItems || 0) / progressItem.totalItems) * 100)
      : undefined;

    return {
      id: course.id || `course-${index}`,
      title: course.title || "Untitled course",
      lesson: "Continue your learning",
      image: course.images?.[0]?.imageUrl || `/courses/course-0${(index % 8) + 1}.png`,
      progress,
      href: `/learning/${course.id}`,
      featured: index === 3,
    };
  });

  const resolvedLearningCourses = learningCourses.length
    ? learningCourses
    : mockUserProfileDashboard.learningCourses;

  return (
    <main className="min-h-screen bg-white">
      {header}
      <UserProfileHero dashboard={dashboardHero} />

      <section className="px-6 py-10 lg:px-8">
        <div className="mx-auto max-w-[1320px]">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold tracking-normal text-[#1D2026]">Dashboard</h2>
          </div>

          <div className="mt-6 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-normal text-[#1D2026]">
              Let’s start learning, {dashboardHero.user.name.split(" ")[0]}
            </h2>
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
            {resolvedLearningCourses.map((course) => (
              <UserProfileLearningCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      {footer}
    </main>
  );
}
