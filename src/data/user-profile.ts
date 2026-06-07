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
    name: "Kevin Gilbert",
    headline: "Web Designer & Best-Selling Instructor",
    avatar: "/course-detail/person-2.png",
  },
  tabs: getProfileTabs("Dashboard"),
  stats: [
    { label: "Enrolled Courses", value: "957", icon: PlayCircle, tone: "purple" },
    { label: "Active Courses", value: "6", icon: CheckSquare, tone: "purple" },
    { label: "Completed Courses", value: "951", icon: Trophy, tone: "green" },
    { label: "Course Instructors", value: "241", icon: Users, tone: "orange" },
  ],
  learningCourses: [
    {
      id: "reiki-level",
      title: "Reiki Level I, II and Master/Teacher Program",
      lesson: "1. Introductions",
      image: "/courses/course-01.png",
      href: "/courses/complete-website-responsive-design/watch",
    },
    {
      id: "web-bootcamp",
      title: "The Complete 2021 Web Development Bootcamp",
      lesson: "167. What You'll Need to Get Started - Se...",
      image: "/courses/course-02.png",
      progress: 61,
      href: "/courses/complete-website-responsive-design/watch",
    },
    {
      id: "copywriting",
      title: "Copywriting - Become a Freelance Copywriter...",
      lesson: "1. How to get started with figma",
      image: "/courses/course-03.png",
      href: "/courses/complete-website-responsive-design/watch",
    },
    {
      id: "python",
      title: "2021 Complete Python Bootcamp From Zero to...",
      lesson: "9. Advanced CSS - Selector Priority",
      image: "/courses/course-04.png",
      progress: 12,
      href: "/courses/complete-website-responsive-design/watch",
      featured: true,
    },
  ],
};

const mockCourseTitles = [
  "Learn Ethical Hacking From Scratch",
  "SQL for NEWBS: Weekender Crash Course",
  "Complete Adobe Lightroom Megacourse: Begin...",
  "Machine Learning A-Z: Hands-On Python & R I...",
  "Premiere Pro CC for Beginners: Video Editing in...",
  "Graphic Design Masterclass - Learn GREAT De...",
  "Angular - The Complete Guide (2021 Edition)",
  "Complete Blender Creator: Learn 3D Modelling...",
  "Ultimate Google Ads Training 2021: Profit with...",
  "SEO 2021: Complete SEO Training + SEO for W...",
  "Instagram Marketing 2021: Complete Guide To I...",
  "INEVU Ultimate AWS Certified Cloud Practitio...",
  "Automate the Boring Stuff with Python Progra...",
  "Machine Learning A-Z: Hands-On Python & R I...",
  "Selenium WebDriver with Java -Basics to Adva...",
  "Data Structures & Algorithms Essentials (2021)",
  "Digital Marketing Masterclass - 23 Courses in 1",
  "Mega Digital Marketing Course A-Z: 12 Courses...",
  "Adobe Premiere Pro CC - Advanced Training C...",
  "iPhone Photography | Take Professional Photos...",
];

const mockLessonTitles = [
  "31. Learn More About Web Design",
  "165. Font Properties Challenge 3 - Chan...",
  "7. Adding Content to Our Website",
  "651. CSS Font Property Challenge Soluti...",
  "1. Adding Content to Our Website",
  "17. The Dark Art of Centering Elements w...",
  "54. CSS Static and Relative Positioning",
  "8. Learn More About Typography",
  "1. Introductions",
  "1. Introductions",
  "54. CSS Static and Relative Positioning",
  "91. CSS Float and Clear",
  "5. Absolute positioning",
  "93. Font Styling in Our Personal Site",
  "31. Learn More About Web Design",
  "8. CSS Sizing",
  "6. Learn More About Typography",
  "6. Learn More About Typography",
  "3. Absolute positioning",
  "8. CSS Sizing",
];

const mockProgress = [undefined, 2, undefined, 23, undefined, 21, undefined, 52, undefined, undefined, 52, 13, 34, 31, 34, undefined, 51, 12, 41, 62];

export const mockProfileCourses: ProfileCourseItem[] = mockCourseTitles.map((title, index) => ({
  id: `profile-course-${index + 1}`,
  title,
  lesson: mockLessonTitles[index],
  image: `/courses/course-${String((index % 20) + 1).padStart(2, "0")}.png`,
  progress: mockProgress[index],
  href: "/courses/complete-website-responsive-design/watch",
  featured: index === 3 || index === 11,
  teacher: ["Kevin Gilbert", "Dianne Russell", "Kristin Watson", "Vako Shvili"][index % 4],
  status: typeof mockProgress[index] === "number" && mockProgress[index]! >= 100 ? "completed" : "active",
}));

