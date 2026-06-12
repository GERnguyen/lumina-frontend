import type { CourseResponse as EnrollmentCourseResponse, OrderDetailResponse, PaginatedMetadata } from "@/api/generated/enrollment";
import type { CourseProgressResponse } from "@/api/generated/learning";
import type { WishlistItemResponse } from "@/api/generated/social";
import type { UserDto } from "@/api/generated/user";
import { authHeaders } from "@/lib/server-auth";
import {
  getProfileTabs,
  mockProfilePurchaseHistory,
  mockProfileCourses,
  mockProfileWishlist,
  mockUserProfileDashboard,
  type ProfileCourseFilter,
  type ProfileCourseItem,
  type ProfileLearningCourse,
  type ProfilePurchaseCourse,
  type ProfileWishlistItem,
  type UserProfileCoursesData,
  type UserProfileDashboardData,
  type UserProfilePurchaseHistoryData,
  type UserProfileSettingsData,
  type UserProfileWishlistData,
} from "@/data/user-profile";
import { API_BASE_URL } from "@/lib/api-base";

type UserPayload = {
  data?: UserDto;
};

type EnrolledCoursesPayload = {
  data?: EnrollmentCourseResponse[];
  meta?: PaginatedMetadata;
};

type CourseProgressPayload = {
  data?: CourseProgressResponse[];
};

type WishlistPayload = {
  data?: WishlistItemResponse[];
};

type CourseListPayload = {
  data?: EnrollmentCourseResponse[];
};

type OrdersPayload = {
  data?: OrderDetailResponse[];
  meta?: PaginatedMetadata;
};

export type UserProfileDashboardResult = {
  dashboard: UserProfileDashboardData;
  isFallback: boolean;
};

export type UserProfileCoursesResult = {
  coursesPage: UserProfileCoursesData;
  isFallback: boolean;
};

export type UserProfileWishlistResult = {
  wishlistPage: UserProfileWishlistData;
  isFallback: boolean;
};

export type UserProfilePurchaseHistoryResult = {
  purchaseHistoryPage: UserProfilePurchaseHistoryData;
  isFallback: boolean;
};

export type UserProfileSettingsResult = {
  settingsPage: UserProfileSettingsData;
  isFallback: boolean;
};

function apiUrl(path: string, params?: Record<string, string | number | undefined>) {
  const url = new URL(path, API_BASE_URL);
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  return url;
}

function courseIdsUrl(courseIds: string[]) {
  const url = apiUrl("/api/v1/courses/ids");
  courseIds.forEach((courseId) => url.searchParams.append("ids", courseId));
  return url;
}

function profileAvatar(user?: UserDto, fallbackName = "Lumina Learner") {
  if (user?.avatarUrl) return user.avatarUrl;

  const name = user?.name || fallbackName;
  const params = new URLSearchParams({
    name,
    background: "EBEBFF",
    color: "564FFD",
    bold: "true",
  });

  return `https://ui-avatars.com/api/?${params.toString()}`;
}

async function fetchJson<T>(url: URL): Promise<T | undefined> {
  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: await authHeaders({ Accept: "application/json" }),
    });

    if (!response.ok) return undefined;
    if (!(response.headers.get("content-type") || "").includes("application/json")) return undefined;

    return (await response.json()) as T;
  } catch {
    return undefined;
  }
}

function mapProgress(progress?: CourseProgressResponse) {
  if (!progress?.totalItems) return undefined;
  return Math.round(((progress.completedItems || 0) / progress.totalItems) * 100);
}

function mapLearningCourse(course: EnrollmentCourseResponse, index: number, progress?: CourseProgressResponse): ProfileLearningCourse {
  const mock = mockUserProfileDashboard.learningCourses[index % mockUserProfileDashboard.learningCourses.length];
  const id = course.id || mock.id;

  return {
    id,
    title: course.title || mock.title,
    lesson: index === 0 ? "Continue your next lesson" : mock.lesson,
    image: course.images?.[0]?.imageUrl || mock.image,
    progress: mapProgress(progress),
    href: `/courses/${id}/watch`,
    featured: index === 3,
  };
}

