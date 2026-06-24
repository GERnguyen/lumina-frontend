import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CoursesFooter } from "@/components/courses/CoursesFooter";
import { CoursesTopNav } from "@/components/courses/CoursesTopNav";
import { AIAssistant } from "@/components/recommendations/AIAssistant";
import { getServerAccessToken } from "@/lib/server-auth";

export const metadata: Metadata = {
  title: "AI Career Assistant - Cinx",
  description: "Chat with Cinx AI Assistant to build custom learning roadmaps and find courses.",
};

export default async function AIAssistantPage() {
  const token = await getServerAccessToken();
  if (!token) {
    redirect("/login?returnUrl=%2Fai-assistant");
  }

  return (
    <main className="min-h-screen bg-white">
      <CoursesTopNav />
      <div className="bg-[#FAFAFD]">
        <AIAssistant />
      </div>
      <CoursesFooter />
    </main>
  );
}
