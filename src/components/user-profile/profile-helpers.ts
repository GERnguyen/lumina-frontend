import type { CourseResponse as EnrollmentCourseResponse, OrderDetailResponse, CourseProgressResponse, WishlistItemResponse } from "@/types";
import {
  getProfileTabs,
  type ProfileCourseFilter,
  type ProfileCourseItem,
  type ProfileLearningCourse,
  type ProfilePurchaseCourse,
  type ProfileWishlistItem,
  type UserProfileCoursesData,
  type UserProfileDashboardData,
  type UserProfilePurchaseHistoryData,
  type UserProfileWishlistData,
} from "@/data/user-profile";
import { UserService } from "@/services/userService";
import { EnrollmentService, OrderService } from "@/services/enrollmentService";
import { LearningProgressService } from "@/services/learningService";
import { WishlistService } from "@/services/socialService";
import { CourseService } from "@/services/courseService";
import { money, moneyWithCurrency } from "@/lib/format";
import { BookOpen, Play, Award, Users } from "lucide-react";

export type UserProfileDashboardResult = {
  dashboard: UserProfileDashboardData;
};

export type UserProfileCoursesResult = {
  coursesPage: UserProfileCoursesData;
};

export type UserProfileWishlistResult = {
  wishlistPage: UserProfileWishlistData;
};

export type UserProfilePurchaseHistoryResult = {
  purchaseHistoryPage: UserProfilePurchaseHistoryData;
};

function mapProgress(progress?: CourseProgressResponse) {
  if (!progress?.totalItems) return undefined;
  return Math.round(((progress.completedItems || 0) / progress.totalItems) * 100);
}

function mapLearningCourse(course: EnrollmentCourseResponse, index: number, progress?: CourseProgressResponse): ProfileLearningCourse {
  const id = course.id || "";

  return {
    id,
    title: course.title || "Untitled Course",
    lesson: progress?.isCompleted ? "Course completed" : "Continue your next lesson",
    image: course.images?.[0]?.imageUrl || "/courses/course-01.png",
    progress: mapProgress(progress),
    href: `/courses/${id}/watch`,
    featured: index === 3,
  };
}

export async function getUserProfileDashboard(): Promise<UserProfileDashboardResult> {
  try {
    const [userPayload, enrolledPayload] = await Promise.all([
      UserService.getCurrentUser(),
      EnrollmentService.getEnrolledCourses({ page: 1, size: 4 }),
    ]);

    const user = userPayload?.data;
    const courses = enrolledPayload?.data || [];
    const courseIds = courses.map((course) => course.id).filter(Boolean) as string[];
    const progressPayload = courseIds.length
      ? await LearningProgressService.getCourseProgressByCourseIds({ courseIds: courseIds.join(",") })
      : undefined;

    const progressData = progressPayload?.data || [];
    const completedCount = progressData.filter((item) => item.isCompleted).length || 0;
    const activeCount = Math.max(0, courses.length - completedCount);
    const enrolledCount = enrolledPayload?.meta?.totalElements || courses.length || 0;

    const learningCourses = courses.map((course, index) =>
      mapLearningCourse(course, index, progressData.find((item) => item.courseId === course.id)),
    );

    return {
      dashboard: {
        user: {
          name: user?.name || "Lumina Learner",
          headline: user?.role === "INSTRUCTOR" ? "Instructor on Lumina" : user?.bio || "Lifelong learner on Lumina",
          avatar: user?.avatarUrl || "/watch-course/avatar.png",
        },
        tabs: getProfileTabs("Dashboard"),
        stats: [
          { label: "Enrolled Courses", value: String(enrolledCount), icon: BookOpen, tone: "purple" },
          { label: "Active Courses", value: String(activeCount), icon: Play, tone: "green" },
          { label: "Completed Courses", value: String(completedCount), icon: Award, tone: "orange" },
          { label: "Teaching Courses", value: user?.role === "INSTRUCTOR" ? "1" : "0", icon: Users, tone: "purple" },
        ],
        learningCourses,
      },
    };
  } catch {
    return {
      dashboard: {
        user: {
          name: "Lumina Learner",
          headline: "Lifelong learner on Lumina",
          avatar: "/watch-course/avatar.png",
        },
        tabs: getProfileTabs("Dashboard"),
        stats: [
          { label: "Enrolled Courses", value: "0", icon: BookOpen, tone: "purple" },
          { label: "Active Courses", value: "0", icon: Play, tone: "green" },
          { label: "Completed Courses", value: "0", icon: Award, tone: "orange" },
          { label: "Teaching Courses", value: "0", icon: Users, tone: "purple" },
        ],
        learningCourses: [],
      },
    };
  }
}

function sortCourses(courses: ProfileCourseItem[], sort?: string) {
  const sorted = [...courses];

  if (sort === "progress") {
    return sorted.sort((a, b) => (b.progress || 0) - (a.progress || 0));
  }

  if (sort === "title") {
    return sorted.sort((a, b) => a.title.localeCompare(b.title));
  }

  return sorted;
}

