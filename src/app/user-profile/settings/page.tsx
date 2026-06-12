import type { Metadata } from "next";
import { UserProfileSettingsPage } from "@/components/user-profile/UserProfileSettingsPage";
import { getUserProfileSettings } from "@/services/user-profile-service";

export const metadata: Metadata = {
  title: "Profile Settings",
  description: "Update your Lumina account profile and password settings.",
  alternates: {
    canonical: "/user-profile/settings",
  },
};

export default async function Page() {
  const { settingsPage, isFallback } = await getUserProfileSettings();

  return <UserProfileSettingsPage settingsPage={settingsPage} isFallback={isFallback} />;
}
