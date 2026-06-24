import React from "react";
import { redirect } from "next/navigation";
import { UserApi } from "@/services/api/user-api";
import { InstructorLayoutClient } from "@/components/instructor/InstructorLayoutClient";

export default async function Layout({ children }: { children: React.ReactNode }) {
  // Fetch current user from server-side token cookies
  const userRes = await UserApi.getCurrentUser().catch((err) => {
    console.error("Auth verify failed in instructor layout:", err);
    return { data: undefined };
  });

  const user = userRes?.data;

  // Authentication check
  if (!user) {
    redirect("/login");
  }

  // Authorization check - only allow INSTRUCTOR or ADMIN roles
  if (user.role !== "INSTRUCTOR" && user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <InstructorLayoutClient user={user}>
      {children}
    </InstructorLayoutClient>
  );
}
