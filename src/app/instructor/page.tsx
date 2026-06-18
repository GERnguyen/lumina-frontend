import type { Metadata } from "next";
import { InstructorDashboardClientPage } from "@/components/instructor/InstructorClientShell";

export const metadata: Metadata = {
  title: "Instructor Dashboard - Lumina",
  description: "Manage courses, revenue, learner activity, and profile progress on Lumina.",
  alternates: {
    canonical: "/instructor",
  },
};

export default function InstructorPage() {
  return <InstructorDashboardClientPage />;
}
