import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { CoursesFooter } from "@/components/courses/CoursesFooter";
import { CoursesTopNav } from "@/components/courses/CoursesTopNav";
import { getServerAccessToken } from "@/lib/server-auth";
import { LearningPathDetailClient } from "@/components/learning-paths/LearningPathDetailClient";

export const metadata: Metadata = {
  title: "Learning Path Detail - Cinx",
  description: "View details and progress of your custom learning roadmap.",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  try {
    const token = await getServerAccessToken();
    if (!token) {
      redirect(`/login?returnUrl=%2Flearning-paths%2F${id}`);
    }

    return (
      <LearningPathDetailClient
        id={id}
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
      redirect(`/login?returnUrl=%2Flearning-paths%2F${id}&error=session_expired`);
    }
    throw error;
  }
}
