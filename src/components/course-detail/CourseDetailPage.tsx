import { CoursesFooter } from "@/components/courses/CoursesFooter";
import { CoursesTopNav } from "@/components/courses/CoursesTopNav";
import { CourseCurriculum } from "./CourseCurriculum";
import { CourseDetailHeader } from "./CourseDetailHeader";
import { CourseDetailTabs } from "./CourseDetailTabs";
import { CourseHeroMedia } from "./CourseHeroMedia";
import { CourseInstructorSection } from "./CourseInstructorSection";
import { CourseOverview } from "./CourseOverview";
import { CoursePurchaseCard } from "./CoursePurchaseCard";
import { CourseSocialPanel } from "./CourseSocialPanel";
import type {
  CourseResponse,
  CourseCurriculumResponse,
  ReviewResponse,
  ReviewStatisticsResponse,
} from "@/types";

type CourseDetailPageProps = {
  course: CourseResponse;
  curriculum?: CourseCurriculumResponse;
  reviews: ReviewResponse[];
  reviewStats?: ReviewStatisticsResponse;
  isEnrolled: boolean;
  isInCart: boolean;
  isWishlisted: boolean;
  cartItemId?: string;
  isAuthenticated: boolean;
};

export function CourseDetailPage({
  course,
  curriculum,
  reviews,
  reviewStats,
  isEnrolled,
  isInCart,
  isWishlisted,
  cartItemId,
  isAuthenticated,
}: CourseDetailPageProps) {
  return (
    <main className="min-h-screen bg-white">
      <CoursesTopNav />
      <CourseDetailHeader course={course} reviewsCount={reviewStats?.reviewCount || 0} />

      <section className="px-6 pb-16 lg:px-8">
        <div className="mx-auto grid max-w-[1320px] gap-10 lg:grid-cols-[minmax(0,872px)_424px] lg:items-start">
          <div className="space-y-10">
            <CourseHeroMedia course={course} />
            <CourseDetailTabs />
            <CourseOverview course={course} />
            <CourseCurriculum
              curriculum={curriculum}
              duration={course.duration}
              isEnrolled={isEnrolled}
              courseId={course.id || ""}
              isAuthenticated={isAuthenticated}
            />
            <CourseInstructorSection course={course} />
            <CourseSocialPanel
              courseId={course.id || ""}
              initialReviews={reviews}
              initialReviewStats={reviewStats}
              isAuthenticated={isAuthenticated}
              isEnrolled={isEnrolled}
            />
          </div>

          <CoursePurchaseCard
            course={course}
            isEnrolled={isEnrolled}
            isInCart={isInCart}
            isWishlisted={isWishlisted}
            cartItemId={cartItemId}
            isAuthenticated={isAuthenticated}
          />
        </div>
      </section>

      <CoursesFooter />
    </main>
  );
}
