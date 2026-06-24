import { UserApi } from "@/services/api/user-api";
import { InstructorProfileClient } from "@/components/instructor/InstructorProfileClient";
import type { Metadata } from "next";
import { getProfileAvatar } from "@/lib/format";

export const metadata: Metadata = {
  title: "Thông tin cá nhân - Giảng viên",
  description: "Cài đặt tài khoản cá nhân dành cho giảng viên Cinx.",
};

export default async function Page() {
  const userRes = await UserApi.getCurrentUser().catch((err) => {
    console.error("Failed to load current user for instructor profile:", err);
    return { data: undefined };
  });

  const user = userRes?.data;

  if (!user) {
    return (
      <div className="p-8 text-center bg-white border border-gray-200 rounded-lg">
        <p className="text-sm font-semibold text-gray-500">
          Không thể tải thông tin tài khoản. Vui lòng đăng nhập lại.
        </p>
      </div>
    );
  }

  // Pre-process user profile data
  const profileData = {
    id: user.userId || "",
    name: user.name || "",
    email: user.email || "",
    username: user.email?.split("@")[0] || user.name?.toLowerCase().replace(/\s+/g, ".") || "",
    bio: user.bio || "",
    avatar: getProfileAvatar(user),
  };

  return <InstructorProfileClient user={profileData} />;
}
