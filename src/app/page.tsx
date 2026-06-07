import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/LandingPage";

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

export default function Home() {
  return <LandingPage />;
}