function mapEnrolledCourse(course: EnrollmentCourseResponse, index: number, progress?: CourseProgressResponse): ProfileCourseItem {
  const id = course.id || "";
  const percentage = mapProgress(progress);

  return {
    id,
    title: course.title || "Untitled Course",
    lesson: progress?.isCompleted ? "Course completed" : "Continue your next lesson",
    image: course.images?.[0]?.imageUrl || "/courses/course-01.png",
    progress: percentage,
    href: `/courses/${id}/watch`,
    featured: index === 3 || index === 11,
    teacher: course.instructor?.name || "Lumina Instructor",
    status: progress?.isCompleted ? "completed" : "active",
  };
}

function formatPurchaseDate(value?: string) {
  if (!value) return "Recent purchase";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function paymentMethodLabel(method?: OrderDetailResponse["paymentMethod"]) {
  if (method === "VN_PAY") return "VNPay";
  if (method === "MOMO") return "MoMo";
  return "Credit Card";
}

function maskedPaymentAccount(paymentInfo?: string) {
  if (!paymentInfo) return "Payment details unavailable";
  const trimmed = paymentInfo.trim();
  const digits = trimmed.replace(/\D/g, "");

  if (digits.length >= 4) {
    return `**** **** **** ${digits.slice(-4)}`;
  }

  return trimmed;
}

function mapWishlistCourse(wishlistItem: WishlistItemResponse, course: EnrollmentCourseResponse | undefined, index: number): ProfileWishlistItem {
  const discounted = course?.discountedPrice ?? course?.price;
  const originalPrice = course?.discountedPrice && course.price && course.discountedPrice < course.price ? money(course.price) : undefined;

  return {
    id: wishlistItem.id || `${wishlistItem.courseId}-${index}`,
    courseId: wishlistItem.courseId || course?.id || "",
    title: course?.title || "Untitled Course",
    image: course?.images?.[0]?.imageUrl || "/courses/course-01.png",
    rating: typeof course?.rating === "number" ? course.rating.toFixed(1) : "5.0",
    reviews: course?.enrollmentCount ? new Intl.NumberFormat("en-US").format(course.enrollmentCount) : "0",
    instructors: course?.instructor?.name ? [course.instructor.name] : ["Lumina Instructor"],
    price: typeof discounted === "number" ? money(discounted) : "Free",
    originalPrice,
  };
}

function mapPurchaseCourse(order: OrderDetailResponse, index: number, course: EnrollmentCourseResponse | undefined): ProfilePurchaseCourse {
  const item = order.items?.[index];
  const price = item?.discountedPrice ?? item?.price ?? course?.discountedPrice ?? course?.price;

  return {
    id: item?.id || `${order.id || "order"}-${item?.courseId || index}`,
    courseId: item?.courseId || course?.id || "",
    title: item?.title || course?.title || "Untitled Course",
    image: course?.images?.[0]?.imageUrl || "/courses/course-01.png",
    rating: typeof course?.rating === "number" ? course.rating.toFixed(1) : "5.0",
    reviews: course?.enrollmentCount ? new Intl.NumberFormat("en-US").format(course.enrollmentCount) : "0",
    instructor: course?.instructor?.name || "Lumina Instructor",
    price: typeof price === "number" ? money(price) : "Free",
  };
}

function mapPurchaseHistory(order: OrderDetailResponse, index: number, courses: EnrollmentCourseResponse[]): UserProfilePurchaseHistoryData["purchases"][number] {
  const itemCount = order.items?.length || 0;
  const coursesById = new Map(courses.map((course) => [course.id, course]));
  const mappedCourses = (order.items || []).map((item, itemIndex) =>
    mapPurchaseCourse(order, itemIndex, item.courseId ? coursesById.get(item.courseId) : undefined),
  );
  const paymentInfo = order.payment?.paymentInfo;

  return {
    id: order.id || `order-${index}`,
    purchasedAt: formatPurchaseDate(order.orderDate),
    summaryDate: formatPurchaseDate(order.orderDate),
    courseCount: itemCount,
    total: moneyWithCurrency(order.discounted ?? order.totalPrice),
    paymentMethod: paymentMethodLabel(order.paymentMethod),
    status: (order.status || "PENDING") as "PENDING" | "PAID" | "CANCELLED" | "REFUNDED",
    paymentName: paymentInfo ? "Lumina Learner" : "Lumina Learner",
    paymentAccount: maskedPaymentAccount(paymentInfo),
    courses: mappedCourses,
  };
}

export async function getUserProfileCourses(filters: ProfileCourseFilter): Promise<UserProfileCoursesResult> {
  const page = filters.page || 1;
  const pageSize = 20;
  try {
    const [userPayload, enrolledPayload] = await Promise.all([
      UserService.getCurrentUser(),
      EnrollmentService.getEnrolledCourses({ page, size: pageSize }),
    ]);

    const user = userPayload?.data;
    const courses = enrolledPayload?.data || [];
    const courseIds = courses.map((course) => course.id).filter(Boolean) as string[];
    const progressPayload = courseIds.length
      ? await LearningProgressService.getCourseProgressByCourseIds({ courseIds: courseIds.join(",") })
      : undefined;

    const progressData = progressPayload?.data || [];
    const mapped = courses.map((course, index) => mapEnrolledCourse(course, index, progressData.find((item) => item.courseId === course.id)));
    const filtered = sortCourses(
      mapped.filter((course) => {
        const query = filters.query?.trim().toLowerCase();
        if (query && !course.title.toLowerCase().includes(query)) return false;
        if (filters.status && filters.status !== "all" && course.status !== filters.status) return false;
        if (filters.teacher && filters.teacher !== "all" && course.teacher.toLowerCase() !== filters.teacher.toLowerCase()) return false;
        return true;
      }),
      filters.sort,
    );

    return {
      coursesPage: {
        user: {
          name: user?.name || "Lumina Learner",
          headline: user?.role === "INSTRUCTOR" ? "Instructor on Lumina" : user?.bio || "Lifelong learner on Lumina",
          avatar: user?.avatarUrl || "/watch-course/avatar.png",
        },
        tabs: getProfileTabs("Courses"),
        totalCourses: enrolledPayload?.meta?.totalElements || filtered.length,
        filters,
        courses: filtered,
        currentPage: page,
        totalPages: enrolledPayload?.meta?.totalPages || 1,
      },
    };
  } catch {
    return {
      coursesPage: {
        user: {
          name: "Lumina Learner",
          headline: "Lifelong learner on Lumina",
          avatar: "/watch-course/avatar.png",
        },
        tabs: getProfileTabs("Courses"),
        totalCourses: 0,
        filters,
        courses: [],
        currentPage: page,
        totalPages: 1,
      },
    };
  }
}

export async function getUserProfileWishlist(): Promise<UserProfileWishlistResult> {
  try {
    const [userPayload, wishlistPayload] = await Promise.all([
      UserService.getCurrentUser(),
      WishlistService.getWishlist(),
    ]);

    const wishlistItems = wishlistPayload?.data || [];
    const courseIds = wishlistItems.map((item) => item.courseId).filter(Boolean) as string[];
    const coursesPayload = courseIds.length ? await CourseService.getCourseById_1({ ids: courseIds.join(",") }) : undefined;
    const user = userPayload?.data;

    const coursesData = coursesPayload?.data || [];
    const hydratedItems = wishlistItems.map((item, index) =>
      mapWishlistCourse(item, coursesData.find((course) => course.id === item.courseId), index),
    );

    return {
      wishlistPage: {
        user: {
          name: user?.name || "Lumina Learner",
          headline: user?.role === "INSTRUCTOR" ? "Instructor on Lumina" : user?.bio || "Lifelong learner on Lumina",
          avatar: user?.avatarUrl || "/watch-course/avatar.png",
        },
        tabs: getProfileTabs("Wishlist"),
        items: hydratedItems,
      },
    };
  } catch {
    return {
      wishlistPage: {
        user: {
          name: "Lumina Learner",
          headline: "Lifelong learner on Lumina",
          avatar: "/watch-course/avatar.png",
        },
        tabs: getProfileTabs("Wishlist"),
        items: [],
      },
    };
  }
}

export async function getUserProfilePurchaseHistory(): Promise<UserProfilePurchaseHistoryResult> {
  try {
    const [userPayload, ordersPayload] = await Promise.all([
      UserService.getCurrentUser(),
      OrderService.getOrders({ page: 1, size: 10, sort: "orderDate,desc" }),
    ]);

    const orders = ordersPayload?.data || [];
    const courseIds = Array.from(new Set(orders.flatMap((order) => order.items?.map((item) => item.courseId).filter(Boolean) || []))) as string[];
    const coursesPayload = courseIds.length ? await CourseService.getCourseById_1({ ids: courseIds.join(",") }) : undefined;
    const user = userPayload?.data;

    const coursesData = coursesPayload?.data || [];
    const mappedPurchases = orders.map((order, index) => mapPurchaseHistory(order, index, coursesData));

    return {
      purchaseHistoryPage: {
        user: {
          name: user?.name || "Lumina Learner",
          headline: user?.role === "INSTRUCTOR" ? "Instructor on Lumina" : user?.bio || "Lifelong learner on Lumina",
          avatar: user?.avatarUrl || "/watch-course/avatar.png",
        },
        tabs: getProfileTabs("Purchase History"),
        purchases: mappedPurchases,
      },
    };
  } catch {
    return {
      purchaseHistoryPage: {
        user: {
          name: "Lumina Learner",
          headline: "Lifelong learner on Lumina",
          avatar: "/watch-course/avatar.png",
        },
        tabs: getProfileTabs("Purchase History"),
        purchases: [],
      },
    };
  }
}
