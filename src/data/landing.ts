import type { LucideIcon } from "lucide-react";
import {
  BookOpenCheck,
  BriefcaseBusiness,
  Code2,
  FileText,
  GraduationCap,
  Layers3,
  LineChart,
  Palette,
  PenTool,
  PlayCircle,
  Sparkles,
  UsersRound,
} from "lucide-react";

export const landingNavItems = [
  { label: "Explore", href: "/courses" },
  { label: "Courses", href: "/courses" },
  { label: "Skillsets", href: "#skillsets" },
  { label: "Contact Us", href: "#contact" },
];

export type TrustedLogo =
  | {
    name: string;
    image: string;
    width: number;
    height: number;
    text?: never;
    icon?: never;
  }
  | {
    name: string;
    text: string;
    icon?: LucideIcon;
    image?: never;
    width?: never;
    height?: never;
  };

export const trustedLogos: TrustedLogo[] = [
  { name: "Google", image: "/landing/figma/hero-google.png", width: 216, height: 212 },
  { name: "IBM", image: "/landing/figma/hero-ibm.png", width: 255, height: 104 },
  { name: "Microsoft", image: "/landing/figma/hero-microsoft.png", width: 381, height: 122 },
  { name: "Meta", image: "/landing/figma/hero-meta.png", width: 238, height: 230 },
];

export const courseTabs = [
  "Software Dev",
  "UX / UI Design",
  "Data Science",
  "Business",
  "Project Manager",
  "Design",
];

export type LandingCourse = {
  id?: string;
  title: string;
  categoryId?: string;
  category: string;
  price: string;
  image: string;
  students: string;
  rating?: string;
  href?: string;
  icon?: LucideIcon;
};

export const landingCourses: LandingCourse[] = [
  {
    title: "Machine Learning A-Z: Hands-On Python & R In Data Science",
    category: "Design",
    price: "$57",
    image: "/landing/figma/course-1.png",
    students: "265.7K",
    icon: Sparkles,
  },
  {
    title: "The Complete 2021 Web Development Bootcamp",
    category: "Developments",
    price: "$57",
    image: "/landing/figma/course-2.png",
    students: "265.7K",
    icon: Code2,
  },
  {
    title: "Learn Python Programming Masterclass",
    category: "Business",
    price: "$57",
    image: "/landing/figma/course-3.png",
    students: "265.7K",
    icon: BriefcaseBusiness,
  },
  {
    title: "The Complete Digital Marketing Course - 12 Courses in 1",
    category: "Marketing",
    price: "$57",
    image: "/landing/figma/course-4.png",
    students: "265.7K",
    icon: LineChart,
  },
  {
    title: "The Complete Foundation Stock Trading Course",
    category: "Music",
    price: "$57",
    image: "/landing/figma/course-5.png",
    students: "265.7K",
    icon: Layers3,
  },
  {
    title: "Beginner to Pro in Excel: Financial Modeling and Valuation",
    category: "Marketing",
    price: "$57",
    image: "/landing/figma/course-6.png",
    students: "265.7K",
    icon: BookOpenCheck,
  },
  {
    title: "The Python Mega Course: Build 10 Real World Applications",
    category: "Health & Fitness",
    price: "$57",
    image: "/landing/figma/course-7.png",
    students: "265.7K",
    icon: GraduationCap,
  },
  {
    title: "Copywriting - Become a Freelance Copywriter, your own boss",
    category: "Design",
    price: "$57",
    image: "/landing/figma/course-8.png",
    students: "265.7K",
    icon: PenTool,
  },
];

export const featureCards = [
  {
    title: "Building Skills",
    description: "Learn faster with practical paths built around real career goals.",
    icon: Layers3,
  },
  {
    title: "Resume Builder",
    description: "Create a professional resume using our built-in resume builder.",
    action: "Build Resume",
    icon: FileText,
  },
  {
    title: "Showcase Work",
    description: "Showcase your projects in our community.",
    action: "Join ours",
    icon: Palette,
  },
  {
    title: "100K+",
    description: "Worldwide Active Users",
    icon: UsersRound,
  },
];

export const clientLogos = [
  "/landing/figma/client-1.png",
  "/landing/figma/client-2.png",
  "/landing/figma/client-3.png",
  "/landing/figma/client-4.png",
  "/landing/figma/client-5.png",
  "/landing/figma/client-6.png",
  "/landing/figma/client-1.png",
  "/landing/figma/client-2.png",
  "/landing/figma/client-3.png",
  "/landing/figma/client-4.png",
  "/landing/figma/client-5.png",
  "/landing/figma/client-6.png",
];

export const workSteps = [
  {
    number: "01",
    title: "Upload Your Portfolio",
    description: "Add your portfolio and learning history so Cinx can understand your current profile.",
  },
  {
    number: "02",
    title: "AI Scan & Skill Analysis",
    description: "AI scans your strengths and detects missing skills for the role you want.",
  },
  {
    number: "03",
    title: "Personalized Roadmap",
    description: "Get a roadmap with courses, portfolio actions, and career next steps.",
  },
];

export const showcaseItems = [
  {
    name: "Floyd Miles",
    role: "Graphics Designer",
    image: "/landing/figma/showcase-1.png",
    icon: PlayCircle,
  },
  {
    name: "Brooklyn Simmons",
    role: "UIUX Designer",
    image: "/landing/figma/showcase-2.png",
    icon: PlayCircle,
  },
  {
    name: "Wade Warren",
    role: "Software Developer",
    image: "/landing/figma/showcase-3.png",
    icon: PlayCircle,
  },
];

export const faqs = [
  {
    question: "How do I start learning on Cinx?",
    answer:
      "Create an account, choose a course that matches your goal, and follow each lesson with notes, files, and progress tracking.",
  },
  {
    question: "Can Cinx help me choose the right course?",
    answer:
      "Yes. You can explore by category, search by skill, and use learning paths to find courses that fit your current level.",
  },
  {
    question: "How is my course progress tracked?",
    answer:
      "Cinx keeps your enrolled courses, completed lessons, watch progress, notes, and certificates in your learning dashboard.",
  },
  {
    question: "Can instructors publish courses on Cinx?",
    answer:
      "Instructors can create course drafts, organize sections and lessons, upload resources, then submit courses for review before publishing.",
  },
  {
    question: "Do courses include files, subtitles, and certificates?",
    answer:
      "Course creators can include downloadable files, subtitles, quizzes, assignments, and completion certificates depending on the course.",
  },
];

export const footerGroups = [
  {
    title: "Platform",
    links: ["Courses", "Skillsets", "Roadmaps", "Showcase"],
  },
  {
    title: "Company",
    links: ["About", "Careers", "Contact", "FAQ"],
  },
  {
    title: "Resources",
    links: ["Blog", "Community", "Help Center", "Instructor Guide"],
  },
];
