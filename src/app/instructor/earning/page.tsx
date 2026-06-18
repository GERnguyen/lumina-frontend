import type { Metadata } from "next";
import { Suspense } from "react";
import { InstructorEarningClientPage } from "@/components/instructor/InstructorClientShell";

export const metadata: Metadata = {
  title: "Earning - Lumina Instructor",
  description: "Track instructor revenue, enrollment trends, and top-performing courses on Lumina.",
  alternates: {
    canonical: "/instructor/earning",
  },
};

export default function InstructorEarningRoute() {
  return (
    <Suspense fallback={null}>
      <InstructorEarningClientPage />
    </Suspense>
  );
}
