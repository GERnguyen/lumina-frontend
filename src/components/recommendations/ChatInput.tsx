"use client";

import React, { useState } from "react";
import { Send, Loader2 } from "lucide-react";

interface ChatInputProps {
  isStreaming: boolean;
  onSendMessage: (text: string) => void;
}

export function ChatInput({ isStreaming, onSendMessage }: ChatInputProps) {
  const [inputMessage, setInputMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isStreaming) return;
    onSendMessage(inputMessage);
    setInputMessage("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-[#E9EAF0] p-4 bg-[#F8F9FD] flex items-center gap-3"
    >
      <input
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        disabled={isStreaming}
        className="flex-1 rounded-[16px] border border-[#E9EAF0] bg-white px-4 py-3 text-sm text-[#1D2026] placeholder:text-[#8C94A3] focus:border-[#7872FD] focus:ring-0 focus:outline-none transition disabled:opacity-55"
        placeholder={isStreaming ? "Đang phản hồi..." : "Đặt câu hỏi về lộ trình của bạn..."}
      />
      <button
        type="submit"
        disabled={!inputMessage.trim() || isStreaming}
        className="inline-flex size-11 items-center justify-center rounded-[16px] bg-[#564FFD] text-white transition hover:bg-[#4338CA] disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
      >
        {isStreaming ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <Send className="size-5" />
        )}
      </button>
    </form>
  );
}
