import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { CoursesFooter } from "@/components/courses/CoursesFooter";
import { CoursesTopNav } from "@/components/courses/CoursesTopNav";
import { getServerAccessToken } from "@/lib/server-auth";
import { LearningPathCreateClient } from "@/components/learning-paths/LearningPathCreateClient";

export const metadata: Metadata = {
  title: "Create Learning Path - Cinx",
  description: "Create a custom learning roadmap with chosen lessons from your courses.",
  alternates: {
    canonical: "/learning-paths/create",
  },
};

export default async function Page() {
  try {
    const token = await getServerAccessToken();
    if (!token) {
      redirect("/login?returnUrl=%2Flearning-paths%2Fcreate");
    }

    return (
      <LearningPathCreateClient
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
      redirect("/login?returnUrl=%2Flearning-paths%2Fcreate&error=session_expired");
    }
    throw error;
  }
}
