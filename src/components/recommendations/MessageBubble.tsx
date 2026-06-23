"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Bot,
  User,
  Loader2,
  BookOpen,
  FileText,
  Sparkles,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getCourseImage, money } from "@/lib/format";
import type { ChatMessage, LearningPathProposalResponse } from "@/types";
import { Markdown } from "./MarkdownRenderer";

interface MessageBubbleProps {
  msg: ChatMessage;
  isStreaming: boolean;
  activeProposal: LearningPathProposalResponse | null;
  onSendMessage: (text: string) => void;
  onSelectProposal: (proposal: LearningPathProposalResponse) => void;
}

export function MessageBubble({
  msg,
  isStreaming,
  activeProposal,
  onSendMessage,
  onSelectProposal,
}: MessageBubbleProps) {
  const isBot = msg.role === "assistant";

  return (
    <div
      className={cn(
        "flex gap-4",
        isBot ? "justify-start" : "justify-end"
      )}
    >
      {isBot && (
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#EBEBFF] text-[#564FFD]">
          <Bot className="size-4" />
        </div>
      )}

      <div className="flex flex-col gap-3 max-w-[80%]">
        {/* Message Bubble content */}
        {msg.content && (
          <div
            className={cn(
              "rounded-[20px] px-5 py-3 text-sm leading-6 shadow-sm",
              isBot
                ? "bg-white text-[#1C1E23] border border-[#EBEBFF]"
                : "bg-[#7872FD] text-white"
            )}
          >
            {isBot ? (
              <Markdown text={msg.content} />
            ) : (
              <p className="whitespace-pre-line text-white">{msg.content}</p>
            )}
          </div>
        )}

        {/* Rendering Part types */}
        {msg.parts.map((part) => {
          if (part.partType === "course_list") {
            return (
              <div
                key={part.partId}
                className="rounded-[18px] border border-[#E9EAF0] bg-white p-4 space-y-3"
              >
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#7872FD] flex items-center gap-1.5">
                  <BookOpen className="size-3.5" /> Gợi ý các khóa học
                </h4>
                {part.status === "created" && (
                  <div className="flex items-center gap-2 text-xs text-[#8C94A3]">
                    <Loader2 className="size-3.5 animate-spin" /> Đang tìm kiếm khóa học phù hợp...
                  </div>
                )}
                {part.courses && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {part.courses.map((course) => {
                      const price = course.discountedPrice ?? course.price;
                      return (
                        <div
                          key={course.id}
                          className="flex gap-3 border border-[#E9EAF0] p-3 rounded-[14px] hover:border-[#D8D6FF] transition bg-[#FAFAFD]"
                        >
                          <div className="relative size-16 shrink-0 overflow-hidden rounded-[8px] bg-[#F5F7FA]">
                            <Image
                              src={getCourseImage(course, 0)}
                              alt={course.title || ""}
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1 flex flex-col justify-between">
                            <h5 className="text-xs font-semibold text-[#1D2026] line-clamp-2 leading-4">
                              {course.title}
                            </h5>
                            <div className="flex items-center justify-between text-[11px] text-[#6E7485]">
                              <span className="font-semibold text-[#564FFD]">
                                {money(price)}
                              </span>
                              <Link
                                href={`/courses/${course.id}`}
                                className="text-[#7872FD] font-semibold hover:underline"
                                target="_blank"
                              >
                                Chi tiết
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          if (part.partType === "policy_result") {
            return (
              <div
                key={part.partId}
                className="rounded-[18px] border border-[#E9EAF0] bg-[#FFF4E5] p-4 text-sm text-[#4D1E10]"
              >
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#ff6b3d] flex items-center gap-1.5 mb-2">
                  <FileText className="size-3.5" /> Tài liệu/Quy định tham khảo
                </h4>
                <div className="text-xs text-[#4D1E10]">
                  <Markdown text={part.result?.content || part.content || ""} />
                </div>
              </div>
            );
          }

          if (part.partType === "learning_path") {
            const proposal = part.proposal || activeProposal;
            if (!proposal) return null;

            const isCreated = proposal.status === "CREATED";

            return (
              <div
                key={part.partId}
                className="rounded-[18px] border border-[#EBEBFF] bg-white p-5 space-y-3 shadow-sm hover:border-[#D8D6FF] transition"
              >
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#7872FD] flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-[#FD8E1F]" /> Đề xuất lộ trình học tập
                </h4>
                <div className="bg-[#F8F8FF] border border-[#EBEBFF] rounded-[14px] p-4">
                  <h5 className="text-sm font-semibold text-[#1D2026]">
                    {proposal.title}
                  </h5>
                  <p className="text-xs text-[#6E7485] mt-1.5 line-clamp-2 leading-relaxed">
                    {proposal.description}
                  </p>
                  <div className="mt-3 text-xs font-medium text-[#7872FD]">
                    {proposal.items?.length || 0} bài học
                  </div>
                </div>

                {!isCreated ? (
                  <button
                    onClick={() => onSelectProposal(proposal)}
                    disabled={isStreaming}
                    className="w-full h-10 rounded-xl bg-[#EBEBFF] text-[#564FFD] hover:bg-[#7872FD] hover:text-white transition text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Sparkles className="size-3.5" /> Xem & Chỉnh sửa lộ trình
                  </button>
                ) : (
                  <div className="flex items-center justify-center gap-1.5 py-2 text-xs text-[#27ae60] font-semibold bg-[#E7F7ED] rounded-xl border border-[#BBF7D0]">
                    <Check className="size-4" /> Đã lưu lộ trình học tập này
                  </div>
                )}
              </div>
            );
          }

          return null;
        })}

        {/* Citations references */}
        {msg.citations.length > 0 && (
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="text-[#8C94A3] self-center">Tham khảo:</span>
            {msg.citations.map((cite, cIdx) => (
              <a
                key={cIdx}
                href={cite.sourceUrl || "#"}
                className="rounded-full bg-[#EBEBFF] px-2.5 py-1 font-medium text-[#564FFD] hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {cite.title || `Nguồn ${cIdx + 1}`}
              </a>
            ))}
          </div>
        )}

        {/* Suggested reply actions */}
        {msg.actions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {msg.actions.map((act, aIdx) => (
              <button
                key={aIdx}
                onClick={() => onSendMessage(act.payload)}
                disabled={isStreaming}
                className="rounded-full border border-[#D8D6FF] bg-white px-4 py-1.5 text-xs font-semibold text-[#564FFD] shadow-sm transition hover:bg-[#F4F4FF] hover:border-[#7872FD] disabled:opacity-50"
              >
                {act.label}
              </button>
            ))}
          </div>
        )}

        <span className="text-[10px] text-[#8C94A3] self-start mt-1">
          {msg.timestamp}
        </span>
      </div>

      {!isBot && (
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#7872FD] text-white">
          <User className="size-4" />
        </div>
      )}
    </div>
  );
}
