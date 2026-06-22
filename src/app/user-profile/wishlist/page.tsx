import type { Metadata } from "next";
import { UserProfileWishlistPage } from "@/components/user-profile/UserProfileWishlistPage";
import { UserApi } from "@/services/api/user-api";
import { WishlistApi } from "@/services/api/social-api";
import { CourseApi } from "@/services/api/course-api";
import { EnrollmentApi } from "@/services/api/enrollment-api";
import { getProfileTabs, mockUserProfileDashboard, mockProfileWishlist } from "@/data/user-profile";
import { getProfileAvatar, money, getCourseRating, getCourseImage, getCourseInstructorName } from "@/lib/format";

export const metadata: Metadata = {
  title: "Wishlist - Lumina",
  description: "Review saved Lumina courses in your wishlist.",
  alternates: {
    canonical: "/user-profile/wishlist",
  },
};

export default async function Page() {
  const [userRes, wishlistRes, enrolledRes] = await Promise.all([
    UserApi.getCurrentUser().catch(() => ({ data: undefined })),
    WishlistApi.getWishlist().catch(() => ({ data: [] })),
    EnrollmentApi.getEnrolledCourses({ page: 1, size: 200 }).catch(() => ({ data: [] })),
  ]);

  const user = userRes.data;
  if (!user) {
    return (
      <UserProfileWishlistPage
        wishlistPage={{
          user: mockUserProfileDashboard.user,
          tabs: getProfileTabs("Wishlist"),
          items: mockProfileWishlist,
        }}
      />
    );
  }

  const enrolledIds = new Set((enrolledRes.data || []).map((course) => course.id).filter(Boolean) as string[]);
  const wishlistItems = (wishlistRes.data || []).filter((item) => !item.courseId || !enrolledIds.has(item.courseId));
  const courseIds = wishlistItems.map((item) => item.courseId).filter(Boolean) as string[];

  let courses: any[] = [];
  if (courseIds.length) {
    const coursesRes = await CourseApi.getCoursesByIds(courseIds.join(",")).catch(() => ({ data: [] }));
    courses = coursesRes.data || [];
  }

  const hydratedItems = wishlistItems.map((item, index) => {
    const course = courses.find((c) => c.id === item.courseId);
    const mock = mockProfileWishlist[index % mockProfileWishlist.length];

    const price = course?.discountedPrice ?? course?.price;
    const originalPrice = course?.discountedPrice && course?.price && course.discountedPrice < course.price ? course.price : undefined;

    return {
      id: item.id || `${item.courseId}-${index}`,
      courseId: item.courseId || course?.id || mock.courseId,
      title: course?.title || mock.title,
      image: course ? getCourseImage(course) : mock.image,
      rating: course ? getCourseRating(course.rating) : mock.rating,
      reviews: course?.enrollmentCount ? new Intl.NumberFormat("en-US").format(course.enrollmentCount) : mock.reviews,
      instructors: course ? [getCourseInstructorName(course)] : mock.instructors,
      price: typeof price === "number" ? money(price) : mock.price,
      originalPrice: originalPrice ? money(originalPrice) : undefined,
    };
  });

  const wishlistPage = {
    user: {
      name: user.name || "Lumina Learner",
      headline: user.role === "INSTRUCTOR" ? "Instructor on Lumina" : user.bio || "Lifelong learner on Lumina",
      avatar: getProfileAvatar(user),
    },
    tabs: getProfileTabs("Wishlist"),
    items: hydratedItems,
  };

  return <UserProfileWishlistPage wishlistPage={wishlistPage} />;
}
