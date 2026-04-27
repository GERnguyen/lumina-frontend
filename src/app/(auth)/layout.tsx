import React from "react";
import Header from "@/components/layouts/auth/Header";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Sử dụng màu nền gray nhẹ từ bảng màu của em
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Một Header đơn giản chỉ có Logo để người dùng tập trung vào Form */}
      <Header />
      
     <main className="flex-1 grid grid-cols-1">
        {children}
      </main>
    </div>
  );
}