export async function getUserProfileDashboard(): Promise<UserProfileDashboardResult> {
  const [userPayload, enrolledPayload] = await Promise.all([
    fetchJson<UserPayload>(apiUrl("/api/v1/users/me")),
    fetchJson<EnrolledCoursesPayload>(apiUrl("/api/v1/enrollments", { page: 1, size: 4 })),
  ]);

  if (!userPayload?.data && !enrolledPayload?.data?.length) {
    return {
      dashboard: mockUserProfileDashboard,
      isFallback: true,
    };
  }

  const courses = enrolledPayload?.data || [];
  const courseIds = courses.map((course) => course.id).filter(Boolean) as string[];
  const progressPayload = courseIds.length
    ? await fetchJson<CourseProgressPayload>(apiUrl("/api/v1/learning/course-progress", { courseIds: courseIds.join(",") }))
    : undefined;
  const completedCount = progressPayload?.data?.filter((item) => item.isCompleted).length || 0;
  const learningCourses = courses.map((course, index) =>
    mapLearningCourse(course, index, progressPayload?.data?.find((item) => item.courseId === course.id)),
  );
  const user = userPayload?.data;

  return {
    dashboard: {
      user: {
        name: user?.name || mockUserProfileDashboard.user.name,
        headline: user?.role === "INSTRUCTOR" ? "Instructor on Lumina" : user?.bio || "Lifelong learner on Lumina",
        avatar: profileAvatar(user, mockUserProfileDashboard.user.name),
      },
      tabs: getProfileTabs("Dashboard"),
      stats: [
        { ...mockUserProfileDashboard.stats[0], value: String(enrolledPayload?.meta?.totalElements || courses.length || 0) },
        { ...mockUserProfileDashboard.stats[1], value: String(Math.max(0, courses.length - completedCount)) },
        { ...mockUserProfileDashboard.stats[2], value: String(completedCount) },
        { ...mockUserProfileDashboard.stats[3], value: user?.role === "INSTRUCTOR" ? "1" : "0" },
      ],
      learningCourses: learningCourses.length ? learningCourses : mockUserProfileDashboard.learningCourses,
    },
    isFallback: !userPayload?.data || !enrolledPayload?.data,
  };
}

export async function getUserProfileSettings(): Promise<UserProfileSettingsResult> {
  const userPayload = await fetchJson<UserPayload>(apiUrl("/api/v1/users/me"));
  const user = userPayload?.data;
  const fallbackUser = mockUserProfileDashboard.user;
  const name = user?.name || fallbackUser.name;
  const username = user?.email?.split("@")[0] || name.toLowerCase().replace(/\s+/g, ".");

  return {
    settingsPage: {
      user: {
        id: user?.userId,
        name,
        fullName: name,
        username,
        email: user?.email || "learner@lumina.local",
        headline: user?.role === "INSTRUCTOR" ? "Instructor on Lumina" : user?.bio || fallbackUser.headline,
        avatar: profileAvatar(user, fallbackUser.name),
        bio: user?.bio || "",
      },
      tabs: getProfileTabs("Settings"),
    },
    isFallback: !userPayload?.data,
  };
}

