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
  { label: "Explore", href: "#explore" },
  { label: "Courses", href: "#courses" },
  { label: "Skillsets", href: "#skillsets" },
  { label: "Contact Us", href: "#contact" },
];

export const trustedLogos = ["Google", "IBM", "Microsoft", "Meta"];

export const courseTabs = [
  "UX / UI Designer",
  "Developer",
  "Project Manager",
  "Designer",
  "Accountant",
  "Support",
];

export type LandingCourse = {
  title: string;
  category: string;
  price: string;
  image: string;
  students: string;
  icon: LucideIcon;
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
    description: "Add your portfolio and learning history so Lumina can understand your current profile.",
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
    question: "How do I create an account on the job board?",
    answer:
      "Use the signup flow, enter your basic information, verify your email, and start building your learner profile.",
  },
  {
    question: "How do I apply for a job through the platform?",
    answer:
      "Search by skill, target role, or preferred location, then use your profile and portfolio to apply with stronger context.",
  },
  {
    question: "How can I track the status of my job applications?",
    answer:
      "Application updates and learning progress are kept in your dashboard so you can follow every next step.",
  },
  {
    question: "How do I create an account on the job board?",
    answer:
      "Use the search bar on the homepage to enter keywords related to your skills, job title, or preferred location. You can also use advanced filters to narrow down results by industry, job type, and experience level.",
  },
  {
    question: "Is there a cost to use the job board, and what features are free?",
    answer:
      "Core discovery and learning features are available to get started. Premium courses and advanced career features can be added later.",
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
