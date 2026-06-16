import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { InstructorDashboardPage } from "@/components/instructor/InstructorDashboardPage";
import { getServerAccessToken } from "@/lib/server-auth";
import { getInstructorDashboardData } from "@/services/instructor-dashboard-service";

export const metadata: Metadata = {
  title: "Instructor Dashboard - Lumina",
  description: "Manage courses, revenue, learner activity, and profile progress on Lumina.",
  alternates: {
    canonical: "/instructor",
  },
};

export default async function InstructorPage() {
  const token = await getServerAccessToken();
  if (!token) redirect("/login");

  const data = await getInstructorDashboardData();
  if (data.user.role && data.user.role !== "INSTRUCTOR") {
    redirect("/courses");
  }

  return <InstructorDashboardPage data={data} />;
}
