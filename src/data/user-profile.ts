import type { LucideIcon } from "lucide-react";

export type ProfileTab = {
  label: string;
  href: string;
  active?: boolean;
};

export type ProfileStat = {
  label: string;
  value: string;
  icon: LucideIcon;
  tone: "purple" | "green" | "orange";
};

export type ProfileLearningCourse = {
  id: string;
  title: string;
  lesson: string;
  image: string;
  progress?: number;
  href: string;
  featured?: boolean;
};

export type ProfileCourseFilter = {
  query?: string;
  sort?: string;
  status?: string;
  teacher?: string;
  page?: number;
};

export type ProfileCourseItem = ProfileLearningCourse & {
  teacher: string;
  status: "all" | "active" | "completed";
};

export type ProfileWishlistItem = {
  id: string;
  courseId: string;
  title: string;
  image: string;
  rating: string;
  reviews: string;
  instructors: string[];
  price: string;
  originalPrice?: string;
};

export type ProfilePurchaseCourse = {
  id: string;
  courseId: string;
  title: string;
  image: string;
  rating: string;
  reviews: string;
  instructor: string;
  price: string;
};

export type ProfilePurchaseHistoryItem = {
  id: string;
  purchasedAt: string;
  summaryDate: string;
  courseCount: number;
  total: string;
  paymentMethod: string;
  status: "PENDING" | "PAID" | "CANCELLED" | "REFUNDED";
  paymentName: string;
  paymentAccount: string;
  paymentExpiry?: string;
  courses: ProfilePurchaseCourse[];
};

export type UserProfileDashboardData = {
  user: {
    name: string;
    headline: string;
    avatar: string;
  };
  tabs: ProfileTab[];
  stats: ProfileStat[];
  learningCourses: ProfileLearningCourse[];
};

export type UserProfileCoursesData = {
  user: UserProfileDashboardData["user"];
  tabs: ProfileTab[];
  totalCourses: number;
  filters: ProfileCourseFilter;
  courses: ProfileCourseItem[];
  totalPages: number;
  currentPage: number;
};

export type UserProfileWishlistData = {
  user: UserProfileDashboardData["user"];
  tabs: ProfileTab[];
  items: ProfileWishlistItem[];
};

export type UserProfilePurchaseHistoryData = {
  user: UserProfileDashboardData["user"];
  tabs: ProfileTab[];
  purchases: ProfilePurchaseHistoryItem[];
};

export type UserProfileSettingsData = {
  user: UserProfileDashboardData["user"] & {
    id?: string;
    email: string;
    fullName: string;
    username: string;
    bio: string;
  };
  tabs: ProfileTab[];
};

export const profileTabs: ProfileTab[] = [
  { label: "Dashboard", href: "/user-profile", active: true },
  { label: "Courses", href: "/user-profile/courses" },
  { label: "Wishlist", href: "/user-profile/wishlist" },
  { label: "Purchase History", href: "/user-profile/purchase-history" },
  { label: "Settings", href: "/user-profile/settings" },
];

export function getProfileTabs(activeLabel: string): ProfileTab[] {
  return profileTabs.map((tab) => ({
    ...tab,
    active: tab.label === activeLabel,
  }));
}