export const mockProfileWishlist: ProfileWishlistItem[] = [
  {
    id: "wishlist-drawing",
    courseId: "wishlist-drawing",
    title: "The Ultimate Drawing Course - Beginner to Advanced",
    image: "/courses/course-13.png",
    rating: "4.6",
    reviews: "451,444",
    instructors: ["Harry Potter", "John Wick"],
    price: "$37.00",
    originalPrice: "$49.00",
  },
  {
    id: "wishlist-marketing",
    courseId: "wishlist-marketing",
    title: "Digital Marketing Masterclass - 23 Courses in 1",
    image: "/courses/course-06.png",
    rating: "4.8",
    reviews: "451,444",
    instructors: ["Nobody"],
    price: "$24.00",
  },
  {
    id: "wishlist-angular",
    courseId: "wishlist-angular",
    title: "Angular - The Complete Guide (2021 Edition)",
    image: "/courses/course-04.png",
    rating: "4.7",
    reviews: "451,444",
    instructors: ["Kevin Gilbert"],
    price: "$13.00",
  },
];

export const mockProfilePurchaseHistory: ProfilePurchaseHistoryItem[] = [
  {
    id: "purchase-sep-01-3",
    purchasedAt: "1st September, 2021 at 11:30 PM",
    summaryDate: "1st September, 2021 at 11:30 PM",
    courseCount: 3,
    total: "$75.00 USD",
    paymentMethod: "Credit Card",
    status: "PAID",
    paymentName: "Kevin Gilbert",
    paymentAccount: "4142 **** **** ****",
    paymentExpiry: "04/24",
    courses: [
      {
        id: "purchase-ethical-hacking",
        courseId: "ethical-hacking",
        title: "Learn Ethical Hacking From Scratch",
        image: "/courses/course-18.png",
        rating: "4.7",
        reviews: "451,444",
        instructor: "Marvin McKinney",
        price: "$13.99",
      },
      {
        id: "purchase-marketing",
        courseId: "digital-marketing",
        title: "Mega Digital Marketing Course A-Z: 12 Courses in 1 + Updates",
        image: "/courses/course-17.png",
        rating: "4.7",
        reviews: "451,444",
        instructor: "Esther Howard",
        price: "$49.00",
      },
    ],
  },
  {
    id: "purchase-aug-31",
    purchasedAt: "31st August, 2021 at 11:30 PM",
    summaryDate: "31st August, 2021 at 11:30 PM",
    courseCount: 52,
    total: "$507.00 USD",
    paymentMethod: "Credit Card",
    status: "PAID",
    paymentName: "Kevin Gilbert",
    paymentAccount: "4142 **** **** ****",
    paymentExpiry: "04/24",
    courses: [],
  },
  {
    id: "purchase-aug-24",
    purchasedAt: "24th August, 2021 at 6:34 PM",
    summaryDate: "24th August, 2021 at 6:34 PM",
    courseCount: 1,
    total: "$9.00 USD",
    paymentMethod: "Credit Card",
    status: "PAID",
    paymentName: "Kevin Gilbert",
    paymentAccount: "4142 **** **** ****",
    paymentExpiry: "04/24",
    courses: [],
  },
  {
    id: "purchase-sep-01-1",
    purchasedAt: "1st September, 2021 at 8:47 PM",
    summaryDate: "1st September, 2021 at 8:47 PM",
    courseCount: 1,
    total: "$25.00 USD",
    paymentMethod: "Credit Card",
    status: "PAID",
    paymentName: "Kevin Gilbert",
    paymentAccount: "4142 **** **** ****",
    paymentExpiry: "04/24",
    courses: [],
  },
  {
    id: "purchase-sep-01-5",
    purchasedAt: "1st September, 2021 at 11:30 PM",
    summaryDate: "1st September, 2021 at 11:30 PM",
    courseCount: 5,
    total: "$89.00 USD",
    paymentMethod: "Credit Card",
    status: "PAID",
    paymentName: "Kevin Gilbert",
    paymentAccount: "4142 **** **** ****",
    paymentExpiry: "04/24",
    courses: [],
  },
  {
    id: "purchase-jul-17",
    purchasedAt: "17th July, 2021 at 10:51 AM",
    summaryDate: "17th July, 2021 at 10:51 AM",
    courseCount: 7,
    total: "$140.00 USD",
    paymentMethod: "Credit Card",
    status: "PAID",
    paymentName: "Kevin Gilbert",
    paymentAccount: "4142 **** **** ****",
    paymentExpiry: "04/24",
    courses: [],
  },
];
