import { CoursesFooter } from "@/components/courses/CoursesFooter";
import type { UserProfileSettingsData } from "@/data/user-profile";
import { UserProfileHero } from "./UserProfileHero";
import { UserProfileSettingsForm } from "./UserProfileSettingsForm";
import { UserProfileTopNav } from "./UserProfileTopNav";

export function UserProfileSettingsPage({ settingsPage, isFallback }: { settingsPage: UserProfileSettingsData; isFallback?: boolean }) {
  return (
    <main className="min-h-screen bg-white">
      <UserProfileTopNav avatar={settingsPage.user.avatar} />
      <UserProfileHero dashboard={settingsPage} />

      <section className="px-6 py-10 lg:px-8">
        <div className="mx-auto max-w-[1320px]">
          <div className="flex items-center gap-3">
            {isFallback ? (
              <span className="rounded-full bg-[#FFF4E5] px-3 py-1 text-xs font-semibold text-[#B85C00]">
                Mock fallback
              </span>
            ) : null}
          </div>
          <UserProfileSettingsForm settings={settingsPage} />
        </div>
      </section>

      <CoursesFooter />
    </main>
  );
}
