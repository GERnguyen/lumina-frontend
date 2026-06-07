import type { CourseCurriculumResponse, CourseResponse } from "@/api/generated/course";
import { courseDetail, type CourseDetail } from "@/data/course-detail";
import { API_BASE_URL } from "@/lib/api-base";

type CourseDetailPayload = {
  data?: CourseResponse;
};

type CourseCurriculumPayload = {
  data?: CourseCurriculumResponse;
};

type CourseDetailResult = {
  course: CourseDetail;
  isFallback: boolean;
};

function apiUrl(path: string) {
  return new URL(path, API_BASE_URL);
}

async function fetchJson<T>(url: URL): Promise<T | undefined> {
  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) return undefined;
    if (!(response.headers.get("content-type") || "").includes("application/json")) return undefined;

    return (await response.json()) as T;
  } catch {
    return undefined;
  }
}

function money(value?: number) {
  if (typeof value !== "number") return "Free";
  if (value === 0) return "Free";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function compactNumber(value?: number) {
  if (!value) return "0";
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function fullNumber(value?: number) {
  if (!value) return "0";
  return new Intl.NumberFormat("en-US").format(value);
}

function formatDuration(minutes?: number) {
  if (!minutes) return "Self-paced";
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining ? `${hours}h ${remaining}m` : `${hours}h`;
}

function formatCourseLength(minutes?: number) {
  if (!minutes) return "Self-paced";
  if (minutes < 60) return `${minutes} minutes`;

  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining ? `${hours}h ${remaining}m` : `${hours} hours`;
}

function splitDescription(description?: string) {
  const text = description?.trim();
  if (!text) {
    return [
      "Build practical skills through guided lessons, structured practice, and focused projects designed for real learning progress.",
      "Lumina courses are organized so you can move from concept to application without losing momentum.",
    ];
  }

  return text
    .split(/\n{2,}|(?<=\.)\s+(?=[A-Z])/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .slice(0, 4);
}

function fallbackDetail(courseId: string): CourseDetailResult {
  return {
    course: {
      ...courseDetail,
      id: courseId,
    },
    isFallback: true,
  };
}

function mapCurriculum(curriculum?: CourseCurriculumResponse, totalDuration?: number): Pick<CourseDetail, "curriculum" | "curriculumSummary"> {
  const sections = [...(curriculum?.sections || [])].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  const mappedSections = sections.map((section, index) => {
    const lessons = [...(section.lessons || [])].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
    const duration = section.duration || lessons.reduce((total, lesson) => total + (lesson.duration || 0), 0);

    return {
      title: section.title || `Section ${index + 1}`,
      lectures: `${lessons.length} ${lessons.length === 1 ? "lecture" : "lectures"}`,
      duration: formatDuration(duration),
      expanded: index === 0,
      items: lessons.map((lesson) => ({
        title: lesson.title || "Untitled lesson",
        duration: formatDuration(lesson.duration),
        preview: lesson.isPreview,
      })),
    };
  });

  if (!mappedSections.length) {
    return {
      curriculum: courseDetail.curriculum,
      curriculumSummary: courseDetail.curriculumSummary,
    };
  }

  const lectureCount = mappedSections.reduce((total, section) => total + section.items.length, 0);

  return {
    curriculum: mappedSections,
    curriculumSummary: [
      { label: "Sections", value: String(mappedSections.length) },
      { label: "Lectures", value: String(lectureCount) },
      { label: "Duration", value: formatDuration(totalDuration) },
    ],
  };
}

function mapCourseDetail(course: CourseResponse, curriculum?: CourseCurriculumResponse): CourseDetail {
  const discounted = course.discountedPrice ?? course.price;
  const hasDiscount = typeof course.discountedPrice === "number" && typeof course.price === "number" && course.discountedPrice < course.price;
  const discount = hasDiscount && course.discountRate ? `${Math.round(course.discountRate)}% OFF` : hasDiscount ? "On sale" : "Best value";
  const category = course.category?.name || "Software Dev";
  const instructorName = course.instructor?.name || "Lumina Instructor";
  const instructorAvatar = course.instructor?.avatarUrl || courseDetail.authorAvatar;
  const image = course.images?.[0]?.imageUrl || courseDetail.heroImage;
  const rating = typeof course.rating === "number" ? course.rating.toFixed(1) : courseDetail.rating;
  const enrollmentCount = course.enrollmentCount || 0;
  const curriculumData = mapCurriculum(curriculum, course.duration);

  return {
    ...courseDetail,
    ...curriculumData,
    id: course.id || courseDetail.id,
    title: course.title || courseDetail.title,
    subtitle: course.description || courseDetail.subtitle,
    overview: splitDescription(course.description),
    categoryTrail: ["Courses", category],
    authors: [instructorName],
    authorAvatar: instructorAvatar,
    rating,
    ratingCount: fullNumber(enrollmentCount),
    heroImage: image,
    price: money(discounted),
    originalPrice: hasDiscount ? money(course.price) : "",
    discount,
    urgency: course.isInSubscription ? "Included in Lumina subscription" : "Enroll anytime and learn at your pace",
    facts: [
      { label: "Course Duration", value: formatCourseLength(course.duration) },
      { label: "Course Level", value: "All levels" },
      { label: "Students Enrolled", value: fullNumber(enrollmentCount) },
      { label: "Language", value: "English" },
      { label: "Subtitle Language", value: "English" },
    ],
    includes: [
      "Lifetime access",
      "Structured lessons and practice tasks",
      course.hasCertificate ? course.certificateTitle || "Shareable certificate of completion" : "Progress tracking",
      "Access on desktop, tablet and mobile",
      "100% online course",
    ],
    learnings: [
      `Understand the core concepts behind ${course.title || "this course"} and apply them in practical exercises.`,
      "Work through a structured curriculum with clear lesson progression.",
      "Practice with examples that mirror real product and engineering workflows.",
      course.hasCertificate ? "Earn a certificate after completing the course requirements." : "Build confidence through self-paced learning.",
    ],
    audience: [
      `Learners who want to grow in ${category}.`,
      "Students preparing for project work, internships, or portfolio-ready practice.",
      "Developers and creators who prefer structured, focused lessons.",
    ],
    requirements: [
      "A laptop or desktop with a stable internet connection.",
      "Basic familiarity with the course topic is helpful but not required.",
      "Curiosity and a willingness to practice after each lesson.",
    ],
    instructors: [
      {
        name: instructorName,
        role: `${category} Instructor`,
        avatar: instructorAvatar,
        rating,
        students: compactNumber(enrollmentCount),
        courses: "01",
        bio: `${instructorName} teaches practical ${category.toLowerCase()} skills on Lumina with a focus on clear explanations and project-ready learning.`,
      },
    ],
  };
}

export async function getCourseDetail(courseId: string): Promise<CourseDetailResult> {
  const [coursePayload, curriculumPayload] = await Promise.all([
    fetchJson<CourseDetailPayload>(apiUrl(`/api/v1/courses/${courseId}`)),
    fetchJson<CourseCurriculumPayload>(apiUrl(`/api/v1/courses/${courseId}/curriculum`)),
  ]);

  if (!coursePayload?.data) return fallbackDetail(courseId);

  return {
    course: mapCourseDetail(coursePayload.data, curriculumPayload?.data),
    isFallback: false,
  };
}
