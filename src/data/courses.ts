import type { LucideIcon } from "lucide-react";
import {
  BriefcaseBusiness,
  Camera,
  ChartBar,
  Code2,
  CreditCard,
  HeartPulse,
  Megaphone,
  Package,
  Palette,
  Receipt,
} from "lucide-react";

export type CourseListingItem = {
  id?: string;
  title: string;
  image: string;
  category: string;
  price: string;
  originalPrice?: string;
  rating: string;
  students: string;
  instructor?: string;
  duration?: string;
  badgeTone: "purple" | "orange" | "blue" | "green";
  href?: string;
};

export const courseSuggestions = [
  "user interface",
  "user experience",
  "web design",
  "interface",
  "app",
];

export const courseCategories: Array<{
  label: string;
  count: string;
  icon: LucideIcon;
  active?: boolean;
}> = [
  { label: "Development", count: "12.5k", icon: Code2 },
  { label: "Business", count: "8.2k", icon: BriefcaseBusiness },
  { label: "Finance & Accounting", count: "6.4k", icon: CreditCard },
  { label: "IT & Software", count: "7.5k", icon: ChartBar, active: true },
  { label: "Office Productivity", count: "1.7k", icon: Receipt },
  { label: "Personal Development", count: "3.2k", icon: Package },
  { label: "Design", count: "12.1k", icon: Palette },
  { label: "Marketing", count: "2.6k", icon: Megaphone },
  { label: "Lifestyle", count: "936", icon: Package },
  { label: "Photography & Video", count: "1.5k", icon: Camera },
  { label: "Health & Fitness", count: "8.9k", icon: HeartPulse },
];

export const toolFilters = [
  "HTML 5",
  "CSS 3",
  "Sass",
  "Webflow",
  "Node.js",
  "Laravel",
  "React",
  "Wordpress",
];

export const ratingFilters = ["5 Star", "4 Star & up", "3 Star & up", "2 Star & up", "1 Star & up"];
export const levelFilters = ["All Level", "Beginner", "Intermediate", "Expert"];
export const durationFilters = ["0-2 Months", "3-6 Months", "7-12 Months", "1+ Years"];

