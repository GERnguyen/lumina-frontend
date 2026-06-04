import type { Metadata } from "next";
import { CoursesPage } from "@/components/courses/CoursesPage";

export const metadata: Metadata = {
  title: "Courses",
  description:
    "Explore Lumina courses with filters for category, tools, rating, level, price, and duration.",
  alternates: {
    canonical: "/courses",
  },
};

export default function Page() {
  return <CoursesPage />;
}
