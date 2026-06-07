import type { Metadata } from "next";
import { CourseDetailPage } from "@/components/course-detail/CourseDetailPage";
import type { CourseResponse, CourseCurriculumResponse } from "@/types";
import { CourseService } from "@/services/courseService";
import type { CourseDetail } from "@/data/course-detail";
import { money, compactNumber, fullNumber, formatDuration, formatCourseLength, splitDescription } from "@/lib/format";

type CourseDetailRouteProps = {
  params: Promise<{ courseId: string }>;
};

type CourseDetailResult = {
  course: CourseDetail;
};

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
  const instructorAvatar = course.instructor?.avatarUrl || "/watch-course/avatar.png";
  const image = course.images?.[0]?.imageUrl || "/courses/course-01.png";
  const rating = typeof course.rating === "number" ? course.rating.toFixed(1) : "5.0";
  const enrollmentCount = course.enrollmentCount || 0;
  const curriculumData = mapCurriculum(curriculum, course.duration);

  const descParagraphs = splitDescription(course.description);
  const overview = descParagraphs.length > 0 ? descParagraphs.slice(0, 4) : [
    "Build practical skills through guided lessons, structured practice, and focused projects designed for real learning progress.",
    "Lumina courses are organized so you can move from concept to application without losing momentum.",
  ];

  return {
    id: course.id || "",
    title: course.title || "Untitled Course",
    subtitle: course.description || "",
    overview,
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
    reviews: [],
    ratingBreakdown: [],
    ...curriculumData,
  };
}

async function getCourseDetail(courseId: string): Promise<CourseDetailResult> {
  const [coursePayload, curriculumPayload] = await Promise.all([
    CourseService.getCourseById({ id: courseId }),
    CourseService.getPublishedCurriculum({ id: courseId }),
  ]);

  if (!coursePayload?.data) {
    throw new Error("Course not found");
  }

  return {
    course: mapCourseDetail(coursePayload.data, curriculumPayload?.data),
  };
}

export async function generateMetadata({ params }: CourseDetailRouteProps): Promise<Metadata> {
  const { courseId } = await params;
  try {
    const { course } = await getCourseDetail(courseId);
    return {
      title: course.title,
      description: course.subtitle,
      alternates: {
        canonical: `/courses/${courseId}`,
      },
      openGraph: {
        title: course.title,
        description: course.subtitle,
        images: [course.heroImage],
      },
    };
  } catch {
    return {
      title: "Course Details",
      description: "View course details on Lumina.",
    };
  }
}

export default async function Page({ params }: CourseDetailRouteProps) {
  const { courseId } = await params;
  const { course } = await getCourseDetail(courseId);

  return <CourseDetailPage course={course} />;
}
