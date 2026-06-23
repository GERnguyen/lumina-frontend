import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { CoursesFooter } from "@/components/courses/CoursesFooter";
import { CoursesTopNav } from "@/components/courses/CoursesTopNav";
import { getServerAccessToken } from "@/lib/server-auth";
import { LearningPathsClient } from "@/components/learning-paths/LearningPathsClient";

export const metadata: Metadata = {
  title: "My Learning Paths - Lumina",
  description: "Track your active learning path, view past plans, and create custom IT tracks.",
  alternates: {
    canonical: "/learning-paths",
  },
};

export default async function Page() {
  try {
    const token = await getServerAccessToken();
    if (!token) {
      redirect("/login?returnUrl=%2Flearning-paths");
    }

    return (
      <LearningPathsClient
        header={<CoursesTopNav />}
        footer={<CoursesFooter />}
      />
    );
  } catch (error: any) {
    if (isRedirectError(error)) {
      throw error;
    }
    const status = error?.response?.status || error?.status;
    if (status === 401) {
      redirect("/login?returnUrl=%2Flearning-paths&error=session_expired");
    }
    throw error;
  }
}
