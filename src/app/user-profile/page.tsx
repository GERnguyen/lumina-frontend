import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { getServerAccessToken } from "@/lib/server-auth";
import { CoursesFooter } from "@/components/courses/CoursesFooter";
import { CoursesTopNav } from "@/components/courses/CoursesTopNav";
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
  paymentMethodLabel,
} from "@/lib/format";

export const metadata: Metadata = {
  title: "Dashboard - Cinx",
  description: "View your Cinx learning dashboard, enrolled courses, progress, wishlist, purchases, and settings.",
  alternates: {
    canonical: "/user-profile",
  },
};

function throwOn401(error: any) {
  const status = error?.response?.status || error?.status;
  if (status === 401) {
    throw error;
  }
}

export default async function Page() {
  try {
    const token = await getServerAccessToken();
    if (!token) {
      redirect("/login?returnUrl=%2Fuser-profile");
    }

    const [userRes, enrolledRes, wishlistRes, ordersRes] = await Promise.all([
      UserApi.getCurrentUser().catch((err) => {
        throwOn401(err);
        return { data: undefined };
      }),
      EnrollmentApi.getEnrolledCourses({ page: 1, size: 20 }).catch((err) => {
        throwOn401(err);
        return { data: [], meta: { totalElements: 0, totalPages: 1 } };
      }),
      WishlistApi.getWishlist().catch((err) => {
        throwOn401(err);
        return { data: [] };
      }),
      OrderApi.getOrders({ page: 1, size: 10, sort: '{"orderDate":"DESC"}' }).catch((err) => {
        throwOn401(err);
        return { data: [] };
      }),
    ]);

    const user = userRes.data;
    const fallbackUser = mockUserProfileDashboard.user;
    const profileUser = {
      name: user?.name || fallbackUser.name,
      headline: user?.role === "INSTRUCTOR" ? "Instructor on Cinx" : user?.bio || fallbackUser.headline,
      avatar: getProfileAvatar(user),
    };

    const enrolledCourses = enrolledRes.data || [];
    const enrolledIds = enrolledCourses.map((item) => item.course?.id).filter(Boolean) as string[];
    const progressRes = enrolledIds.length
      ? await LearningProgressApi.getCourseProgressByCourseIds(enrolledIds.join(",")).catch(() => ({ data: [] }))
      : { data: [] };
    const progressList = progressRes.data || [];
    const completedCourses = progressList.filter((item) => item.isCompleted && item.isPassed).length;

    const mappedCourses = enrolledCourses.map((item, index) => {
      const course = item.course || {};
      const progressItem = progressList.find((p) => p.courseId === course.id);
      const progress = progressItem?.totalItems
        ? Math.round(((progressItem.completedItems || 0) / progressItem.totalItems) * 100)
        : undefined;

      return {
        id: course.id || `course-${index}`,
        title: course.title || "Untitled course",
        lesson: "Continue your learning",
        image: getCourseImage(course, index),
        progress,
        href: `/learning/${course.id}`,
        featured: index === 3,
        teacher: getCourseInstructorName(course),
        isPassed: progressItem?.isPassed,
        status: (progressItem?.isCompleted && progressItem?.isPassed ? "completed" as const : "active" as const) as "all" | "active" | "completed",
        enrolledAt: item.enrolledAt,
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

    const enrolledWishlistIds = new Set<string>();
    if (wishlistCourseIds.length) {
      const checkRes = await EnrollmentApi.checkEnrollmentStatus(wishlistCourseIds).catch(() => ({ data: [] }));
      (checkRes.data || []).forEach((status) => {
        if (status.courseId && status.isEnrolled) {
          enrolledWishlistIds.add(status.courseId);
        }
      });
    }

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
      const isPurchased = item.courseId ? enrolledWishlistIds.has(item.courseId) : false;

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
        isPurchased,
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
        email: user?.email || "learner@cinx.local",
        headline: profileUser.headline,
        avatar: profileUser.avatar,
        bio: user?.bio || "",
      },
      tabs: [],
    };

    return (
      <main className="min-h-screen bg-white">
        <CoursesTopNav />
        <Suspense fallback={
          <div className="flex h-96 items-center justify-center">
            <div className="size-8 animate-spin rounded-full border-4 border-[#7872FD] border-t-transparent" />
          </div>
        }>
          <UserProfileSpaShell
            user={profileUser}
            totalEnrolled={enrolledRes.meta?.totalElements || mappedCourses.length}
            activeCourses={Math.max(0, mappedCourses.length - completedCourses)}
            completedCourses={completedCourses}
            learningCourses={mappedCourses.length ? mappedCourses.slice(0, 4) : mockUserProfileDashboard.learningCourses}
            courses={mappedCourses.length ? mappedCourses : mockProfileCourses}
            courseFilters={{ sort: "latest", status: "all", teacher: "all", page: 1 }}
            wishlistItems={hydratedWishlist}
            purchases={mappedPurchases.length ? mappedPurchases : mockProfilePurchaseHistory}
            settings={settings}
          />
        </Suspense>
        <CoursesFooter />
      </main>
    );
  } catch (error: any) {
    if (isRedirectError(error)) {
      throw error;
    }
    const status = error?.response?.status || error?.status;
    if (status === 401) {
      redirect("/login?returnUrl=%2Fuser-profile&error=session_expired");
    }
    throw error;
  }
}
