import type { Metadata } from "next";
import { CourseDetailPage } from "@/components/course-detail/CourseDetailPage";
import { CourseApi } from "@/services/api/course-api";
import { ReviewApi, SocialStatisticsApi, WishlistApi } from "@/services/api/social-api";
import { EnrollmentApi } from "@/services/api/enrollment-api";
import { CartApi } from "@/services/api/cart-api";
import { getServerAccessToken } from "@/lib/server-auth";

type CourseDetailRouteProps = {
  params: Promise<{ courseId: string }>;
};

export async function generateMetadata({ params }: CourseDetailRouteProps): Promise<Metadata> {
  const { courseId } = await params;
  const courseRes = await CourseApi.getReadableCourseById(courseId).catch(() => ({ data: undefined }));
  const course = courseRes.data;

  return {
    title: course?.title || "Course Details",
    description: course?.description || "Course details page on Cinx",
    alternates: {
      canonical: `/courses/${courseId}`,
    },
    openGraph: {
      title: course?.title || "Course Details",
      description: course?.description || "Course details page on Cinx",
      images: course?.images?.[0]?.imageUrl ? [course.images[0].imageUrl] : ["/courses/course-01.png"],
    },
  };
}

export default async function Page({ params }: CourseDetailRouteProps) {
  const { courseId } = await params;
  const token = await getServerAccessToken();
  const isAuthenticated = Boolean(token);

  const [courseRes, curriculumRes, reviewsRes, reviewStatsRes, enrollmentRes, cartRes, wishlistRes] = await Promise.all([
    CourseApi.getReadableCourseById(courseId).catch(() => ({ data: undefined })),
    CourseApi.getReadableCurriculum(courseId).catch(() => ({ data: undefined })),
    ReviewApi.getReviewsByCourseId({ courseId, page: 1, size: 6, sort: '{"createdAt":"DESC"}' }).catch(() => ({ data: [] })),
    SocialStatisticsApi.getReviewStatistics(courseId).catch(() => ({ data: undefined })),
    isAuthenticated
      ? EnrollmentApi.checkEnrollmentStatus([courseId]).catch(() => ({ data: [] }))
      : Promise.resolve({ data: [] }),
    isAuthenticated ? CartApi.getCart().catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
    isAuthenticated ? WishlistApi.getWishlist().catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
  ]);

  const course = courseRes.data;
  const curriculum = curriculumRes.data;
  const reviews = reviewsRes.data || [];
  const reviewStats = reviewStatsRes.data;

  const isEnrolled = Boolean(enrollmentRes.data?.find((item) => item.courseId === courseId)?.isEnrolled);
  const cartItem = (cartRes.data || []).find((item) => item.course?.id === courseId);
  const isInCart = Boolean(cartItem);
  const isWishlisted = Boolean((wishlistRes.data || []).some((item) => item.courseId === courseId));
  const cartItemId = cartItem?.id;

  if (!course) {
    return (
      <main className="min-h-screen grid place-items-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-[#1D2026]">Course not found</h2>
          <p className="mt-2 text-sm text-[#6E7485]">The course you are looking for does not exist or has been removed.</p>
        </div>
      </main>
    );
  }

  return (
    <CourseDetailPage
      course={course}
      curriculum={curriculum}
      reviews={reviews}
      reviewStats={reviewStats}
      isEnrolled={isEnrolled}
      isInCart={isInCart}
      isWishlisted={isWishlisted}
      cartItemId={cartItemId}
      isAuthenticated={isAuthenticated}
    />
  );
}
