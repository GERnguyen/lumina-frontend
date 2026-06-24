import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CoursesFooter } from "@/components/courses/CoursesFooter";
import { CoursesTopNav } from "@/components/courses/CoursesTopNav";
import { LearningPathsDashboard } from "@/components/recommendations/LearningPathsDashboard";
import { getServerAccessToken } from "@/lib/server-auth";

export const metadata: Metadata = {
  title: "My Learning Pathways - Cinx",
  description: "View and manage your AI-generated learning paths and track your study progression.",
};

export default async function LearningPathsPage() {
  const token = await getServerAccessToken();
  if (!token) {
    redirect("/login?returnUrl=%2Flearning-paths");
  }

  return (
    <main className="min-h-screen bg-white">
      <CoursesTopNav />
      <div className="bg-[#FAFAFD]">
        <LearningPathsDashboard />
      </div>
      <CoursesFooter />
    </main>
  );
}
