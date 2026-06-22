"use client";

import { InstructorFooter } from "@/components/instructor/InstructorDashboardWidgets";
import { InstructorSettingsForm } from "@/components/instructor/InstructorSettingsForm";
import { InstructorSidebar } from "@/components/instructor/InstructorSidebar";
import { InstructorTopbar } from "@/components/instructor/InstructorTopbar";
import { getProfileAvatar } from "@/lib/format";
import type { UserDto } from "@/types";

type InstructorSettingsPageProps = {
  user: UserDto;
};

export function InstructorSettingsPage({ user }: InstructorSettingsPageProps) {
  const shellUser = {
    name: user.name || "Lumina Instructor",
    email: user.email,
    avatar: getProfileAvatar(user, "Lumina Instructor"),
    role: user.role,
  };

  return (
    <div className="instructor-shell min-h-screen bg-[#F5F7FA] text-[#1D2026]">
      <div className="flex min-h-screen">
        <InstructorSidebar activeItem="settings" />

        <main className="min-w-0 flex-1">
          <InstructorTopbar user={shellUser} title="Settings" />

          <div className="mx-auto flex w-full max-w-[1640px] flex-col gap-6 px-5 py-6 sm:px-8 2xl:px-40">
            <InstructorSettingsForm user={user} />
            <InstructorFooter />
          </div>
        </main>
      </div>
    </div>
  );
}
