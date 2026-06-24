"use client";

import React from "react";
import { Compass } from "lucide-react";

interface EmptyStateProps {
  onSendMessage: (text: string) => void;
}

export function EmptyState({ onSendMessage }: EmptyStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center max-w-md mx-auto py-12">
      <Compass className="size-12 text-[#7872FD] animate-soft-float" />
      <h3 className="mt-4 text-lg font-semibold text-[#1C1E23]">Design your professional roadmap</h3>
      <p className="mt-2 text-sm text-[#373A41] leading-6">
        Tell me what technology stack or role you want to learn (e.g., "Tôi muốn học Spring Boot Java trong 2 tháng"), and I will build you a dynamic pathway with active course integration.
      </p>
      <div className="mt-6 flex flex-wrap gap-2 justify-center">
        <button
          onClick={() => onSendMessage("Tôi muốn học backend Java trong 2 tháng")}
          className="rounded-full border border-[#E9EAF0] bg-[#FAFAFD] px-4 py-2 text-xs font-semibold text-[#1C1E23] transition hover:border-[#7872FD] hover:bg-[#F4F4FF]"
        >
          "Backend Java trong 2 tháng"
        </button>
        <button
          onClick={() => onSendMessage("Hãy gợi ý cho tôi lộ trình trở thành React Developer chuyên nghiệp")}
          className="rounded-full border border-[#E9EAF0] bg-[#FAFAFD] px-4 py-2 text-xs font-semibold text-[#1C1E23] transition hover:border-[#7872FD] hover:bg-[#F4F4FF]"
        >
          "Lộ trình React Developer"
        </button>
      </div>
    </div>
  );
}
