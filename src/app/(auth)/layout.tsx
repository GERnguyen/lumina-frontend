import React from "react";
import Header from "@/components/layouts/auth/Header";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 grid grid-cols-1">{children}</main>
    </div>
  );
}