function filterMockCourses(filters: ProfileCourseFilter) {
  const query = filters.query?.trim().toLowerCase();
  const status = filters.status && filters.status !== "all" ? filters.status : undefined;
  const teacher = filters.teacher && filters.teacher !== "all" ? filters.teacher : undefined;

  return mockProfileCourses
    .filter((course) => (!query ? true : course.title.toLowerCase().includes(query) || course.lesson.toLowerCase().includes(query)))
    .filter((course) => (!status ? true : course.status === status))
    .filter((course) => (!teacher ? true : course.teacher === teacher));
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
  const mock = mockProfileCourses[index % mockProfileCourses.length];
  const id = course.id || mock.id;
  const percentage = mapProgress(progress);

  return {
    id,
    title: course.title || mock.title,
    lesson: mock.lesson,
    image: course.images?.[0]?.imageUrl || mock.image,
    progress: percentage,
    href: `/courses/${id}/watch`,
    featured: index === 3 || index === 11,
    teacher: course.instructor?.name || mock.teacher,
    status: progress?.isCompleted ? "completed" : "active",
  };
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

function moneyWithCurrency(value?: number) {
  if (typeof value !== "number") return "Free";
  if (value === 0) return "Free";

  return `${new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)} USD`;
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
  const mock = mockProfileWishlist[index % mockProfileWishlist.length];
  const discounted = course?.discountedPrice ?? course?.price;
  const originalPrice = course?.discountedPrice && course.price && course.discountedPrice < course.price ? money(course.price) : undefined;

  return {
    id: wishlistItem.id || `${wishlistItem.courseId}-${index}`,
    courseId: wishlistItem.courseId || course?.id || mock.courseId,
    title: course?.title || mock.title,
    image: course?.images?.[0]?.imageUrl || mock.image,
    rating: typeof course?.rating === "number" ? course.rating.toFixed(1) : mock.rating,
    reviews: course?.enrollmentCount ? new Intl.NumberFormat("en-US").format(course.enrollmentCount) : mock.reviews,
    instructors: course?.instructor?.name ? [course.instructor.name] : mock.instructors,
    price: typeof discounted === "number" ? money(discounted) : mock.price,
    originalPrice,
  };
}

function mapPurchaseCourse(order: OrderDetailResponse, index: number, course: EnrollmentCourseResponse | undefined): ProfilePurchaseCourse {
  const item = order.items?.[index];
  const mock = mockProfilePurchaseHistory[0].courses[index % mockProfilePurchaseHistory[0].courses.length];
  const price = item?.discountedPrice ?? item?.price ?? course?.discountedPrice ?? course?.price;

  return {
    id: item?.id || `${order.id || "order"}-${item?.courseId || index}`,
    courseId: item?.courseId || course?.id || mock.courseId,
    title: item?.title || course?.title || mock.title,
    image: course?.images?.[0]?.imageUrl || mock.image,
    rating: typeof course?.rating === "number" ? course.rating.toFixed(1) : mock.rating,
    reviews: course?.enrollmentCount ? new Intl.NumberFormat("en-US").format(course.enrollmentCount) : mock.reviews,
    instructor: course?.instructor?.name || mock.instructor,
    price: typeof price === "number" ? money(price) : mock.price,
  };
}

function mapPurchaseHistory(order: OrderDetailResponse, index: number, courses: EnrollmentCourseResponse[]) {
  const mock = mockProfilePurchaseHistory[index % mockProfilePurchaseHistory.length];
  const itemCount = order.items?.length || 0;
  const coursesById = new Map(courses.map((course) => [course.id, course]));
  const mappedCourses = (order.items || []).map((item, itemIndex) =>
    mapPurchaseCourse(order, itemIndex, item.courseId ? coursesById.get(item.courseId) : undefined),
  );
  const paymentInfo = order.payment?.paymentInfo;

  return {
    id: order.id || mock.id,
    purchasedAt: formatPurchaseDate(order.orderDate) || mock.purchasedAt,
    summaryDate: formatPurchaseDate(order.orderDate) || mock.summaryDate,
    courseCount: itemCount || mock.courseCount,
    total: moneyWithCurrency(order.discounted ?? order.totalPrice) || mock.total,
    paymentMethod: paymentMethodLabel(order.paymentMethod),
    status: order.status || mock.status,
    paymentName: paymentInfo ? "Lumina Learner" : mock.paymentName,
    paymentAccount: maskedPaymentAccount(paymentInfo) || mock.paymentAccount,
    paymentExpiry: mock.paymentExpiry,
    courses: mappedCourses.length ? mappedCourses : mock.courses,
  };
}

export async function getUserProfileCourses(filters: ProfileCourseFilter): Promise<UserProfileCoursesResult> {
  const page = filters.page || 1;
  const pageSize = 20;
  const [userPayload, enrolledPayload] = await Promise.all([
    fetchJson<UserPayload>(apiUrl("/api/v1/users/me")),
    fetchJson<EnrolledCoursesPayload>(apiUrl("/api/v1/enrollments", { page, size: pageSize })),
  ]);

  if (!userPayload?.data && !enrolledPayload?.data?.length) {
    const filtered = sortCourses(filterMockCourses(filters), filters.sort);
    return {
      coursesPage: {
        user: mockUserProfileDashboard.user,
        tabs: getProfileTabs("Courses"),
        totalCourses: filtered.length,
        filters,
        courses: filtered,
        currentPage: page,
        totalPages: 5,
      },
      isFallback: true,
    };
  }

  const courses = enrolledPayload?.data || [];
  const courseIds = courses.map((course) => course.id).filter(Boolean) as string[];
  const progressPayload = courseIds.length
    ? await fetchJson<CourseProgressPayload>(apiUrl("/api/v1/learning/course-progress", { courseIds: courseIds.join(",") }))
    : undefined;
  const mapped = courses.map((course, index) => mapEnrolledCourse(course, index, progressPayload?.data?.find((item) => item.courseId === course.id)));
  const filtered = sortCourses(
    mapped.filter((course) => {
      const query = filters.query?.trim().toLowerCase();
      if (query && !course.title.toLowerCase().includes(query) && !course.lesson.toLowerCase().includes(query)) return false;
      if (filters.status && filters.status !== "all" && course.status !== filters.status) return false;
      if (filters.teacher && filters.teacher !== "all" && course.teacher !== filters.teacher) return false;
      return true;
    }),
    filters.sort,
  );
  const user = userPayload?.data;

  return {
    coursesPage: {
      user: {
        name: user?.name || mockUserProfileDashboard.user.name,
        headline: user?.role === "INSTRUCTOR" ? "Instructor on Lumina" : user?.bio || "Lifelong learner on Lumina",
        avatar: profileAvatar(user, mockUserProfileDashboard.user.name),
      },
      tabs: getProfileTabs("Courses"),
      totalCourses: enrolledPayload?.meta?.totalElements || filtered.length,
      filters,
      courses: filtered.length ? filtered : mockProfileCourses,
      currentPage: page,
      totalPages: enrolledPayload?.meta?.totalPages || 1,
    },
    isFallback: !userPayload?.data || !enrolledPayload?.data,
  };
}

export async function getUserProfileWishlist(): Promise<UserProfileWishlistResult> {
  const [userPayload, wishlistPayload] = await Promise.all([
    fetchJson<UserPayload>(apiUrl("/api/v1/users/me")),
    fetchJson<WishlistPayload>(apiUrl("/api/v1/wishlist")),
  ]);

  if (!userPayload?.data && !wishlistPayload?.data?.length) {
    return {
      wishlistPage: {
        user: mockUserProfileDashboard.user,
        tabs: getProfileTabs("Wishlist"),
        items: mockProfileWishlist,
      },
      isFallback: true,
    };
  }

  const wishlistItems = wishlistPayload?.data || [];
  const courseIds = wishlistItems.map((item) => item.courseId).filter(Boolean) as string[];
  const coursesPayload = courseIds.length ? await fetchJson<CourseListPayload>(courseIdsUrl(courseIds)) : undefined;
  const user = userPayload?.data;
  const hydratedItems = wishlistItems.map((item, index) =>
    mapWishlistCourse(item, coursesPayload?.data?.find((course) => course.id === item.courseId), index),
  );

  return {
    wishlistPage: {
      user: {
        name: user?.name || mockUserProfileDashboard.user.name,
        headline: user?.role === "INSTRUCTOR" ? "Instructor on Lumina" : user?.bio || "Lifelong learner on Lumina",
        avatar: profileAvatar(user, mockUserProfileDashboard.user.name),
      },
      tabs: getProfileTabs("Wishlist"),
      items: hydratedItems.length ? hydratedItems : mockProfileWishlist,
    },
    isFallback: !userPayload?.data || !wishlistPayload?.data || !coursesPayload?.data,
  };
}

export async function getUserProfilePurchaseHistory(): Promise<UserProfilePurchaseHistoryResult> {
  const [userPayload, ordersPayload] = await Promise.all([
    fetchJson<UserPayload>(apiUrl("/api/v1/users/me")),
    fetchJson<OrdersPayload>(apiUrl("/api/v1/orders", { page: 1, size: 10, sort: "orderDate,desc" })),
  ]);

  if (!userPayload?.data && !ordersPayload?.data?.length) {
    return {
      purchaseHistoryPage: {
        user: mockUserProfileDashboard.user,
        tabs: getProfileTabs("Purchase History"),
        purchases: mockProfilePurchaseHistory,
      },
      isFallback: true,
    };
  }

  const orders = ordersPayload?.data || [];
  const courseIds = Array.from(new Set(orders.flatMap((order) => order.items?.map((item) => item.courseId).filter(Boolean) || []))) as string[];
  const coursesPayload = courseIds.length ? await fetchJson<CourseListPayload>(courseIdsUrl(courseIds)) : undefined;
  const user = userPayload?.data;
  const mappedPurchases = orders.map((order, index) => mapPurchaseHistory(order, index, coursesPayload?.data || []));

  return {
    purchaseHistoryPage: {
      user: {
        name: user?.name || mockUserProfileDashboard.user.name,
        headline: user?.role === "INSTRUCTOR" ? "Instructor on Lumina" : user?.bio || "Lifelong learner on Lumina",
        avatar: profileAvatar(user, mockUserProfileDashboard.user.name),
      },
      tabs: getProfileTabs("Purchase History"),
      purchases: mappedPurchases.length ? mappedPurchases : mockProfilePurchaseHistory,
    },
    isFallback: !userPayload?.data || !ordersPayload?.data || (courseIds.length > 0 && !coursesPayload?.data),
  };
}