export const courseListingItems: CourseListingItem[] = [
  {
    title: "Complete Blender Creator: Learn 3D Modeling for Beginners",
    image: "/courses/course-01.png",
    category: "Design",
    price: "$49",
    rating: "4.8",
    students: "197,637",
    badgeTone: "orange",
  },
  {
    title: "Adobe Premiere Pro CC - Advanced Training Course",
    image: "/courses/course-02.png",
    category: "Design",
    price: "$32",
    rating: "4.9",
    students: "236,568",
    badgeTone: "orange",
  },
  {
    title: "Ultimate AWS Certified Solutions Architect Associate 2021",
    image: "/courses/course-03.png",
    category: "Business",
    price: "$13",
    rating: "4.1",
    students: "511,123",
    badgeTone: "purple",
  },
  {
    title: "Learn Ethical Hacking From Scratch 2021",
    image: "/courses/course-04.png",
    category: "IT & Software",
    price: "$35",
    rating: "4.8",
    students: "451,444",
    badgeTone: "orange",
  },
  {
    title: "Angular - The Complete Guide 2021 Edition",
    image: "/courses/course-05.png",
    category: "Development",
    price: "$16",
    rating: "4.3",
    students: "198,207",
    badgeTone: "purple",
  },
  {
    title: "How to get Diamond in League of Legends Season 11",
    image: "/courses/course-06.png",
    category: "Lifestyle",
    price: "$23",
    rating: "4.7",
    students: "45,489",
    badgeTone: "green",
  },
  {
    title: "SQL for NEWBS: Weekender Crash Course",
    image: "/courses/course-07.png",
    category: "IT & Software",
    price: "$32",
    rating: "4.8",
    students: "451,444",
    badgeTone: "orange",
  },
  {
    title: "SEO 2021: Complete SEO Training + SEO for WordPress Websites",
    image: "/courses/course-08.png",
    category: "Marketing",
    price: "$24",
    rating: "5.0",
    students: "903,198",
    badgeTone: "blue",
  },
  {
    title: "INE Unitinas AWS Certified Cloud Practitioner - 2021",
    image: "/courses/course-09.png",
    category: "Business",
    price: "$9",
    rating: "5.0",
    students: "134,350",
    badgeTone: "purple",
  },
  {
    title: "Complete Adobe Lightroom MegaCourse: Beginner to Expert",
    image: "/courses/course-10.png",
    category: "IT & Software",
    price: "$69",
    rating: "4.9",
    students: "270,512",
    badgeTone: "orange",
  },
  {
    title: "Digital Marketing Masterclass - 23 Courses in 1",
    image: "/courses/course-11.png",
    category: "Development",
    price: "$32",
    rating: "5.0",
    students: "271,614",
    badgeTone: "blue",
  },
  {
    title: "The Ultimate Drawing Course - Beginner to Advanced",
    image: "/courses/course-12.png",
    category: "Marketing",
    price: "$49",
    rating: "4.3",
    students: "767,309",
    badgeTone: "purple",
  },
  {
    title: "Automate the Boring Stuff with Python Programming",
    image: "/courses/course-13.png",
    category: "IT & Software",
    price: "$9",
    rating: "4.5",
    students: "982,814",
    badgeTone: "orange",
  },
  {
    title: "Selenium WebDriver with Java - Basics to Advanced Frameworks",
    image: "/courses/course-14.png",
    category: "Development",
    price: "$15",
    rating: "4.4",
    students: "56,407",
    badgeTone: "blue",
  },
  {
    title: "iPhone Photography: Take Professional Photos On Your iPhone",
    image: "/courses/course-15.png",
    category: "Photography",
    price: "$24",
    rating: "4.5",
    students: "254,844",
    badgeTone: "blue",
  },
  {
    title: "Machine Learning A-Z: Hands-On Python & R In Data Science",
    image: "/courses/course-16.png",
    category: "IT & Software",
    price: "$24",
    rating: "4.7",
    students: "451,444",
    badgeTone: "orange",
  },
  {
    title: "SQL Complete Bootcamp from Zero to Hero in Python",
    image: "/courses/course-17.png",
    category: "Development",
    price: "$15",
    rating: "5.0",
    students: "982,811",
    badgeTone: "blue",
  },
  {
    title: "Premiere Pro CC for Beginners: Video Editing in Premiere",
    image: "/courses/course-18.png",
    category: "Marketing",
    price: "$24",
    rating: "4.8",
    students: "854",
    badgeTone: "purple",
  },
  {
    title: "Learn Python Programming Masterclass",
    image: "/courses/course-19.png",
    category: "IT & Software",
    price: "$35",
    rating: "4.0",
    students: "271,454",
    badgeTone: "orange",
  },
  {
    title: "Instagram Marketing 2021: Complete Guide To Instagram Growth",
    image: "/courses/course-20.png",
    category: "Design",
    price: "$16",
    rating: "4.3",
    students: "854",
    badgeTone: "orange",
  },
  {
    title: "Machine Learning A-Z: Hands-On Python & R In Data Science",
    image: "/courses/course-21.png",
    category: "Design",
    price: "$13",
    rating: "4.6",
    students: "181,811",
    badgeTone: "orange",
  },
];

export const courseFooterGroups = [
  {
    title: "Top categories",
    links: ["Development", "UX / UI Design", "Data Science", "Business"],
  },
  {
    title: "Quick Links",
    links: ["About us", "Become an instructor", "Contact"],
  },
  {
    title: "Support",
    links: ["Help center", "FAQs", "Terms & Condition", "Privacy Policy"],
  },
];
