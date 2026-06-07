import type { CourseResponse } from "@/api/generated/course";
import { landingCourses, type LandingCourse } from "@/data/landing";
import { API_BASE_URL } from "@/lib/api-base";
import { Code2 } from "lucide-react";

const SOFTWARE_DEV_CATEGORY_ID = "2fc96189-324b-4664-98b1-6c05decd3213";

type CourseListResponse = {
  data?: CourseResponse[];
};

function compactPrice(course: CourseResponse) {
  const value = course.discountedPrice ?? course.price;
  if (typeof value !== "number") return "Free";

  return value === 0
    ? "Free"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(value);
}

function formatStudents(value?: number) {
  if (!value) return "0";
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K`;
  return String(value);
}

function firstImage(course: CourseResponse, index: number) {
  return course.images?.[0]?.imageUrl || landingCourses[index % landingCourses.length]?.image || "/landing/figma/course-1.png";
}

export function mapCourseToLandingCourse(course: CourseResponse, index: number): LandingCourse {
  return {
    id: course.id,
    title: course.title || "Untitled course",
    category: course.category?.name || "Software Dev",
    price: compactPrice(course),
    image: firstImage(course, index),
    students: formatStudents(course.enrollmentCount),
    rating: typeof course.rating === "number" ? course.rating.toFixed(1) : "5.0",
    href: course.id ? `/courses/${course.id}` : "/courses",
    icon: Code2,
  };
}

export async function getLandingCourses(): Promise<LandingCourse[]> {
  const url = new URL("/api/v1/courses", API_BASE_URL);
  url.searchParams.set("page", "1");
  url.searchParams.set("size", "8");
  url.searchParams.set("categoryId", SOFTWARE_DEV_CATEGORY_ID);

  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) return landingCourses;

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) return landingCourses;

    const payload = (await response.json()) as CourseListResponse;
    const courses = payload.data?.map(mapCourseToLandingCourse).filter((course) => course.title) || [];

    return courses.length > 0 ? courses : landingCourses;
  } catch {
    return landingCourses;
  }
}
