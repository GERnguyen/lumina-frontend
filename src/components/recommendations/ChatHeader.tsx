"use client";

import React from "react";
import { Bot } from "lucide-react";

interface ChatHeaderProps {
  sessionId: string | null;
}

export function ChatHeader({ sessionId }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-[#E9EAF0] px-6 py-4 bg-[#F8F9FD]">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-[#EBEBFF] text-[#564FFD]">
          <Bot className="size-5" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-[#1D2026]">AI Career Assistant</h2>
          <p className="text-xs text-[#6E7485]">Streaming powered pathway generation</p>
        </div>
      </div>
      {sessionId && (
        <span className="rounded-full bg-[#E7F7ED] px-2.5 py-1 text-[11px] font-medium text-[#19703E]">
          Session Active
        </span>
      )}
    </div>
  );
}
