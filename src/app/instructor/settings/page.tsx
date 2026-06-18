import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { InstructorSettingsPage } from "@/components/instructor/InstructorSettingsPage";
import { getServerAccessToken } from "@/lib/server-auth";
import { UserApi } from "@/services/api/user-api";

export const metadata: Metadata = {
  title: "Instructor Settings - Lumina",
  description: "Update instructor profile, social links, notifications, and password settings.",
  alternates: {
    canonical: "/instructor/settings",
  },
};

export default async function InstructorSettingsRoute() {
  const token = await getServerAccessToken();
  if (!token) redirect("/login");

  const userRes = await UserApi.getCurrentUser().catch(() => ({ data: undefined }));
  const user = userRes.data;

  if (!user) redirect("/login");
  if (user.role !== "INSTRUCTOR") redirect("/courses");

  return <InstructorSettingsPage user={user} />;
}
