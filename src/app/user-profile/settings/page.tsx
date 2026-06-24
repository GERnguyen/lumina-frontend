import type { Metadata } from "next";
import { UserProfileSettingsPage } from "@/components/user-profile/UserProfileSettingsPage";
import { UserApi } from "@/services/api/user-api";
import { getProfileTabs, mockUserProfileDashboard } from "@/data/user-profile";
import { getProfileAvatar } from "@/lib/format";

export const metadata: Metadata = {
  title: "Profile Settings",
  description: "Update your Cinx account profile and password settings.",
  alternates: {
    canonical: "/user-profile/settings",
  },
};

export default async function Page() {
  const userRes = await UserApi.getCurrentUser().catch(() => ({ data: undefined }));
  const user = userRes.data;

  const fallbackUser = mockUserProfileDashboard.user;
  const isFallback = !user;

  const name = user?.name || fallbackUser.name;
  const username = user?.email?.split("@")[0] || name.toLowerCase().replace(/\s+/g, ".");

  const settingsPage = {
    user: {
      id: user?.userId,
      name,
      fullName: name,
      username,
      email: user?.email || "learner@cinx.local",
      headline: user?.role === "INSTRUCTOR" ? "Instructor on Cinx" : user?.bio || fallbackUser.headline,
      avatar: getProfileAvatar(user),
      bio: user?.bio || "",
    },
    tabs: getProfileTabs("Settings"),
  };

  return <UserProfileSettingsPage settingsPage={settingsPage} isFallback={isFallback} />;
}
