import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/LandingPage";
import { StudentHomePage } from "@/components/home/StudentHomePage";
import { getServerAccessToken } from "@/lib/server-auth";
import { getStudentHomeData } from "@/services/home-service";

export const metadata: Metadata = {
  title: "Lumina - Career-focused online learning",
  description:
    "Lumina helps learners discover courses, build skills, create career roadmaps, and showcase projects for IT career growth.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Lumina - Career-focused online learning",
    description:
      "Discover practical courses, AI career roadmaps, portfolio showcase tools, and instructor-led learning on Lumina.",
    url: "/",
    siteName: "Lumina",
    type: "website",
  },
};

export default async function Home() {
  const token = await getServerAccessToken();
  if (!token) {
    return <LandingPage />;
  }

  const data = await getStudentHomeData();

  return <StudentHomePage data={data} />;
}
