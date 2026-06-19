import type { Metadata } from "next";
import { CoursesFooter } from "@/components/courses/CoursesFooter";
import { UserProfileTopNav } from "@/components/user-profile/UserProfileTopNav";
import { UserProfileSpaShell } from "@/components/user-profile/UserProfileSpaShell";
import { mockProfileCourses, mockProfilePurchaseHistory, mockProfileWishlist, mockUserProfileDashboard } from "@/data/user-profile";
import { EnrollmentApi, OrderApi } from "@/services/api/enrollment-api";
import { CourseApi } from "@/services/api/course-api";
import { LearningProgressApi } from "@/services/api/learning-api";
import { WishlistApi } from "@/services/api/social-api";
import { UserApi } from "@/services/api/user-api";
import {
  formatPurchaseDate,
  getCourseImage,
  getCourseInstructorName,
  getCourseRating,
  getProfileAvatar,
  money,
  moneyWithCurrency,
  maskedPaymentAccount,
  paymentMethodLabel,
} from "@/lib/format";

export const metadata: Metadata = {
  title: "Dashboard - Lumina",
  description: "View your Lumina learning dashboard, enrolled courses, progress, wishlist, purchases, and settings.",
  alternates: {
    canonical: "/user-profile",
  },
};

export default async function Page() {
  const [userRes, enrolledRes, wishlistRes, ordersRes] = await Promise.all([
    UserApi.getCurrentUser().catch(() => ({ data: undefined })),
    EnrollmentApi.getEnrolledCourses({ page: 1, size: 20 }).catch(() => ({ data: [], meta: { totalElements: 0, totalPages: 1 } })),
    WishlistApi.getWishlist().catch(() => ({ data: [] })),
    OrderApi.getOrders({ page: 1, size: 10, sort: '{"orderDate":"DESC"}' }).catch(() => ({ data: [] })),
  ]);

  const user = userRes.data;
  const fallbackUser = mockUserProfileDashboard.user;
  const profileUser = {
    name: user?.name || fallbackUser.name,
    headline: user?.role === "INSTRUCTOR" ? "Instructor on Lumina" : user?.bio || fallbackUser.headline,
    avatar: getProfileAvatar(user),
  };

  const enrolledCourses = enrolledRes.data || [];
  const enrolledIds = enrolledCourses.map((course) => course.id).filter(Boolean) as string[];
  const progressRes = enrolledIds.length
    ? await LearningProgressApi.getCourseProgressByCourseIds(enrolledIds.join(",")).catch(() => ({ data: [] }))
    : { data: [] };
  const progressList = progressRes.data || [];
  const completedCourses = progressList.filter((item) => item.isCompleted).length;

  const mappedCourses = enrolledCourses.map((course, index) => {
    const progressItem = progressList.find((item) => item.courseId === course.id);
    const progress = progressItem?.totalItems
      ? Math.round(((progressItem.completedItems || 0) / progressItem.totalItems) * 100)
      : undefined;

    return {
      id: course.id || `course-${index}`,
      title: course.title || "Untitled course",
      lesson: "Continue your learning",
      image: getCourseImage(course, index),
      progress,
      href: `/courses/${course.id}/watch`,
      featured: index === 3,
      teacher: getCourseInstructorName(course),
      status: progressItem?.isCompleted ? ("completed" as const) : ("active" as const),
    };
  });

  const wishlistItems = wishlistRes.data || [];
  const wishlistCourseIds = wishlistItems.map((item) => item.courseId).filter(Boolean) as string[];
  const orderCourseIds = new Set<string>();
  (ordersRes.data || []).forEach((order) => {
    order.items?.forEach((item) => {
      if (item.courseId) orderCourseIds.add(item.courseId);
    });
  });

  const relatedCourseIds = Array.from(new Set([...wishlistCourseIds, ...Array.from(orderCourseIds)]));
  const relatedCoursesRes = relatedCourseIds.length
    ? await CourseApi.getCoursesByIds(relatedCourseIds.join(",")).catch(() => ({ data: [] }))
    : { data: [] };
  const relatedCourses = relatedCoursesRes.data || [];

  const hydratedWishlist = wishlistItems.map((item, index) => {
    const course = relatedCourses.find((candidate) => candidate.id === item.courseId);
    const mock = mockProfileWishlist[index % mockProfileWishlist.length];
    const price = course?.discountedPrice ?? course?.price;
    const originalPrice = course?.discountedPrice && course?.price && course.discountedPrice < course.price ? course.price : undefined;

    return {
      id: item.id || `${item.courseId}-${index}`,
      courseId: item.courseId || course?.id || mock.courseId,
      title: course?.title || mock.title,
      image: course ? getCourseImage(course, index) : mock.image,
      rating: course ? getCourseRating(course.rating) : mock.rating,
      reviews: course?.enrollmentCount ? new Intl.NumberFormat("en-US").format(course.enrollmentCount) : mock.reviews,
      instructors: course ? [getCourseInstructorName(course)] : mock.instructors,
      price: typeof price === "number" ? money(price) : mock.price,
      originalPrice: originalPrice ? money(originalPrice) : undefined,
    };
  });

  const mappedPurchases = (ordersRes.data || []).map((order, index) => {
    const mappedOrderCourses = (order.items || []).map((item, itemIndex) => {
      const course = relatedCourses.find((candidate) => candidate.id === item.courseId);
      const price = item.discountedPrice ?? item.price ?? course?.discountedPrice ?? course?.price;

      return {
        id: item.id || `${order.id || "order"}-${item.courseId || itemIndex}`,
        courseId: item.courseId || course?.id || `course-${itemIndex}`,
        title: item.title || course?.title || "Untitled course",
        image: course ? getCourseImage(course, itemIndex) : `/courses/course-0${(itemIndex % 8) + 1}.png`,
        rating: course ? getCourseRating(course.rating) : "No reviews yet",
        reviews: course?.enrollmentCount ? new Intl.NumberFormat("en-US").format(course.enrollmentCount) : "",
        instructor: course ? getCourseInstructorName(course) : "Course Instructor",
        price: typeof price === "number" ? money(price) : "Free",
      };
    });

    const total = Math.max(0, (order.totalPrice || 0) - (order.discounted || 0));

    return {
      id: order.id || `order-${index}`,
      purchasedAt: formatPurchaseDate(order.orderDate),
      summaryDate: formatPurchaseDate(order.orderDate),
      courseCount: order.items?.length || 0,
      total: moneyWithCurrency(total),
      paymentMethod: paymentMethodLabel(order.paymentMethod),
      status: order.status || "PENDING",
      paymentName: profileUser.name,
      paymentAccount: maskedPaymentAccount(order.payment?.paymentInfo),
      paymentExpiry: undefined,
      courses: mappedOrderCourses,
    };
  });

  const username = user?.email?.split("@")[0] || profileUser.name.toLowerCase().replace(/\s+/g, ".");
  const settings = {
    user: {
      id: user?.userId,
      name: profileUser.name,
      fullName: profileUser.name,
      username,
      email: user?.email || "learner@lumina.local",
      headline: profileUser.headline,
      avatar: profileUser.avatar,
      bio: user?.bio || "",
    },
    tabs: [],
  };

  return (
    <main className="min-h-screen bg-white">
      <UserProfileTopNav avatar={profileUser.avatar} />
      <UserProfileSpaShell
        user={profileUser}
        totalEnrolled={enrolledRes.meta?.totalElements || mappedCourses.length}
        activeCourses={Math.max(0, mappedCourses.length - completedCourses)}
        completedCourses={completedCourses}
        learningCourses={mappedCourses.length ? mappedCourses.slice(0, 4) : mockUserProfileDashboard.learningCourses}
        courses={mappedCourses.length ? mappedCourses : mockProfileCourses}
        courseFilters={{ sort: "latest", status: "all", teacher: "all", page: 1 }}
        wishlistItems={hydratedWishlist.length ? hydratedWishlist : mockProfileWishlist}
        purchases={mappedPurchases.length ? mappedPurchases : mockProfilePurchaseHistory}
        settings={settings}
      />
      <CoursesFooter />
    </main>
  );
}
