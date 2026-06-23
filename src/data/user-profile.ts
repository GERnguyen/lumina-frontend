import type { LucideIcon } from "lucide-react";
import { CheckSquare, PlayCircle, Trophy, Users } from "lucide-react";

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
  isPurchased?: boolean;
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
  paymentId?: string;
  rawPaymentMethod?: string;
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

export const mockUserProfileDashboard: UserProfileDashboardData = {
  user: {
    name: "Lumina Learner",
    headline: "Lifelong learner on Lumina",
    avatar: "https://ui-avatars.com/api/?name=Lumina+Learner&background=EBEBFF&color=564FFD&bold=true",
  },
  tabs: getProfileTabs("Dashboard"),
  stats: [
    { label: "Enrolled Courses", value: "0", icon: PlayCircle, tone: "purple" },
    { label: "Active Courses", value: "0", icon: CheckSquare, tone: "purple" },
    { label: "Completed Courses", value: "0", icon: Trophy, tone: "green" },
    { label: "Course Instructors", value: "0", icon: Users, tone: "orange" },
  ],
  learningCourses: [
    {
      id: "fallback-course",
      title: "Start learning with Lumina",
      lesson: "Choose a course to begin",
      image: "/courses/course-01.png",
      href: "/courses",
    },
  ],
};

export const mockProfileCourses: ProfileCourseItem[] = [
  {
    id: "fallback-course",
    title: "Start learning with Lumina",
    lesson: "Choose a course to begin",
    image: "/courses/course-01.png",
    progress: 0,
    href: "/courses",
    teacher: "Lumina Instructor",
    status: "active",
  },
];

export const mockProfileWishlist: ProfileWishlistItem[] = [
  {
    id: "fallback-wishlist",
    courseId: "fallback-course",
    title: "Save a course to your wishlist",
    image: "/courses/course-02.png",
    rating: "No reviews yet",
    reviews: "",
    instructors: ["Lumina Instructor"],
    price: "Free",
  },
];

export const mockProfilePurchaseHistory: ProfilePurchaseHistoryItem[] = [];
