import type { Metadata } from "next";
import { UserProfileDashboardPage } from "@/components/user-profile/UserProfileDashboardPage";
import { getUserProfileDashboard } from "@/services/user-profile-service";

export const metadata: Metadata = {
  title: "Dashboard - Lumina",
  description: "View your Lumina learning dashboard, enrolled courses, progress, and profile overview.",
  alternates: {
    canonical: "/user-profile",
  },
};

export default async function Page() {
  const { dashboard } = await getUserProfileDashboard();

  return <UserProfileDashboardPage dashboard={dashboard} />;
}
