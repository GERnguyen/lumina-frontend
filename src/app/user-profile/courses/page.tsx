import type { Metadata } from "next";
import { UserProfileCoursesPage } from "@/components/user-profile/UserProfileCoursesPage";
import type { ProfileCourseFilter } from "@/data/user-profile";
import { UserApi } from "@/services/api/user-api";
import { EnrollmentApi } from "@/services/api/enrollment-api";
import { LearningProgressApi } from "@/services/api/learning-api";
import { getProfileTabs, mockUserProfileDashboard, mockProfileCourses } from "@/data/user-profile";
import { getProfileAvatar } from "@/lib/format";

type UserProfileCoursesRouteProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "My Courses - Lumina",
  description: "Browse and continue your enrolled Lumina courses.",
  alternates: {
    canonical: "/user-profile/courses",
  },
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseFilters(params: Record<string, string | string[] | undefined>): ProfileCourseFilter {
  const page = Number(firstParam(params.page) || "1");

  return {
    query: firstParam(params.query),
    sort: firstParam(params.sort) || "latest",
    status: firstParam(params.status) || "all",
    teacher: firstParam(params.teacher) || "all",
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

export default async function Page({ searchParams }: UserProfileCoursesRouteProps) {
  const params = await searchParams;
  const filters = parseFilters(params);

  const page = filters.page || 1;
  const pageSize = 20;

  const [userRes, enrolledRes] = await Promise.all([
    UserApi.getCurrentUser().catch(() => ({ data: undefined })),
    EnrollmentApi.getEnrolledCourses({ page, size: pageSize }).catch(() => ({ data: [], meta: { totalElements: 0, totalPages: 1 } })),
  ]);

  const user = userRes.data;
  if (!user) {
    const filteredMock = mockProfileCourses;
    return (
      <UserProfileCoursesPage
        coursesPage={{
          user: mockUserProfileDashboard.user,
          tabs: getProfileTabs("Courses"),
          totalCourses: filteredMock.length,
          filters,
          courses: filteredMock,
          currentPage: page,
          totalPages: 1,
        }}
      />
    );
  }

  const courses = enrolledRes.data || [];
  const courseIds = courses.map((course) => course.id).filter(Boolean) as string[];
  const progressRes = courseIds.length
    ? await LearningProgressApi.getCourseProgressByCourseIds(courseIds.join(",")).catch(() => ({ data: [] }))
    : { data: [] };

  const progressList = progressRes.data || [];

  const mappedCourses = courses.map((course, index) => {
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
      href: `/courses/${course.id}/watch`,
      featured: index === 3 || index === 11,
      teacher: course.instructor?.name || "Lumina Instructor",
      status: progressItem?.isCompleted ? ("completed" as const) : ("active" as const),
    };
  });

  let filtered = mappedCourses.filter((course) => {
    const query = filters.query?.trim().toLowerCase();
    if (query && !course.title.toLowerCase().includes(query)) return false;
    if (filters.status && filters.status !== "all" && course.status !== filters.status) return false;
    if (filters.teacher && filters.teacher !== "all" && course.teacher !== filters.teacher) return false;
    return true;
  });

  if (filters.sort === "progress") {
    filtered = [...filtered].sort((a, b) => (b.progress || 0) - (a.progress || 0));
  } else if (filters.sort === "title") {
    filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
  }

  const totalCourses = enrolledRes.meta?.totalElements || filtered.length;
  const totalPages = enrolledRes.meta?.totalPages || 1;

  const coursesPage = {
    user: {
      name: user.name || "Lumina Learner",
      headline: user.role === "INSTRUCTOR" ? "Instructor on Lumina" : user.bio || "Lifelong learner on Lumina",
      avatar: getProfileAvatar(user),
    },
    tabs: getProfileTabs("Courses"),
    totalCourses,
    filters,
    courses: filtered.length ? filtered : mockProfileCourses,
    currentPage: page,
    totalPages,
  };

  return <UserProfileCoursesPage coursesPage={coursesPage} />;
}
